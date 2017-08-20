var RPlus = RPlus || {};
RPlus.settings = RPlus.settings || (function () {
	var settingFields = { "updateLog": "", "serialTracker": true, "forumFloodCheck": 15, "checkPremiumOnServer": false };

	if (ext.isBackground) {
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
	}

	return {
		get: $.promise.cache(function (resolve, reject) {
			$.get("https://assetgame.roblox.com/asset/?id=311113112").done(function (r) {
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
		set: $.promise.cache(function (resolve, reject, arg) {
			if (type(arg) !== "object") {
				reject([{
					code: 0,
					message: "Expected arg to be object"
				}]);
				return;
			}
			this.get().then(function (oldSettings) {
				var ns = {};
				for (var n in settingFields) {
					if (typeof (settingFields[n]) === typeof (arg[n])) {
						ns[n] = arg[n];
					} else {
						ns[n] = oldSettings.hasOwnProperty(n) ? oldSettings[n] : settingFields[n];
					}
				}
				var upload = "<roblox" + encodeURIComponent(JSON.stringify(ns)) + "</roblox>";
				$.post("https://data.roblox.com/Data/Upload.ashx?assetid=311113112&type=Model&length=" + upload.length, upload).done(function (r) {
					resolve(ns);
				}).fail(function () {
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

RPlus.settings = $.addTrigger($.promise.background("RPlus.settings", RPlus.settings));

// WebGL3D
