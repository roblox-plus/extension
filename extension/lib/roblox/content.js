/*
	roblox/content.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).content = (function () {
	return {
		getAssetContentUrl: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.ajax({
				url: "https://assetdelivery.roblox.com/v1/assets/batch",
				type: "POST",
				data: [
					{
						"assetId": assetId,
						"requestId": "Roblox+"
					}
				],
				headers: {
					"Roblox-Browser-Asset-Request": "Roblox+"
				}
			}).done(function (r) {
				var location = r.length > 0 && r[0].location;
				if (location) {
					resolve(location);
				} else {
					reject([{
						code: 0,
						message: "Lookup failed"
					}]);
				}
			}).fail(function (e) {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		}),

		getAssetContents: $.promise.cache(function (resolve, reject, assetId) {
			Roblox.content.getAssetContentUrl(assetId).then(function (contentUrl) {
				$.get(contentUrl).done(function (r) {
					resolve(r);
				}).fail(function () {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}).catch(reject);
		}),

		getDependentAssets: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			Roblox.content.getAssetContents(assetId).then(function (r) {
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
			}).catch(reject);
		})
	};
})();

Roblox.content = $.addTrigger($.promise.background("Roblox.content", Roblox.content));

// WebGL3D
