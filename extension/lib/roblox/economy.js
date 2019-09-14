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

				$.get("https://economy.roblox.com/v1/users/" + authenticatedUserId + "/currency").done(function(r) {
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
			if (typeof (expectedPrice) != "number" || expectedPrice < 0 || Math.floor(expectedPrice) !== expectedPrice) {
				reject([{
					code: 0,
					message: "Invalid expectedPrice"
				}]);
				return;
			}

			Roblox.catalog.getProductInfo(productId).then(function (product) {
				if ((!product.isFree && expectedPrice === 0) || (!product.isForSale && expectedPrice > 0)) {
					reject([{
						code: 0,
						message: "Asset is not for sale."
					}]);
					return;
				}
				if ((expectedPrice === 0 && !product.isFree) || product.robuxPrice !== expectedPrice) {
					reject([{
						code: 0,
						message: "Price changed"
					}]);
					return;
				}

				$.post("https://www.roblox.com/API/Item.ashx?rqtype=purchase&expectedSellerID=" + product.creator.agentId + "&productID=" + product.id + "&expectedCurrency=1&expectedPrice=" + expectedPrice).done(function (receipt) {
					console.log("Product purchased\n\tReceipt:", receipt);
					if (receipt.TransactionVerb !== "bought") {
						reject([{
							code: 1,
							message: receipt.title
						}]);
						return;
					}
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
