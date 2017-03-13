/*
	roblox/inventory.js [03/12/2017]
*/
var Roblox = Roblox || {};

Roblox.inventory = {
	userHasAsset: $.promise.cache(function (resolve, reject, userId, assetId) {
		if (typeof (userId) != "number" || userId <= 0) {
			reject([{
				code: 0,
				message: "Invalid userId"
			}]);
		}
		if (typeof (assetId) != "number" || assetId <= 0) {
			reject([{
				code: 0,
				message: "Invalid assetId"
			}]);
		}

		$.get("https://api.roblox.com/ownership/hasasset", { userId: userId, assetId: assetId }).done(function (r) {
			// TODO: Investigate what comes out of this endpoint - bool, or string
			resolve(typeof (r) == "boolean" ? r : r == "true");
		}).fail(function () {
			reject([{
				code: 0,
				message: "HTTP request failed"
			}]);
		});
	}, {
		reject: 5 * 1000,
		resolve: 60 * 1000
	})
};

Roblox.inventory = $.addTrigger($.promise.background("Roblox.inventory", Roblox.inventory));

// WebGL3D
