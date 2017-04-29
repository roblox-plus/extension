/*
	roblox/content.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).content = (function () {
	var contentMap = {};

	var getAssetContentUrl = $.promise.cache(function (resolve, reject, assetId) {
		if (typeof (assetId) != "number" || assetId <= 0) {
			reject([{
				code: 0,
				message: "Invalid assetId"
			}]);
			return;
		}

		if (contentMap.hasOwnProperty(assetId)) {
			resolve(contentMap[assetId]);
			return;
		}

		$.get("https://assetgame.roblox.com/asset/", { id: assetId, contentCheck: "RPlus" }).always(function () {
			if (contentMap.hasOwnProperty(assetId)) {
				resolve(contentMap[assetId]);
			} else {
				reject([{
					code: 0,
					message: "Lookup failed"
				}]);
			}
		});
	}, {
		resolveExpiry: 15 * 1000,
		rejectExpiry: 10 * 1000,
		queued: true
	});



	if (ext.isBackground) {
		chrome.webRequest.onBeforeRedirect.addListener(function (details) {
			var id = Number((details.url.match(/id=(\d+)/i) || ["", 0])[1]);
			contentMap[id] = details.redirectUrl;
		}, { urls: ["https://assetgame.roblox.com/asset/?id=*&contentCheck=RPlus"], types: ["xmlhttprequest"] });
	}

	return {
		getAssetContentUrl: getAssetContentUrl
	};
})();

Roblox.content = $.addTrigger($.promise.background("Roblox.content", Roblox.content));

// WebGL3D
