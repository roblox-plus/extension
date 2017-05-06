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
		}),

		purchaseProduct: $.promise.cache(function (resolve, reject, productId, expectedPrice) {
			if (typeof (expectedPrice) != "number" || expectedPrice <= 0) {
				reject([{
					code: 0,
					message: "Invalid expectedPrice"
				}]);
				return;
			}

			Roblox.catalog.getProductInfo(productId).then(function (product) {
				if (!product.isForSale) {
					reject([{
						code: 0,
						message: "Asset does not have valid product."
					}]);
					return;
				}
				if (product.robuxPrice != expectedPrice) {
					reject([{
						code: 0,
						message: "Price changed"
					}]);
					return;
				}

				$.post("https://www.roblox.com/API/Item.ashx?rqtype=purchase&expectedSellerID=" + product.creator.agentId + "&productID=" + product.id + "&expectedCurrency=1&expectedPrice=" + expectedPrice).done(function (receipt) {
					console.log("Product purchased\n\tReceipt:", receipt);
					resolve(product);
				}).fail(function (jxhr, errors) {
					var message = "HTTP Request Failed";
					try {
						var data = JSON.parse(jxhr.responseText);
						message = data.errorMsg || message;
					} catch (e) {
					}
					reject([{
						code: 0,
						message: message
					}]);
				});
			}, reject);
		}, {
			queued: true
		})
	};
})();

Roblox.economy = $.addTrigger($.promise.background("Roblox.economy", Roblox.economy));

// WebGL3D
