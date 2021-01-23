/*
	roblox/economy.js [04/30/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Economy = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.economy");

		this.register([
			this.getCurrencyBalance,
			this.purchaseProduct,
			this.getPremiumPayouts
		]);
	}

	getCurrencyBalance() {
		return CachedPromise(`${this.serviceId}.getCurrencyBalance`, (resolve, reject) => {
			Roblox.users.getAuthenticatedUser().then((user) => {
				if (!user) {
					reject([Roblox.api.errorCodes.generic.unauthorized]);
					return;
				}

				$.get(`https://economy.roblox.com/v1/users/${user.id}/currency`).done((r) => {
					let robuxHistory = window.RPlus && window.RPlus.robuxHistory;
					if (robuxHistory) {
						robuxHistory.recordAuthenticatedUserRobux(r.robux).then((recorded) => {
							// Robux recorded pretty much
						}).catch(e => {
							console.warn("recordAuthenticatedUserRobux failure", e);
						});
					}

					resolve({
						robux: r.robux
					});
				}).fail(Roblox.api.$reject(reject));
			}).catch(reject);
		}, [], {});
	}

	purchaseProduct(productId, expectedPrice) {
		return QueuedPromise(`${this.serviceId}.purchaseProduct`, (resolve, reject) => {
			if (typeof (expectedPrice) != "number" || expectedPrice < 0 || Math.floor(expectedPrice) !== expectedPrice) {
				reject([
					{
						code: 0,
						message: "Invalid expectedPrice"
					}
				]);

				return;
			}

			Roblox.catalog.getProductInfo(productId).then(function (product) {
				if ((!product.isFree && expectedPrice === 0) || (!product.isForSale && expectedPrice > 0)) {
					reject([
						{
							code: 0,
							message: "Asset is not for sale."
						}
					]);

					return;
				}
				if ((expectedPrice === 0 && !product.isFree) || product.robuxPrice !== expectedPrice) {
					reject([
						{
							code: 0,
							message: "Price changed"
						}
					]);

					return;
				}

				$.post("https://economy.roblox.com/v1/purchases/products/" + product.id, {
					expectedCurrency: 1,
					expectedPrice: expectedPrice,
					expectedSellerId: product.creator.agentId
				}).done(function (receipt) {
					console.log("Product purchased\n\tReceipt:", receipt);
					if (receipt.transactionVerb !== "bought") {
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
		});
	}

	getPremiumPayouts(universeId, startDate, endDate) {
		return CachedPromise(`${this.serviceId}.getPremiumPayouts`, (resolve, reject) => {
			$.get("https://engagementpayouts.roblox.com/v1/universe-payout-history", {
				startDate: startDate,
				endDate: endDate,
				universeId: universeId
			}).done(data => {
				let results = [];
				for (let date in data) {
					if (data[date].eligibilityType !== "Eligible") {
						continue;
					}

					results.push({
						date: date,
						payoutInRobux: data[date].payoutInRobux,
						type: data[date].payoutType
					});
				}

				resolve(results);
			}).catch(Roblox.api.$reject(reject));
		}, [universeId, startDate, endDate], {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 60 * 1000
		});
	}
};

Roblox.economy = new Roblox.Services.Economy();

// WebGL3D
