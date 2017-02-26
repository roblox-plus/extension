// prext.js [3/8/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
if (window.chrome) { window.browser = window.chrome; } else if (!window.hasOwnProperty("browser")) { window.browser = {}; }
ext = {
	"id": chrome.runtime.id,
	"manifest": chrome.runtime.getManifest(),
	"incognito": chrome.extension.inIncognitoContext,
	"isBackground": location.protocol.startsWith("chrome-extension"),
	"isContentScript": !location.protocol.startsWith("chrome-extension"),

	"getUrl": function (path) {
		return chrome.extension.getURL(path);
	},

	browser: navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)\/([\d.]+)/i) || [],
	tabs: {},
	update: function (cb) {
		cb = fixCB(cb);
		if (ext.browser.name == "Chrome") {
			chrome.runtime.requestUpdateCheck(function (m) {
				cb(m == "update_available");
			});
		} else {
			cb(false);
		}
	},
	beforeUnload: function (cb) {
		if (isCB(cb)) {
			if (!ext.beforeUnload.cb.length) {
				window.onbeforeunload = function () {
					for (var n in ext.beforeUnload.cb) {
						ext.beforeUnload.cb[n]();
					}
				};
			}
			ext.beforeUnload.cb.push(cb);
		}
	}
};

ext.browser = {
	name: ext.browser[1] || "unknown",
	version: ext.browser[2] || "0"
};

foreach(["name", "version"], function (n, o) { ext[o] = ext.manifest[o]; });

ext.beforeUnload.cb = [];

console.log("Incognito: " + ext.incognito);



/* Requests */
request = {
	cb: {},
	id: function () { return getMil() + "_" + (++request.id.num); },
	connected: true,
	handle: function (a, s) {
		if (a.hasOwnProperty("response")) {
			a.response = JSON.parse(a.response)[0];
			foreach(request.cb[a.requestId], function (n, o) { o(a.response, a.finished ? a.tab : true); });
			if (a.finished) {
				delete request.cb[a.requestId];
			}
		} else {
			foreach(request.sent.cb, function (n, o) {
				o(a.arg, function (r, c) {
					r = { requestId: a.requestId, response: JSON.stringify([r]) };
					if (!c) { r.finished = true; }
					if (s) {
						r.tab = -2;
						request.handle(r);
					} else if (a.tab == -1) {
						browser.runtime.sendMessage(r);
					} else {
						browser.tabs.sendMessage(a.tab, r);
					}
				}, a.tab);
			});
		}
	},
	send: function (arg, callBack, tab) {
		arg = { requestId: request.id(), arg: arg };
		if (isCB(callBack)) {
			request.cb[arg.requestId] = request.cb[arg.requestId] || [];
			request.cb[arg.requestId].push(callBack);
		}
		if (tab || ext.isBackground) {
			if (ext.isContentScript || type(tab) != "number") {
				arg.tab = -2;
				request.handle(arg, true);
			} else {
				browser.tabs.sendMessage(tab, arg);
			}
		} else {
			try {
				if (request.connected) {
					browser.runtime.sendMessage(arg);
				}
			} catch (e) {
				request.connected = false;
				console.warn(ext.name + " has been disconnected from the background\n\tRefresh to reconnect");
			}
		}
	},
	sent: function (cb) { if (isCB(cb)) { request.sent.cb.push(cb); } }
};

request.sent.cb = [];
request.id.num = 0;


browser.runtime.onMessage.addListener(function (a, b, c, d) {
	if (a.requestId) {
		a.tab = b.tab ? b.tab.id : -1;
		request.handle(a);
	}
});



/* Tabs */
if (ext.isBackground) {
	request.sent(function (a, cb, t) {
		if (a.request == "tab") {
			if (ext.tabs[t]) {
				clearTimeout(ext.tabs[t]);
			}
			ext.tabs[t] = setTimeout(function () {
				delete ext.tabs[t];
			}, 3000);
		}
	});
} else if (ext.isContentScript) {
	setInterval(request.send, 1000, { request: "tab" });
}

