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

ext = (function () {
	let extension = Extension.Singleton;

	return {
		"id": extension.id,
		"manifest": extension.manifest,
		"incognito": extension.isIncognito,
		"isBackground": extension.executionContextType === Extension.ExecutionContextTypes.background,
		"isContentScript": extension.executionContextType === Extension.ExecutionContextTypes.tab,
		"isBrowserAction": extension.executionContextType === Extension.ExecutionContextTypes.browserAction,

		"getUrl": function(path) {
			return extension.getUrl(path);
		},
		
		reload: function (callBack) {
			ipc.send("ext:reload", {}, callBack);
		}
	};
})();

console.log(ext.manifest.name + " " + ext.manifest.version + " started" + (ext.incognito ? " in icognito" : ""));



/*
	inter process communication
	ipc.send("request name", { data }, function(response){ }[, tab]);
	ipc.on("request name", function(data, callBack, senderTabId) { });
	ipc.on("message", function(data, callBack, -- why didn't I finish this doc?
*/
ipc = (function () {
	// A lot of this code is hard to follow, and all over the place.
	// Comment for future self: try not to edit this.
	var connected = true;
	var pendingResponse = {};
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

		if (data.ping) {
			if (tabs.indexOf(sender.tab.id) < 0) {
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
			ipc.send("storage.", { request: "storage", method: "get", key: k }, cb);
		}
	}
};

if (ext.isBackground) {
	ipc.on("storage.", function (a, callBack) {
		if (a.request == "storage") {
			if (a.method == "get") {
				storage.get(a.key, callBack);
			}
		}
	});
}

/* Reloading */
if (ext.isBackground) {
	$(window).on("unload", function () {
		ext.reload(function () { });
		return "No";
	});
}
ipc.on("ext:reload", function (data, callBack) {
	callBack(true);
	if (ext.manifest.permissions.includes("contextMenus")) {
		chrome.contextMenus.removeAll(function() {
			chrome.runtime.reload();
		});
	} else {
		setTimeout(function () {
			chrome.runtime.reload();
		}, 500);
	}
});
ext.reload.enabled = true;



// WebGL3D
