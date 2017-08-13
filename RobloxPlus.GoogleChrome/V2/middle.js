// middle.js [4/4/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
rplusSettings = (function() {
	/* Upload models with a post request */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
		if (url.path(details.url) == "/Data/Upload.ashx") {
			var headers = {
				"User-Agent": "Roblox/WinInet",
				"Host": "data.roblox.com",
				"Accept": "*/*",
				"Accept-Encoding": "deflate, gzip",
				"Cookie": "",
				"Content-Type": "application/xml",
				"Requester": "Client",
				"Content-Length": url.param("length", details.url)
			};
			var newhead = [];
			for (var n in details.requestHeaders) {
				var na = details.requestHeaders[n].name;
				if (headers.hasOwnProperty(na)) {
					newhead.push({ name: na, value: headers[na] || details.requestHeaders[n].value });
					delete headers[na];
				}
			}
			for (var n in headers) {
				newhead.push({ name: n, value: headers[n] });
			}
			return { requestHeaders: newhead };
		}
	}, { urls: ["*://data.roblox.com/Data/*"] }, ["requestHeaders", "blocking"]);

	return {
		fields: { "updateLog": "", "serialTracker": true, "forumFloodCheck": 15, "checkPremiumOnServer": false },
		get: $.promise.cache(function(resolve, reject) {
			$.get("https://assetgame.roblox.com/asset/?id=311113112").done(function(r) {
				try {
					resolve(JSON.parse(decodeURIComponent(r.substring(7, r.length - 9))));
				} catch (e) {
					reject(e);
				}
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		}),
		set: $.promise.cache(function(resolve, reject, arg) {
			if (type(arg) !== "object") {
				reject([{
					code: 0,
					message: "Expected arg to be object"
				}]);
				return;
			}
			rplusSettings.get().then(function(oldSettings) {
				var ns = {};
				for (var n in rplusSettings.fields) {
					if (typeof (rplusSettings.fields[n]) === typeof (arg[n])) {
						ns[n] = arg[n];
					} else {
						ns[n] = oldSettings.hasOwnProperty(n) ? oldSettings[n] : rplusSettings.fields[n];
					}
				}
				var upload = "<roblox" + encodeURIComponent(JSON.stringify(ns)) + "</roblox>";
				$.post("https://data.roblox.com/Data/Upload.ashx?assetid=311113112&type=Model&length=" + upload.length, upload).done(function(r) {
					resolve(ns);
				}).fail(function() {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}).catch(reject);
		}, {
			resolveExpiry: 1 * 1000,
			rejectExpiry: 1 * 1000,
			queued: true
		})
	};
})();
rplusSettings = $.addTrigger($.promise.background("rplusSettings", rplusSettings));


Roblox.trades.openSettingBasedTradeWindow = function (userId, counterTradeId) {
	return new Promise(function (resolve, reject) {
		storage.get("tradeTab", function (on) {
			if (on) {
				Roblox.trades.openTradeTab(userId).then(resolve, reject);
			} else {
				Roblox.trades.openTradeWindow(userId).then(resolve, reject);
			}
		});
	});
};


forumService.youtube = $.promise.background("forumService.youtube", $.promise.cache(function (resolve, reject, v) {
	$.get("http://forum.roblox.plus/yt.php", { v: v }).done(function (r) {
		resolve(r.title);
	}).fail(function () {
		reject([{
			code: 0,
			message: "HTTP request failed"
		}]);
	});
}, {
	resolveExpiry: 24 * 60 * 60 * 1000,
	rejectExpiry: 15 * 1000,
	queued: true
}));



// WebGL3D
