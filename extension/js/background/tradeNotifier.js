/* background/notifiers/tradeNotifier.js [06/04/2017] */
RPlus.notifiers.trade = (function () {
	var headers = {
		"Open": "inbound",
		"Inbound": "inbound",
		"Completed": "completed",
		"Declined": "declined",
		"Rejected": "rejected",
		"Outbound": "outbound"
	};

	var notify = function(tradeId) {
		return new Promise(function(resolve, reject) {
			Extension.Storage.Singleton.get("notifierSounds").then(notifierSounds => {
				notifierSounds = notifierSounds || {};

				Roblox.trades.get(tradeId).then(function (trade) {
					Roblox.thumbnails.getUserHeadshotThumbnailUrl(trade.tradePartnerOffer.user.id, 150, 150).then((headshotThumbnailUrl) => {
						var title = `Trade ${headers[trade.status]}`;
						let buttons = [];
						if (trade.status === "Outbound") {
							buttons.push({
								text: "Cancel"
							});
						}

						Extension.NotificationService.Singleton.createNotification({
							id: `trade${trade.id}`,
							title: "Trade Notifier",
							context: title,
							icon: headshotThumbnailUrl,
							items: {
								"Partner": trade.tradePartnerOffer.user.username,
								"Your RAP": addComma(trade.authenticatedUserOffer.assetValue) + (trade.authenticatedUserOffer.robux ? " +R$" + addComma(trade.authenticatedUserOffer.robux) : ""),
								"Their RAP": addComma(trade.tradePartnerOffer.assetValue) + (trade.tradePartnerOffer.robux ? " +R$" + addComma(trade.tradePartnerOffer.robux) : "")
							},
							buttons: buttons,
							displayExpiration: 30 * 1000,
							metadata: {
								cancelTradeId: trade.id,
								url: "https://www.roblox.com/trades", // TODO: Add trade id if Roblox supports (or I add support for it)
								robloxSound: Number(notifierSounds["trade" + (trade.status == "Rejected" ? "Declined" : trade.status)]) || 0,
								speak: title
							}
						}).then(notification => {
							console.log("Trade notification", trade, notification);
						}).catch(console.error);
						
						resolve();
					}).catch(reject);
				}).catch(reject);
			}).catch(reject);
		});
	};

	Extension.NotificationService.Singleton.onNotificationButtonClicked.addEventListener(e => {
		if (e.buttonIndex === 0 && e.notification.metadata.cancelTradeId) {
			Roblox.trades.decline(e.notification.metadata.cancelTradeId).then(function () {
				Extension.NotificationService.Singleton.closeNotification(e.notification.id).then(() => {
					// Trade declined and notification closed successfully
				}).catch(console.warn);
			}).catch(console.error);
		}
	});

	return RPlus.notifiers.init({
		name: "Trade",
		sleep: 10 * 1000,
		isEnabled: function (callBack) {
			Extension.Storage.Singleton.get("tradeNotifier").then(callBack).catch(err => {
				console.warn(err);
				callBack(false);
			});
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			var mcb = 4;
			var dcb = 0;
			function fcb() {
				if (++dcb === mcb) {
					resolve([]);
				}
			}

			const load = function (tradeType) {
				Roblox.trades.getTradesPaged(tradeType, "").then(function (trades) {
					trades.data.forEach(function (trade) {
						var tradeMoved = cache[trade.id] !== tradeType;
						if (tradeMoved) {
							cache[trade.id] = tradeType;

							if (rerun) {
								console.log("trade moved", trade);
							}

							if (headers.hasOwnProperty(trade.status) && rerun) {
								mcb++;
								notify(trade.id).then(function() {
									fcb();
								}).catch(function(err) {
									console.error("tradeNotifier", err);
									fcb();
								});
							}
						}
					});

					fcb();
				}, fcb);
			};

			load("inbound");
			load("completed");
			load("inactive");
			load("outbound");
		});
	});
})();


// WebGL3D
