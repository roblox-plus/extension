/*
	roblox/inventory.js [03/12/2017]
*/
var Roblox = Roblox || {};

Roblox.inventory = (function () {
	function loadUserCollectibleAssets(userId, assetTypeId, cursor) {
		return new Promise(function (resolve, reject) {
			$.get("https://inventory.roblox.com/v1/users/" + userId + "/assets/collectibles", { assetType: assetTypeId, cursor: cursor || "", sortOrder: "Asc", limit: 100 }).done(function (r) {
				if (r.nextPageCursor) {
					loadUserCollectibleAssets(userId, assetTypeId, r.nextPageCursor).then(function (extraData) {
						resolve(r.data.concat(extraData));
					}, reject);
				} else {
					resolve(r.data);
				}
			}).fail(function (e) {
				reject(JSON.parse(e.responseText));
			});
		});
	}

	return {
		userHasAsset: $.promise.cache(function (resolve, reject, userId, assetId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/ownership/hasasset", { userId: userId, assetId: assetId }).done(function (r) {
				resolve(r);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000,
			queued: true
		}),

		getCollectibles: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			var rejected = false;
			var completed = 0;
			var collectibles = [];
			var combinedValue = 0;

			Roblox.catalog.collectibleAssetTypeIds.forEach(function (assetTypeId) {
				loadUserCollectibleAssets(userId, assetTypeId).then(function (data) {
					data.forEach(function (userAsset) {
						userAsset.assetTypeId = assetTypeId;
						combinedValue += userAsset.recentAveragePrice || 0;
					});
					collectibles = collectibles.concat(data);
					if (++completed == Roblox.catalog.collectibleAssetTypeIds.length) {
						collectibles.sort(function (a, b) {
							if (a.assetId == b.assetId) {
								return a.userAssetId - b.userAssetId;
							}
							return a.assetId - b.assetId;
						});

						resolve({
							combinedValue: combinedValue,
							collectibles: collectibles
						});
					}
				}, function (err) {
					if (!rejected) {
						rejected = true;
						reject(err);
					}
				});
			});
		}, {
			rejectExpiry: 10 * 1000,
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		}),

		delete: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.post("https://assetgame.roblox.com/asset/delete-from-inventory", { assetId: assetId }).done(function () {
				resolve();
			}).fail(function () {
				reject([]);
			});
		}, {
			rejectExpiry: 1000,
			resolveExpiry: 1000
		})
	};
})();

Roblox.inventory = $.addTrigger($.promise.background("Roblox.inventory", Roblox.inventory));

// WebGL3D
