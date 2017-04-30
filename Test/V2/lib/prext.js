// prext.js [3/8/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
browser = (function (userAgentInfo) {
	var wholeVersion = userAgentInfo[2].split(".");
	return {
		name: userAgentInfo[1],
		version: userAgentInfo[2],
		wholeVersion: Number(wholeVersion[0]) || 0,
		userAgent: navigator.userAgent,
		userAgentMatch: userAgentInfo[0]
	};
})(navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)\/([\d.]+)/i) || ["Unknown", "0.0"]);

ext = {
	"id": chrome.runtime.id,
	"manifest": chrome.runtime.getManifest(),
	"incognito": chrome.extension.inIncognitoContext,
	"isBackground": location.protocol.startsWith("chrome-extension"),
	"isContentScript": !location.protocol.startsWith("chrome-extension"),

	"getUrl": function (path) {
		return chrome.extension.getURL(path);
	},

	tabs: {},
	update: function (cb) {
		cb = fixCB(cb);
		if (browser.name == "Chrome") {
			chrome.runtime.requestUpdateCheck(function (m) {
				cb(m == "update_available");
			});
		} else {
			cb(false);
		}
	}
};

console.log(ext.manifest.name + " " + ext.manifest.version + " started" + (ext.incognito ? " in icognito" : ""));



/*
	inter process communication
	ipc.send("request name", { data }, function(response){ });
	ipc.on("request name", function(data, callBack, senderTabId) { });
	ipc.on("message", function(data, callBack, 
*/
ipc = (function () {
	// A lot of this code is hard to follow, and all over the place.
	// Comment for future self: try not to edit this.
	var connected = true;
	var pendingResponse = {};
	var duplicateCatch = {};
	var queue = ext.isBackground ? null : [];
	var thisTab = 0;
	var tabs = [];

	var generateIdBase = 0;
	function generateId() {
		return (+new Date) + "_" + (++generateIdBase);
	}

	var ipc = $.addTrigger({
		isConnected: function () {
			return connected;
		},
		getTabs: function () {
			return tabs;
		}
	});

	function doSend(sendData) {
		if (!ext.isBackground || sendData.tab === thisTab) {
			if (sendData.tab === thisTab) {
				ipc.trigger("message-internal", sendData, thisTab);
			} else {
				try {
					chrome.runtime.sendMessage(sendData);
				} catch (e) {
					console.warn(ext.manifest.name + " has been disconnected from the background.\n\tRefresh the page to reconnect if the extension is still running.");
				}
			}
		} else {
			chrome.tabs.sendMessage(sendData.tab, sendData);
		}
	}

	ipc.send = function (request, data, callBack, tab) {
		if (!connected) {
			return "";
		}
		if (typeof (data) == "string") {
			data = {
				request: data
			};
		} else if (typeof (data) != "object") {
			return "";
		}

		var id = generateId();
		if (typeof (callBack) == "function") {
			pendingResponse[id] = callBack;
		}
		tab = Number(tab) || 0;

		var sendData = {
			id: id,
			data: data,
			tab: tab,
			request: request
		};

		if (queue) {
			queue.push(sendData);
		} else {
			doSend(sendData);
		}

		return id;
	};


	ipc.on("message-internal", function (data, senderTabId) {
		if (data.isResponse) {
			ipc.trigger("response", data.id, data.data);
		} else {
			var responseHandler = function () {
				doSend({
					isResponse: true,
					id: data.id,
					data: global.parseArguments(arguments),
					tab: senderTabId
				});
			};
			ipc.trigger(data.request, data.data, responseHandler, senderTabId);
			ipc.trigger("message", data.data, responseHandler, senderTabId);
		}
	});

	ipc.on("response", function (id, data) {
		if (pendingResponse[id]) {
			pendingResponse[id].apply(ipc, data);
			delete pendingResponse[id];
		}
	});
	

	chrome.runtime.onMessage.addListener(function(data, sender, callBack){
		if(sender.id != ext.id || typeof(data) != "object"){
			return;
		}

		if(data.ping){
			if(tabs.indexOf(sender.tab.id) < 0){
				tabs.push(sender.tab.id);
			}
			callBack(sender.tab.id);
			return;
		}

		if (typeof (data.id) == "string" && typeof (data.tab) == "number" && typeof (data.data) == "object") {
			ipc.trigger("message-internal", data, sender.tab ? sender.tab.id : 0);
		}
	});

	if (ext.isBackground) {
		chrome.tabs.onRemoved.addListener(function (tabId) {
			var tabIndex = tabs.indexOf(tabId);
			if (tabIndex >= 0) {
				tabs.splice(tabIndex, 1);
			}
		});
	} else {
		chrome.runtime.sendMessage({
			ping: true
		}, function (tabId) {
			thisTab = tabId;
			while (queue.length) {
				doSend(queue.shift());
			}
			queue = null;
		});
	}

	ipc.pendingResponses = function () {
		return pendingResponse;
	};

	return ipc;
})();

