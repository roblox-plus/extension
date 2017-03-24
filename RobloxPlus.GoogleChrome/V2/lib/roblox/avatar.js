/*
	roblox/avatar.js [03/23/2017]
*/
var Roblox = Roblox || {};

Roblox.avatar = (function () {
	return {
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
			}).fail(function () {
				reject(JSON.parse(e.responseText));
			});
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
			}).fail(function () {
				reject(JSON.parse(e.responseText));
			});
		})
	};
})();

Roblox.avatar = $.addTrigger($.promise.background("Roblox.avatar", Roblox.avatar));

// WebGL3D
