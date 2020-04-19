/*
	roblox/avatar.js [03/23/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Trades = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.trades");

		this.tradeTypes = ["inbound", "outbound", "completed", "inactive"];

		this.register([
			this.decline,
			this.get,
			this.getTradesPaged,
			this.canTradeWithUser,
			this.getTradeCount
		]);
	}

	getTradeWindowUrl(userId, counterTradeId) {
		let baseUrl = `https://www.roblox.com/Trade/TradeWindow.aspx?TradePartnerID=${userId}`;
		if (counterTradeId) {
			baseUrl += `&TradeSessionId=${counterTradeId}`;
		}

		return baseUrl;
	}

	decline(tradeId) {
		return CachedPromise(`${this.serviceId}.decline`, (resolve, reject) => {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			$.post(`https://trades.roblox.com/v1/trades/${tradeId}/decline`).done(() => {
				resolve({});
			}).fail(Roblox.api.$reject(reject));
		}, [tradeId], {
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		});
	}

	get(tradeId) {
		return CachedPromise(`${this.serviceId}.getTradesPaged`, (resolve, reject) => {
			if (typeof (tradeId) != "number" || tradeId <= 0) {
				reject([{
					code: 0,
					message: "Invalid tradeId"
				}]);
				return;
			}

			Roblox.users.getAuthenticatedUser().then((authenticatedUser) => {
				if (!authenticatedUser) {
					reject([Roblox.api.errorCodes.generic.unauthorized]);
					return;
				}

				$.get(`https://trades.roblox.com/v1/trades/${tradeId}`).done((r) => {
					let trade = {
						id: r.id,
						status: r.status == "Open" ? (r.offers[0].user.id === authenticatedUser.id ? "Outbound" : "Inbound") : r.status,
						offers: [],
						authenticatedUserOffer: {},
						tradePartnerOffer: {}
					};

					r.offers.forEach((offerData) => {
						let offer = {
							user: {
								id: offerData.user.id,
								username: offerData.user.name
							},
							robux: offerData.robux,
							assetValue: 0,
							totalValue: offerData.robux,
							userAssets: []
						};

						offerData.userAssets.forEach((userAsset) => {
							let value = userAsset.recentAveragePrice || 0;
							if (isNaN(value)) {
								value = 0;
							}

							offer.assetValue += value;
							offer.totalValue += value;

							offer.userAssets.push({
								userAssetId: userAsset.id,
								assetId: userAsset.assetId,
								name: userAsset.name,
								serialNumber: Number(userAsset.serialNumber) || null,
								assetStock: Number(userAsset.assetStock) || null,
								recentAveragePrice: value
							});
						});

						if (offer.user.id === authenticatedUser.id) {
							trade.authenticatedUserOffer = offer;
						} else {
							trade.tradePartnerOffer = offer;
						}

						trade.offers.push(offer);
					});

					resolve(trade);
				}).fail(Roblox.api.$reject(reject));
			}).catch(reject);
		}, [tradeId], {
			queued: true
		});
	}

	getTradesPaged(tradeType, cursor) {
		return CachedPromise(`${this.serviceId}.getTradesPaged`, (resolve, reject) => {
			if (typeof (tradeType) != "string" || !this.tradeTypes.includes(tradeType)) {
				reject([{
					code: 0,
					message: "Invalid tradeType"
				}]);
				return;
			}

			$.get(`https://trades.roblox.com/v1/trades/${tradeType}`, {
				sortOrder: "Desc",
				limit: 100,
				cursor: cursor || ""
			}).done((r) => {
				resolve({
					nextPageCursor: r.nextPageCursor,
					data: r.data.map((trade) => {
						return {
							id: trade.id,
							status: trade.status,
							partner: {
								id: trade.user.id,
								username: trade.user.name
							},
							created: new Date(trade.created).getTime()
						};
					})
				});
			}).fail(Roblox.api.$reject(reject));
		}, [tradeType, cursor], {
			queued: true,
			resolveExpiry: 10 * 1000
		});
	}

	openTradeTab(userId, counterTradeId) {
		return new Promise((resolve, reject) => {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}
	
			window.open(this.getTradeWindowUrl(userId, counterTradeId));
			resolve({});
		});
	}

	canTradeWithUser(userId) {
		return CachedPromise(`${this.serviceId}.canTradeWithUser`, (resolve, reject) => {
			if (typeof (userId) !== "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			Roblox.users.getAuthenticatedUser().then((authenticatedUser) => {
				if (!authenticatedUser) {
					resolve(false);
					return;
				}

				$.get(this.getTradeWindowUrl(userId)).done((r) => {
					let tradePartnerId = Number((r.match(/<form[^>]+action="\/Trade\/TradeWindow.aspx\?TradePartnerID=(\d+)"/i) || ["", 0])[1]);
					resolve(tradePartnerId === userId);
				}).fail(Roblox.api.$reject(reject));
			}).catch(reject);
		}, [userId], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000
		});
	}

	getTradeCount(tradeType) {
		return CachedPromise(`${this.serviceId}.getTradeCount`, (resolve, reject) => {
			$.get(`https://trades.roblox.com/v1/trades/${tradeType}/count`).done((r) => {
				resolve(r.count);
			}).fail(Roblox.api.$reject(reject));
		}, [tradeType], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000
		});
	}

	openSettingBasedTradeWindow(userId, counterTradeId) {
		return new Promise(function (resolve, reject) {
			this.openTradeTab(userId).then(resolve).catch(reject);
		});
	}
};

Roblox.trades = new Roblox.Services.Trades();

// WebGL3D