if (ext.browser.name == "Firefox" && ext.isBackground) {
	window.open = function (u) {
		browser.tabs.create({ url: u }, function (t) {
			browser.windows.update(t.windowId, { focused: true });
		});
	};
}



/* Notifications */
notification = {
	id: function () { return (+new Date()) + "_" + (++notification.id.num); },
	server: {},
	client: {},
	properties: {
		"sound": function (a, note) {
			a = type(a) == "string" ? { src: a, volume: .5 } : (type(a) == "object" ? { src: type(a.src) == "string" ? a.src : "", volume: type(a.volume) == "number" ? a.volume : .5 } : { src: "", volume: .5 });
			if (a.src) {
				var s = soundService(a.src).volume(a.volume).play();
				note.close(function () { s.stop(); });
			}
		},
		"speak": function (a, note) {
			var speaking = true;
			ext.tts.speak(a, function (s) { speaking = false; });
			note.close(function () { if (speaking) { ext.tts.stop(); } });
		},
		"url": function (a, note) {
			var close = type(a) == "object" ? a.close : false;
			var u = type(a) == "object" ? a.url : a;
			note.click(function () {
				window.open(u);
				if (close) {
					note.close();
				}
			});
		},
		"expiration": function (a, note) {
			if (type(a) == "number") {
				setTimeout(note.close, a);
			}
		}
	},

	permission: function (callBack) {
		callBack = fixCB(callBack);
		if (ext.browser.name == "Chrome") {
			chrome.notifications.getPermissionLevel(function (permitted) { callBack(permitted == "granted"); });
		} else {
			callBack(Notification.permission == "granted");
			return Notification.permission == "granted";
		}
	},
	clear: function () {
		foreach(notification.client, function (n, o) {
			o.close();
		});
	},

	event: function (id, e, arg) {
		if (type(arg) != "array") {
			arg = [];
			for (var CN = 2; CN < arguments.length; CN++) { arg.push(arguments[CN]); }
		}
		var note = notification.server[id];
		if (note && note.events[e]) { for (var n in note.events[e]) { note.events[e][n].apply(this, arg); } }
		var note = notification.client[id];
		if (note && note.events[e]) { for (var n in note.events[e]) { note.events[e][n].apply(this, arg); } }
	},

	create: function (a) {
		if (type(a) != "object") {
			console.error("First argument on notification.create must be object");
			return;
		}

		var ret; ret = {
			id: "",
			header: type(a.header) == "string" && a.header ? a.header : "Notification",
			lite: type(a.lite) == "string" ? a.lite : "",
			icon: type(a.icon) == "string" && a.icon ? a.icon : ext.manifest.icons['48'],
			image: "",
			items: {},
			buttons: [],
			progress: type(a.progress) == "number" ? a.progress : -1,

			closed: false,
			clickable: !!a.clickable,
			events: {
				close: [function () {
					ret.closed = true;
					delete notification.client[ret.id];
				}],
				click: [],
				button1Click: [],
				button2Click: []
			},

			close: function (cb) {
				if (isCB(cb)) {
					ret.events.close.push(cb);
				} else {
					request.send({ request: "notification", method: "close", id: ret.id });
				}
				return ret;
			}
		};

		for (var CN = 0; CN < (type(a.buttons) == "array" ? a.buttons.length : 0) ; CN++) {
			var o = a.buttons[CN];
			if (type(o) == "object" && type(o.text) == "string") {
				ret.buttons.push({ text: o.text, icon: type(o.icon) == "string" ? o.icon : "" });
			} else if (type(o) == "string") {
				ret.buttons.push({ text: o, icon: "" });
			}
			if (ret.buttons.length >= 2) {
				break;
			}
		}

		if (type(a.items) == "object") {
			foreach(a.items, function (n, o) {
				if (type(n) == "string" && type(o) == "string") {
					ret.items[n] = o;
				}
			});
		}

		foreach(["click", "button1Click", "button2Click"], function (n, o) {
			ret[o] = function (cb) {
				if (isCB(cb)) {
					ret.events[o].push(cb);
				}
				return ret;
			};
		});

		request.send({
			request: "notification",
			header: ret.header,
			lite: ret.lite,
			icon: ret.icon,
			items: ret.items,
			image: ret.image,
			progress: ret.progress,
			buttons: ret.buttons,
			tag: type(a.tag) == "string" ? a.tag : "",
			clickable: ret.clickable
		}, function (e) {
			if (type(e) == "string") {
				if (ret.id = e) {
					notification.client[e] = ret;
					foreach(notification.properties, function (n, o) {
						if (a.hasOwnProperty(n)) {
							o(a[n], ret);
						}
					});
				} else {
					ret.close();
				}
			} else {
				notification.event(ret.id, e.event);
			}
		});

		if (ret.progress < 0) {
			ret.progress = 0;
		}

		return ret;
	}
};
notification.id.num = 0;
notify = notification.create;

