/*
	roblox/develop.js [04/29/2017]
*/
var Roblox = Roblox || {};

Roblox.develop = (function () {
	return {
		canManage: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				if (authenticatedUserId <= 0) {
					resolve(false);
					return;
				}

				$.get("https://api.roblox.com/users/" + authenticatedUserId + "/canmanage/" + assetId).done(function (r) {
					resolve(r.CanManage);
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 5 * 1000,
			queued: true
		})
	};
})();

Roblox.develop = $.addTrigger($.promise.background("Roblox.develop", Roblox.develop));

// WebGL3D
