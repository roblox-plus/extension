/*
	roblox/avatar.js [03/23/2017]
*/
var Roblox = Roblox || {};

Roblox.avatar = (function () {
	return {
		getAvatarAppearance: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get("https://avatar.roblox.com/v1/users/" + userId + "/avatar").done(function (r) {
				var assets = [];
				r.assets.forEach(function (asset) {
					assets.push({
						id: asset.id,
						name: asset.name,
						assetType: asset.assetType.name,
						assetTypeId: asset.assetType.id
					});
				});
				resolve({
					assets: assets,
					bodyColors: r.bodyColors,
					avatarType: r.playerAvatarType,
					avatarScale: r.scales
				});
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 10 * 1000,
			rejectExpiry: 5 * 1000
		}),

		setBodyColors: $.promise.cache(function (resolve, reject, bodyColorMap) {
			if (typeof (bodyColorMap) != "object") {
				reject([{
					code: 0,
					message: "Invalid bodyColorMap"
				}]);
				return;
			}

			$.post("https://avatar.roblox.com/v1/avatar/set-body-colors", {
				headColorId: bodyColorMap.headColorId,
				torsoColorId: bodyColorMap.torsoColorId,
				rightArmColorId: bodyColorMap.rightArmColorId,
				leftArmColorId: bodyColorMap.leftArmColorId,
				rightLegColorId: bodyColorMap.rightLegColorId,
				leftLegColorId: bodyColorMap.leftLegColorId
			}).done(function (r) {
				resolve();
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 250,
			rejectExpiry: 500
		}),

		wearAsset: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.post("https://avatar.roblox.com/v1/avatar/assets/" + assetId + "/wear").done(function (r) {
				resolve();
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 250,
			rejectExpiry: 500
		}),
		removeAsset: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.post("https://avatar.roblox.com/v1/avatar/assets/" + assetId + "/remove").done(function (r) {
				resolve();
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 250,
			rejectExpiry: 500
		})
	};
})();

Roblox.avatar = $.addTrigger($.promise.background("Roblox.avatar", Roblox.avatar));

// WebGL3D
