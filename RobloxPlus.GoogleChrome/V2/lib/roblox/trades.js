/*
	roblox/avatar.js [03/23/2017]
*/
var Roblox = Roblox || {};

Roblox.trades = (function () {
	var tradeTypes = ["inbound", "outbound", "completed", "inactive"];

	return {
		getTradeWindowUrl: function (userId, counterTradeId) {
			return "https://www.roblox.com/Trade/TradeWindow.aspx?TradePartnerID=" + userId + (counterTradeId ? "&TradeSessionId=" + counterTradeId : "");
		},

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
		}),

		send: $.promise.cache(function (resolve, reject, offer, request, counterTradeId) {
			// THIS METHOD IS UNTESTED. Use at your own risk.
			if (typeof (offer) != "object" || !Array.isArray(offer.userAssetIds) || typeof (offer.robux) != "number" || offer.robux < 0 || offer.userAssetIds.length <= 0) {
				reject([{
					code: 0,
					message: "Invalid offer"
				}]);
				return;
			}
			if (typeof (request) != "object" || !Array.isArray(request.userAssetIds) || typeof (request.robux) != "number" || request.robux < 0 || request.userAssetIds.length <= 0 || typeof(request.userId) != "number" || request.userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid request"
				}]);
				return;
			}

			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				var data = {
					cmd: typeof (counterTradeId) == "number" ? "counter" : "send",
					TradeJSON: JSON.stringify({
						"AgentOfferList": [
							{
								AgentID: authenticatedUserId,
								OfferList: offer.userAssetIds,
								OfferRobux: offer.robux,
								OfferValue: 999999999
							},
							{
								AgentID: request.userId,
								OfferList: request.userAssetIds,
								OfferRobux: request.robux,
								OfferValue: 999999999
							}
						],
						IsActive: false,
						TradeStatus: "Open"
					})
				};
				if (typeof (counterTradeId) == "number") {
					data.TradeID = counterTradeId;
				}
				$.post("https://www.roblox.com/Trade/TradeHandler.ashx", data).done(function (r) {
					if (Array.isArray(r.data)) {
						reject(r.data);
						return;
					}
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
			}, reject);
		}, {
			queued: true
		}),

		getTradesPaged: $.promise.cache(function (resolve, reject, tradeType, pageNumber) {
			if (typeof (pageNumber) != "number" || pageNumber <= 0) {
				reject([{
					code: 0,
					message: "Invalid pageNumber"
				}]);
				return;
			}
			if (typeof (tradeType) != "string" || !tradeTypes.includes(tradeType)) {
				reject([{
					code: 0,
					message: "Invalid tradeType"
				}]);
				return;
			}
			
			var pageSize = 20;
			$.ajax({
				url: "https://www.roblox.com/My/Money.aspx/GetMyItemTrades",
				type: "POST",
				data: JSON.stringify({ startindex: pageSize * (pageNumber - 1), statustype: tradeType }),
				contentType: "application/json"
			}).done(function (r) {
				r = JSON.parse(r.d);
				var tradeCount = Number(r.totalCount) || 0;
				var data = {
					count: tradeCount,
					data: []
				};
				r.Data.forEach(function (trade) {
					trade = JSON.parse(trade);
					data.data.push({
						id: Number(trade.TradeSessionID),
						status: trade.Status,
						partner: {
							id: Number(trade.TradePartnerID) || 0,
							username: trade.TradePartner
						},
						expiration: new Date(trade.Expires).getTime(),
						created: new Date(trade.Date).getTime()
					});
				});
				resolve(data);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true,
			resolveExpiry: 10 * 1000
		}),

		openTradeWindow: $.promise.cache(function (resolve, reject, userId, counterTradeId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			window.open(this.getTradeWindowUrl(userId, counterTradeId), "Trade" + userId + (counterTradeId ? "-" + counterTradeId : ""), "width=930,height=680", false);
			resolve();
		}, {
			queued: true,
			resolveExpiry: 1000
		}),

		openTradeTab: $.promise.cache(function (resolve, reject, userId, counterTradeId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			window.open(this.getTradeWindowUrl(userId, counterTradeId));
			resolve();
		}, {
			queued: true,
			resolveExpiry: 1000
		}),

		getOpenTradeHref: function (userId, counterTradeId, isTab) {
			if (isTab) {
				return "javascript:window.open(\"" + this.getTradeWindowUrl(userId, counterTradeId) + "\");event.preventDefault();";
			} else {
				return "javascript:window.open(\"" + this.getTradeWindowUrl(userId, counterTradeId) + "\", \"Trade" + userId + (counterTradeId ? "-" + counterTradeId : "") + "\", \"width=930,height=680\", false);event.preventDefault();";
			}
		},

		canTradeWithUser: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) !== "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				if (authenticatedUserId <= 0) {
					resolve(false);
					return;
				}

				$.get(Roblox.trades.getTradeWindowUrl(userId)).done(function (r) {
					temp1 = r;
					var tradePartnerId = Number((temp1.match(/<form[^>]+action="\/Trade\/TradeWindow.aspx\?TradePartnerID=(\d+)"/i) || ["", 0])[1]);
					resolve(tradePartnerId === userId);
				}).fail(function () {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}).catch(reject);
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000
		})
	};
})();

Roblox.trades = $.addTrigger($.promise.background("Roblox.trades", Roblox.trades));

// WebGL3D
