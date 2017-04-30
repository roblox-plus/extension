/*
	roblox/content.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).content = (function () {
	var contentMap = {};
	
	if (ext.isBackground) {
		chrome.webRequest.onBeforeRedirect.addListener(function (details) {
			var id = Number((details.url.match(/id=(\d+)/i) || ["", 0])[1]);
			contentMap[id] = details.redirectUrl;
		}, { urls: ["https://assetgame.roblox.com/asset/?id=*&contentCheck=RPlus"], types: ["xmlhttprequest"] });
	}

	return {
		getAssetContentUrl: $.promise.cache(function (resolve, reject, assetId) {
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
		}),
		getDependentAssets: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.get("https://assetgame.roblox.com/asset/", { id: assetId }).done(function (r) {
				var assetIds = [];
				(r.match(/"TextureI?d?".*=\s*\d+/gi) || r.match(/"TextureI?d?".*rbxassetid:\/\/\d+/gi) || []).forEach(function (id) {
					id = Number(id.match(/(\d+)$/)[1]);
					if (id && !assetIds.includes(id)) {
						assetIds.push(id);
					}
				});
				(r.match(/"MeshId".*=\s*\d+/gi) || r.match(/MeshId.*rbxassetid:\/\/\d+/gi) || []).forEach(function (id) {
					id = Number(id.match(/(\d+)$/)[1]);
					if (id && !assetIds.includes(id)) {
						assetIds.push(id);
					}
				});
				if (r.match(/^\d+;?/)) {
					r.split(";").forEach(function (id) {
						id = Number(id);
						if (id && !assetIds.includes(id)) {
							assetIds.push(id);
						}
					});
				} else {
					(r.match(/asset\/?\?\s*id\s*=\s*\d+/gi) || r.match(/rbxassetid:\/\/\d+/gi) || []).forEach(function (id) {
						id = Number(id.match(/(\d+)$/)[1]);
						if (id && !assetIds.includes(id)) {
							assetIds.push(id);
						}
					});
				}
				if (assetIds.length > 0) {
					var assets = [];
					var loaded = 0;
					assetIds.forEach(function (id) {
						Roblox.catalog.getAssetInfo(id).then(function (asset) {
							assets.push(asset);
							if (++loaded == assetIds.length) {
								resolve(assets);
							}
						}, function () {
							if (++loaded == assetIds.length) {
								resolve(assets);
							}
						});
					});
				} else {
					resolve([]);
				}
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		})
	};
})();

Roblox.content = $.addTrigger($.promise.background("Roblox.content", Roblox.content));

// WebGL3D