if (ext.browser.name == "Firefox" && ext.isContentScript) {
	request.sent(function (a, callBack) {
		if (a.request == "notification") {
			if (a.method == "close") {
				if (notification.server[a.id]) {
					notification.server[a.id].close();
				}
			} else {
				if (Notification.permission != "granted") {
					setTimeout(callBack, 500, { method: "close" });
					return;
				}
				foreach(a.items, function (n, o) { a.lite += "\n" + n + ": " + o; });
				var note = new Notification(a.header, {
					body: a.lite,
					icon: a.icon,
					tag: a.tag
				});
				var clicked = false;
				note.onclick = function (e) {
					clicked = true;
					e.preventDefault();
					callBack({ method: "click" }, true);
				};
				note.onclose = function () {
					if (!clicked) {
						callBack({ method: "close" });
					}
				};
				notification.server[a.tag] = note;
			}
		}
	});
	notification.permission(function (granted) {
		if (!granted) {
			Notification.requestPermission();
		}
	});
} else if (ext.isBackground) {
	request.sent(function (a, callBack) {
		if (a.request != "notification") { return; }
		if (a.method == "close") {
			if (notification.server[a.id]) {
				notification.server[a.id].close();
			}
			return;
		}
		var id = a.tag || notification.id();
		var note; note = {
			id: id,
			header: a.header,
			lite: a.lite,
			icon: a.icon,
			image: a.image,
			items: a.items,
			buttons: a.buttons,
			progress: Math.max(a.progress, 0),

			clickable: a.clickable,
			events: {
				close: [function () {
					callBack({ event: "close" });
					delete notification.server[id];
				}],
				click: [],
				button1Click: [],
				button2Click: []
			},

			close: function (cb) {
				if (isCB(cb)) {
					note.events.close.push(cb);
				} else {
					if (note.tab) {
						request.send({ request: "notification", method: "close", id: id }, _, tab);
					} else if (ext.browser.name == "Chrome") {
						chrome.notifications.clear(id, function () { });
						notification.event(id, "close");
					}
				}
				return note;
			}
		};
		if (notification.server[id]) { notification.server[id].close(); }
		foreach(["click", "button1Click", "button2Click"], function (n, o) {
			note[o] = function (cb) {
				if (isCB(cb)) {
					note.events[o].push(cb);
				} else {
					var arg = [];
					for (var CN = 0; CN < arguments.length; CN++) { arg.push(arguments[CN]); }
					notification.event(id, o, arg);
				}
				return note;
			};
			note.events[o].push(function () { callBack({ event: o }, true); });
		});
		notification.server[id] = note;

		if (ext.browser.name == "Firefox") {
			note.tab = Number(Object.keys(ext.tabs)[0]);
			if (note.tab) {
				request.send({
					request: "notification",
					header: note.header,
					lite: note.lite,
					icon: note.icon,
					tag: id,
					items: note.items
				}, function (e) {
					notification.event(id, e.method);
				}, note.tab);
				callBack(id);
			} else {
				callBack("");
			}
		} else if (ext.browser.name == "Chrome") {
			var cre = {
				type: a.progress >= 0 ? "progress" : (note.image ? "image" : (Object.keys(note.items).length ? "list" : "basic")),
				title: note.header,
				contextMessage: note.lite,
				iconUrl: note.icon,
				priority: 2,
				isClickable: note.clickable,
				message: "",
				buttons: []
			};
			if (cre.type == "progress") {
				cre.progress = note.progress;
			} else if (cre.type == "image") {
				cre.imageUrl = note.image;
			} else if (cre.type == "list") {
				cre.items = [];
				foreach(note.items, function (n, o) {
					cre.items.push({ title: n, message: o });
				});
			}
			for (var n in note.buttons) {
				cre.buttons.push({ title: note.buttons[n].text, iconUrl: note.buttons[n].icon });
			}
			notification.permission(function (granted) {
				if (!granted) {
					callBack(id);
					return;
				}
				chrome.notifications.create(id, cre, function () {
					callBack(id);
				});
			});
		}
	});

	if (ext.browser.name == "Chrome") {
		chrome.notifications.onClicked.addListener(function (id) {
			if (notification.server[id]) {
				notification.server[id].click();
			}
		});
		chrome.notifications.onClosed.addListener(function (id, u) {
			if (notification.server[id] && u) {
				notification.server[id].close();
			}
		});
		chrome.notifications.onButtonClicked.addListener(function (id, b) {
			b = 'button' + (b + 1) + 'Click';
			if (notification.server[id] && notification.server[id][b]) {
				notification.server[id][b]();
			}
		});
	}
}

