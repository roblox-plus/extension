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

	function loadUserAssets(userId, assetTypeId, cursor, assetMap) {
		assetMap = assetMap || {};
		return new Promise(function (resolve, reject) {
			$.get("https://www.roblox.com/users/inventory/list-json", {
				assetTypeId: assetTypeId,
				itemsPerPage: 100,
				cursor: cursor || "",
				userId: userId
			}).done(function (data) {
				var assets = [];
				data.Data.Items.forEach(function (asset) {
					if (!assetMap.hasOwnProperty(asset.Item.AssetId) && !asset.UserItem.IsRentalExpired) {
						assetMap[asset.Item.AssetId] = asset;
						assets.push({
							id: asset.Item.AssetId,
							name: asset.Item.Name
						});
					}
				});
				if (data.Data.nextPageCursor) {
					loadUserAssets(userId, assetTypeId, data.Data.nextPageCursor, assetMap).then(function (moreAssets) {
						resolve(assets.concat(moreAssets));
					}, reject);
				} else {
					resolve(assets);
				}
			}).fail(function (xhr) {
				try {
					var data = JSON.parse(xhr.responseText);
					reject([
						{
							code: 0,
							message: data.Data || data.error || ""
						}
					]);
				} catch (e) {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				}
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

		userHasBadge: $.promise.cache(function (resolve, reject, userId, badgeId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}
			if (typeof (badgeId) != "number" || badgeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid badgeId"
				}]);
				return;
			}

			$.get("https://assetgame.roblox.com/Game/Badge/HasBadge.ashx", { UserID: userId, BadgeID: badgeId }).done(function (r) {
				resolve(r === "Success");
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
		}),

		getAssets: $.promise.cache(function (resolve, reject, userId, assetTypeId) {
			loadUserAssets(userId, assetTypeId).then(function (assets) {
				resolve(assets);
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			queued: true
		}),

		getAssetOwners: $.promise.cache(function (resolve, reject, assetId, cursor, sortOrder) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.get("https://inventory.roblox.com/v1/assets/" + assetId + "/owners", { cursor: cursor || "", sortOrder: sortOrder || "Asc", limit: 100 }).done(function (data) {
				resolve(data);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 30 * 1000,
			rejectExpiry: 10 * 1000
		}),

		getPlayerBadges: $.promise.cache(function (resolve, reject, userId, cursor) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get("https://badges.roblox.com/v1/users/" + userId + "/badges", {
				limit: 100,
				sortOrder: "Desc",
				cursor: cursor || ""
			}).done(function (r) {
				var response = {
					previousPageCursor: r.previousPageCursor,
					nextPageCursor: r.nextPageCursor,
					data: []
				};

				r.data.forEach(function (badge) {
					response.data.push({
						id: badge.id,
						name: badge.name
					});
				});

				resolve(response);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000,
			queued: true
		})
	};
})();

Roblox.inventory = $.addTrigger($.promise.background("Roblox.inventory", Roblox.inventory));

// WebGL3D
