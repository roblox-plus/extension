/*
	roblox/economy.js [04/30/2017]
*/
var Roblox = Roblox || {};

Roblox.economy = (function () {
	return {
		getCurrencyBalance: $.promise.cache(function (resolve, reject) {
			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				if (authenticatedUserId <= 0) {
					reject([{
						code: 0,
						message: "Unauthorized"
					}]);
					return;
				}

				$.get("https://api.roblox.com/currency/balance").done(function (r) {
					resolve({
						robux: r.robux
					});
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			queued: true
		})
	};
})();

Roblox.economy = $.addTrigger($.promise.background("Roblox.economy", Roblox.economy));

// WebGL3D