// ipc.backgroundFunction
(function(){
	ipc.backgroundFunction = function (path, func) {
		func.functionPath = path;
		if (ext.isBackground) {
			return func;
		} else {
			var retFunc = function () {
				var args = [];
				var callBack;
				var callBackPosition = -1;
				for (var n = 0; n < arguments.length; n++) {
					if (typeof (arguments[n]) == "function") {
						callBack = arguments[n];
						callBackPosition = n;
						args.push("callBack");
					} else {
						args.push(arguments[n]);
					}
				}
				ipc.send("ipc.backgroundFunction", {
					args: args,
					path: path,
					callBackPosition: callBackPosition
				}, callBack || function () { });
			};
			retFunc.functionPath = path;
			return retFunc;
		}
	};

	if (ext.isBackground) {
		ipc.on("ipc.backgroundFunction", function (data, callBack) {
			var path = data.path.split(".");
			var func = window;
			var namespace = this;
			while (path.length) {
				func = func[path.shift()];
				if (path.length == 1) {
					namespace = func;
				}
			}
			if (data.callBackPosition >= 0) {
				data.args.splice(data.callBackPosition, 1, callBack);
			}
			func.apply(namespace, data.args);
		});
	}
})();

// $.addTrigger.broadcast
$.addTrigger.init(function (obj) {
	if (!obj.getNamespace()) {
		return;
	}

	var broadcastKey = "$.jquery.trigger.broadcast." + obj.getNamespace();

	obj.broadcast = function () {
		if (!obj.isConnected()) {
			return obj;
		}

		var data = global.parseArguments(arguments);
		if (ext.isBackground) {
			obj.trigger.apply(obj, arguments);
			ipc.getTabs().forEach(function (id) {
				ipc.send(broadcastKey, data, undefined, id);
			});
		} else {
			ipc.send(broadcastKey, data);
		}

		return obj;
	};

	ipc.on(broadcastKey, function (data, callBack, sender) {
		if (ext.isBackground) {
			obj.broadcast.apply(obj, data);
		} else {
			obj.trigger.apply(obj, data);
		}
	});
});



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
						chrome.runtime.sendMessage(r);
					} else {
						chrome.tabs.sendMessage(a.tab, r);
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
				chrome.tabs.sendMessage(tab, arg);
			}
		} else {
			try {
				if (request.connected) {
					chrome.runtime.sendMessage(arg);
				}
			} catch (e) {
				request.connected = false;
				console.warn(ext.manifest.name + " has been disconnected from the background\n\tRefresh to reconnect");
			}
		}
	},
	sent: function (cb) { if (isCB(cb)) { request.sent.cb.push(cb); } },

	backgroundFunction: function (path, func) {
		func.functionPath = path;
		if (ext.isBackground) {
			return func;
		} else {
			var retFunc = function () {
				var args = [];
				var callBack;
				var callBackPosition = -1;
				for (var n = 0; n < arguments.length; n++) {
					if (typeof (arguments[n]) == "function") {
						callBack = arguments[n];
						callBackPosition = n;
						args.push("callBack");
					} else {
						args.push(arguments[n]);
					}
				}
				request.send({
					request: "request.backgroundFunction",
					args: args,
					path: path,
					callBackPosition: callBackPosition
				}, callBack || function () { });
			};
			retFunc.functionPath = path;
			return retFunc;
		}
	}
};

request.sent.cb = [];
request.id.num = 0;


chrome.runtime.onMessage.addListener(function (a, b, c, d) {
	if (a.requestId) {
		a.tab = b.tab ? b.tab.id : -1;
		request.handle(a);
	}
});

if (ext.isBackground) {
	request.sent(function (data, callBack, tab) {
		if (data.request == "request.backgroundFunction") {
			var path = data.path.split(".");
			var func = window;
			var namespace = this;
			while (path.length) {
				func = func[path.shift()];
				if (path.length == 1) {
					namespace = func;
				}
			}
			if (data.callBackPosition >= 0) {
				data.args.splice(data.callBackPosition, 1, callBack);
			}
			func.apply(namespace, data.args);
		}
	});
}



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
		if (browser.name == "Chrome") {
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
			icon: type(a.icon) == "string" && a.icon ? a.icon : ext.getUrl(ext.manifest.icons['48']),
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

if (ext.isBackground) {
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
					} else if (browser.name == "Chrome") {
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

		if (browser.name == "Chrome") {
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

	if (browser.name == "Chrome") {
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
	chrome.runtime.onMessage.addListener(function (a, b, callBack) {
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
	enabled: chrome.hasOwnProperty("tts") || (browser.name == "Chrome" && ext.manifest.permissions.indexOf("tts") >= 0),
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
						chrome.tts.speak(cut, {
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
			chrome.tts.stop();
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
	$(window).on("unload", function () {
		if (ext.tts.reading) {
			ext.tts.stop();
		}
	});
}



/* Reloading */
if (ext.isBackground) {
	$(window).on("unload", function () {
		ext.reload();
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
		if (browser.name == "Chrome") {
			foreach(notification.list, function (n) { chrome.notifications.clear(n, function () { }); });
		}
		chrome.runtime.reload();
	} else {
		fixCB(callBack)(false);
	}
};
ext.reload.enabled = browser.name == "Chrome";



// WebGL3D