if (ext.isBackground) {
	browser.runtime.onMessage.addListener(function (a, b, callBack) {
		if (a.notification == "get") {
			callBack(notification.server);
		} else if (a.notification == "close" && notification.server[a.id]) {
			notification.server[a.id].close();
		} else if ((a.notification == "button1Click" || a.notification == "button2Click" || a.notification == "click") && notification.server[a.id]) {
			notification.server[a.id][a.notification]();
		}
	});
}



/* storage */
storage = {
	get: function (k, cb) {
		if (ext.isBackground) {
			cb = fixCB(cb);
			if (type(k) == "string") {
				try {
					k = JSON.parse(localStorage.getItem(k));
					k = k.length ? k[0] : "";
				} catch (e) {
					k = "";
				}
				cb(k);
				return k;
			} else if (type(k) == "array") {
				var ret = {};
				foreach(k, function (n, o) { ret[o] = storage.get(o); });
				cb(ret);
				return ret;
			}
		} else {
			request.send({ request: "storage", method: "get", key: k }, cb);
		}
	},
	set: function (k, v, cb) {
		if (ext.isBackground) {
			if (type(k) == "string") {
				cb = fixCB(cb);
				localStorage.setItem(k, JSON.stringify([v]));
				foreach(storage.updated.cb, function (n, o) { o(k, v); });
				cb(true);
				return true;
			} else if (type(k) == "object") {
				cb = fixCB(v);
				foreach(k, function (n, o) { storage.set(n, o); });
				cb(true);
				return true;
			}
		} else {
			request.send({ request: "storage", method: "set", key: k, value: v }, cb);
		}
	},
	remove: function (k, cb) {
		if (ext.isBackground) {
			if (type(k) == "string") {
				localStorage.removeItem(k);
			} else if (type(k) == "array") {
				foreach(k, function (n, o) { storage.remove(o); });
			}
			fixCB(cb)(true);
			return true;
		} else {
			request.send({ request: "storage", method: "remove", key: k }, cb);
		}
	},
	updated: function (cb) {
		if (isCB(cb)) {
			storage.updated.cb.push(cb);
		}
	}
};
storage.updated.cb = [function (k, v) { for (var n in ext.tabs) { request.send({ request: "storage", key: k, value: v }, _, Number(n)); } }];

if (ext.isBackground) {
	request.sent(function (a, callBack) {
		if (a.request == "storage") {
			if (a.method == "get") {
				storage.get(a.key, callBack);
			} else if (a.method == "set") {
				if (type(a.key) == "object") {
					storage.set(a.key, callBack);
				} else if (type(a.key) == "string") {
					storage.set(a.key, a.value, callBack);
				}
			} else if (a.method == "remove") {
				storage.remove(a.key, callBack);
			}
		}
	});
} else {
	request.sent(function (a, callBack) {
		if (a.request == "storage" && type(a.key) == "string") {
			foreach(storage.updated.cb, function (n, o) { o(a.key, a.value); });
		}
	});
}



