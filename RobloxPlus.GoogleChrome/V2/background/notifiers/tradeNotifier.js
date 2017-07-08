/* background/notifiers/tradeNotifier.js [06/04/2017] */
RPlus.notifiers.trade = (function () {
	var headers = {
		"Pending approval from you": "inbound", // This is here because the way I check if it should have a notification uses a different field than the one it displays with
		"Inbound": "inbound",
		"Completed": "completed",
		"Declined": "declined",
		"Rejected": "rejected",
		"Outbound": "outbound"
	};
	var outboundTrades = {};
	
	request.sent(function (req, callBack) {
		if (req.request == "outboundTrades") {
			var uaidList = [];
			for (var n in outboundTrades) {
				uaidList = uaidList.concat(outboundTrades[n]);
			}
			callBack(uaidList);
		}
	});

	return RPlus.notifiers.init({
		name: "Trade",
		sleep: 10 * 1000,
		isEnabled: function (callBack) {
			callBack(storage.get("tradeNotifier") || storage.get("tradeChecker") || false);
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			var tradeCheckerEnabled = storage.get("tradeChecker");
			var outbound = {};

			var mcb = 1;
			var dcb = 0;
			function fcb() {
				if (++dcb === mcb) {
					outboundTrades = outbound;
					resolve([]);
				}
			}

			var load;
			load = function (tradeType, pageNumber) {
				Roblox.trades.getTradesPaged(tradeType, pageNumber).then(function (trades) {
					var outboundCheck = tradeType === "outbound" && storage.get("tradeChecker");
					trades.data.forEach(function (trade) {
						var tradeMoved = cache[trade.id] !== tradeType;
						if (tradeMoved || outboundCheck) {
							cache[trade.id] = tradeType;
							// headers.hasOwnProperty maps with line 4, and 63
							if ((outboundCheck && !outbound.hasOwnProperty(trade.id)) || (tradeMoved && headers.hasOwnProperty(trade.status) && rerun)) {
								mcb++;
								Roblox.trades.get(trade.id).then(function (trade) {
									if (outboundCheck) {
										outbound[trade.id] = [];
										trade.authenticatedUserOffer.userAssets.concat(trade.tradePartnerOffer.userAssets).forEach(function (userAsset) {
											outbound[trade.id].push(userAsset.userAssetId);
										});
									}
									if (!rerun || !tradeMoved || !headers.hasOwnProperty(trade.status)) {
										console.log(trade.status);
										fcb();
										return;
									}
									var note;
									note = notify({
										header: "Trade " + headers[trade.status],
										icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(trade.tradePartnerOffer.user.id, 3),
										items: {
											"Partner": trade.tradePartnerOffer.user.username,
											"Your RAP": addComma(trade.authenticatedUserOffer.assetValue) + (trade.authenticatedUserOffer.robux ? " +R$" + addComma(trade.authenticatedUserOffer.robux) : ""),
											"Their RAP": addComma(trade.tradePartnerOffer.assetValue) + (trade.tradePartnerOffer.robux ? " +R$" + addComma(trade.tradePartnerOffer.robux) : "")
										},
										buttons: trade.status === "Outbound" ? ["Cancel"] : [],
										clickable: true,
										robloxSound: Number((storage.get("notifierSounds") || {})["trade" + (trade.status == "Rejected" ? "Declined" : trade.status)]) || 0,
										url: {
											url: "https://www.roblox.com/My/Money.aspx?tradeId=" + trade.id + "#/#TradeItems_tab",
											close: true
										},
										tag: "trade" + trade.id
									}).button1Click(function () {
										Roblox.trades.decline(trade.id).then(function () {
											note.close();
										}).catch(function (e) {
											console.error(e);
										});
									});
									fcb();
								});
							}
						}
					});
					if (pageNumber < trades.count / 20 && outboundCheck) {
						load(tradeType, pageNumber + 1);
					} else {
						fcb();
					}
				}, fcb);
			};

			if (storage.get("tradeNotifier")) {
				mcb += 3;
				load("inbound", 1);
				load("completed", 1);
				load("inactive", 1);
			}
			load("outbound", 1);
		});
	});
})();


// WebGL3D
