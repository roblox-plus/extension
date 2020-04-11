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
			Roblox.trades.get(tradeId).then(function (trade) {
				var title = "Trade " + headers[trade.status];
				Roblox.thumbnails.getUserHeadshotThumbnailUrl(trade.tradePartnerOffer.user.id, 150, 150).then((headshotThumbnailUrl) => {
					$.notification({
						tag: "trade" + trade.id,
						title: title,
						icon: headshotThumbnailUrl,
						items: {
							"Partner": trade.tradePartnerOffer.user.username,
							"Your RAP": addComma(trade.authenticatedUserOffer.assetValue) + (trade.authenticatedUserOffer.robux ? " +R$" + addComma(trade.authenticatedUserOffer.robux) : ""),
							"Their RAP": addComma(trade.tradePartnerOffer.assetValue) + (trade.tradePartnerOffer.robux ? " +R$" + addComma(trade.tradePartnerOffer.robux) : "")
						},
						buttons: trade.status === "Outbound" ? ["Cancel"] : [],
						clickable: true,
						metadata: {
							url: "https://www.roblox.com/trades", // TODO: Add trade id if Roblox supports (or I add support for it)
							robloxSound: Number((storage.get("notifierSounds") || {})["trade" + (trade.status == "Rejected" ? "Declined" : trade.status)]) || 0,
							speak: title
						}
					}).click(function () {
						this.close();
					}).buttonClick(function () {
						let note = this;
						Roblox.trades.decline(trade.id).then(function () {
							note.close();
						}).catch(function (e) {
							console.error(e);
						});
					});

					resolve();
				}).catch(reject);
			}).catch(reject);
		});
	};

	return RPlus.notifiers.init({
		name: "Trade",
		sleep: 10 * 1000,
		isEnabled: function (callBack) {
			callBack(storage.get("tradeNotifier") || false);
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