/* Text-to-Speech */
ext.tts = {
	reading: false,
	enabled: browser.hasOwnProperty("tts") || (ext.browser.name == "Chrome" && ext.manifest.permissions.indexOf("tts") >= 0),
	replacements: [
		[/\+/g, " plus "],
		[/WebGL\s*3D/gi, "WebGL 3D"],
		[/https?:\/\//gi, ""]
	],

	speak: function (arg, callBack) {
		callBack = fixCB(callBack);
		if (ext.isBackground && ext.tts.enabled) {
			arg = type(arg) == "string" ? { text: arg } : arg;
			if (type(arg) == "object" && type(arg.text) == "string") {
				ext.tts.reading = true;
				var p = pnow();
				var queue = [];
				ext.tts.replacements.forEach(function (o) { arg.text = arg.text.replace(o[0], o[1]); });
				while (arg.text.match(/\d+\.\d+/)) { arg.text = arg.text.replace(/(\d+)\.(\d+)/g, function (x, y, z) { return y + " point " + z; }); }
				arg.text.split(/\n{2,}/).forEach(function (t) {
					queue.push("");
					t.split(/([.!?\s]){1,150}/).forEach(function (o) {
						if (o) {
							if (queue[queue.length - 1].length + o.length > 150) {
								queue.push(o);
							} else {
								queue[queue.length - 1] += o;
							}
						}
					});
				});
				var playQueue; playQueue = function () {
					var cut = queue.shift();
					if (cut) {
						browser.tts.speak(cut, {
							gender: arg.hasOwnProperty("gender") ? arg.gender : (storage.get("voiceGender") == "female" ? "female" : "male"),
							lang: "en-GB",
							volume: type(arg.volume) == "number" ? arg.volume : (type(storage.get("voiceVolume")) == "number" ? storage.get("voiceVolume") : .5),
							onEvent: function (e) {
								if (e.type == "end") {
									playQueue();
								} else if (e.type == "interrupted") {
									callBack(0);
								}
							}
						});
					} else {
						callBack(pnow() - p);
					}
				};
				playQueue();
			} else {
				callBack(0);
			}
		} else if (ext.tts.enabled) {
			ext.tts.reading = true;
			request.send({ request: "tts", method: "speak", arg: arg }, callBack);
		} else {
			callBack(0);
		}
	},
	stop: function (callBack) {
		callBack = fixCB(callBack);
		if (ext.isBackground && ext.tts.enabled) {
			ext.tts.reading = false;
			browser.tts.stop();
			callBack(true);
		} else if (ext.tts.enabled) {
			request.send({ request: "tts", method: "stop" }, function (x) {
				ext.tts.reading = false;
				callBack(x);
			});
		} else {
			callBack(false);
		}
	}
};

if (ext.isBackground) {
	request.sent(function (a, callBack) {
		if (a.request == "tts" && a.method == "speak") {
			ext.tts.speak(a.arg, callBack);
		} else if (a.request == "tts" && a.method == "stop") {
			ext.tts.stop(callBack);
		}
	});
} else {
	ext.beforeUnload(function () {
		if (ext.tts.reading) {
			ext.tts.stop();
		}
	});
}



/* Reloading */
if (ext.isBackground) {
	ext.beforeUnload(function () { ext.reload(); });
} else if (ext.isContentScript && ext.browser.name == "Firefox") {
	ext.beforeUnload(function () {
		for (var n in notification.server) {
			notification.server[n].close();
		}
	});
}
request.sent(function (a, callBack) {
	if (a.request == "ext_reload") {
		callBack(true);
		setTimeout(ext.reload, 500);
	}
});
ext.reload = function (callBack) {
	if (ext.reload.enabled) {
		if (!ext.isBackground) {
			request.send({ request: "ext_reload" }, callBack);
			return;
		}
		if (ext.browser.name == "Chrome") {
			foreach(notification.list, function (n) { chrome.notifications.clear(n, function () { }); });
		}
		browser.runtime.reload();
	} else {
		fixCB(callBack)(false);
	}
};
ext.reload.enabled = ext.browser.name == "Chrome";



// WebGL3D
