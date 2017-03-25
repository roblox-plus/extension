/*
	roblox/avatar.js [03/23/2017]
*/
var Roblox = Roblox || {};

Roblox.trades = (function () {
	return {
		accept: $.promise.cache(function (resolve, reject, tradeId) {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			$.post("https://www.roblox.com/Trade/TradeHandler.ashx", { cmd: "maketrade", TradeID: tradeId }).done(function (r) {
				if (r.success) {
					resolve();
				} else {
					reject([{
						code: 0,
						message: r.msg
					}]);
				}
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		}),
		decline: $.promise.cache(function (resolve, reject, tradeId) {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			$.post("https://www.roblox.com/Trade/TradeHandler.ashx", { cmd: "decline", TradeID: tradeId }).done(function (r) {
				if (r.success) {
					resolve();
				} else {
					reject([{
						code: 0,
						message: r.msg
					}]);
				}
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		}),
		get: $.promise.cache(function (resolve, reject, tradeId) {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				$.post("https://www.roblox.com/Trade/TradeHandler.ashx", { "TradeID": tradeId, cmd: "pull" }).done(function (r) {
					try {
						r = JSON.parse(r.data);
					} catch (e) {
						reject([{
							code: 0,
							message: r.msg || "Failed to parse response JSON."
						}]);
						return;
					}
					var trade = {
						id: tradeId,
						status: r.StatusType == "Open" ? (r.AgentOfferList[0].AgentID == authenticatedUserId ? "Outbound" : "Inbound") : (r.StatusType == "Finished" ? "Completed" : r.StatusType),
						expiration: new Date(Number((r.Expiration.match(/\d+/) || [0])[0])).getTime(),
						offers: [],
						authenticatedUserOffer: {},
						tradePartnerOffer: {}
					};
					r.AgentOfferList.forEach(function (rawOffer) {
						Roblox.users.getByUserId(rawOffer.AgentID).then(function (user) {
							var offer = {
								user: user,
								robux: rawOffer.OfferRobux,
								assetValue: rawOffer.OfferValue - rawOffer.OfferRobux,
								totalValue: rawOffer.OfferValue,
								userAssets: []
							};
							rawOffer.OfferList.forEach(function (userAsset) {
								offer.userAssets.push({
									userAssetId: Number(userAsset.UserAssetID),
									assetId: Roblox.catalog.getIdFromUrl(userAsset.ItemLink),
									name: userAsset.Name,
									serialNumber: Number(userAsset.SerialNumber) || null,
									assetStock: Number(userAsset.SerialNumberTotal) || null,
									recentAveragePrice: Number(userAsset.AveragePrice)
								});
							});
							if (authenticatedUserId == user.id) {
								trade.authenticatedUserOffer = offer;
							} else {
								trade.tradePartnerOffer = offer;
							}
							trade.offers.push(offer);
							if (trade.offers.length == r.AgentOfferList.length) {
								resolve(trade);
							}
						}, reject);
					});
				}).fail(function () {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}, reject);
		}, {
			queued: true
		})
	};
})();

Roblox.trades = $.addTrigger($.promise.background("Roblox.trades", Roblox.trades));

// WebGL3D
