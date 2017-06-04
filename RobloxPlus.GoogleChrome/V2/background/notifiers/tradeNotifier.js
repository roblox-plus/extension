/* background/notifiers/tradeNotifier.js [06/04/2017] */

var RPlus = RPlus || {};
RPlus.notifiers = RPlus.notifiers || {};
// Leaving tradeNotifier for legacy reasons.
// TODO: Delete tradeNotifier accessor
RPlus.notifiers.trade = tradeNotifier = RPlus.notifiers.trade || (function () {
	var tradeNotifier;
	tradeNotifier = setupNotifier(function (loop, uid, load) {
		var tn = storage.get("tradeNotifier");
		if (!tn && !storage.get("tradeChecker")) { loop(); return; }
		var old = tradeNotifier.cache.get(uid) || {};
		var dcb = 0;
		var outbound = [];
		var startup = tradeNotifier.ran != uid;
		if (startup) { tradeNotifier.cache.clear(); }
		load = function (t, p) {
			Roblox.trades.getTradesPaged(t, p).then(function (trades) {
				var outcheck = t == "outbound" && storage.get("tradeChecker");
				trades.data.forEach(function (trade) {
					var c = old[trade.id] != t;
					if (t == "outbound") {
						outbound.push(trade.id);
					}
					if (c || outcheck) {
						old[trade.id] = t;
						var lab = tradeNotifier.headers[trade.status];
						if ((outcheck && !tradeNotifier.outbound.hasOwnProperty(trade.id)) || (c && lab)) {
							Roblox.trades.get(trade.id).then(function (trade) {
								if (outcheck) {
									tradeNotifier.outbound[trade.id] = [];
									trade.authenticatedUserOffer.userAssets.forEach(function (userAsset) {
										tradeNotifier.outbound[trade.id].push(userAsset.userAssetId);
									});
									trade.tradePartnerOffer.userAssets.forEach(function (userAsset) {
										tradeNotifier.outbound[trade.id].push(userAsset.userAssetId);
									});
								}
								if (startup || !lab || !c || tradeNotifier.displayCache[trade.id + lab]) { return; }
								tradeNotifier.displayCache[trade.id + lab] = getMil();
								notify({
									header: "Trade " + lab,
									icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(trade.tradePartnerOffer.user.id, 3),
									items: {
										"Partner": trade.tradePartnerOffer.user.username,
										"Your RAP": addComma(trade.authenticatedUserOffer.assetValue) + (trade.authenticatedUserOffer.robux ? " +R$" + addComma(trade.authenticatedUserOffer.robux) : ""),
										"Their RAP": addComma(trade.tradePartnerOffer.assetValue) + (trade.tradePartnerOffer.robux ? " +R$" + addComma(trade.tradePartnerOffer.robux) : "")
									},
									buttons: trade.status == "Outbound" ? ["Cancel"] : [],
									clickable: true,
									robloxSound: Number((storage.get("notifierSounds") || {})["trade" + (trade.status == "Rejected" ? "Declined" : trade.status)]) || 0,
									url: { url: "https://www.roblox.com/My/Money.aspx?tradeId=" + trade.id + "#/#TradeItems_tab", close: true },
									tag: "trade" + trade.id
								}).button1Click(function () {
									Roblox.trades.decline(trade.id);
								});
							});
						}
					}
				});
				if (p < trades.count / 20 && outcheck) {
					load(t, p + 1);
				} else if (++dcb == (tn ? 4 : 1)) {
					for (var n in tradeNotifier.outbound) {
						if (outbound.indexOf(Number(n)) < 0) {
							delete tradeNotifier.outbound[n];
						}
					}
					tradeNotifier.cache.set(uid, old);
					tradeNotifier.ran = uid;
					loop();
				}
			}, function () {
				setTimeout(load, 5000, t, p);
			});
		};
		if (tn) {
			load("inbound", 1);
			load("completed", 1);
			load("inactive", 1);
		}
		load("outbound", 1);
	}, {
			userId: true
		});

	tradeNotifier.ran = 0;
	tradeNotifier.outbound = {};
	tradeNotifier.displayCache = {};
	tradeNotifier.cache = compact.cache(0);
	tradeNotifier.headers = {
		"Pending approval from you": "inbound",
		"Pending approval from ": "outbound",
		"Completed": "completed",
		"Rejected due to error": "rejected",
		"Declined": "declined"
	};
	tradeNotifier.run();

	request.sent(function (req, callBack) {
		if (req.request == "outboundTrades") {
			var uaidList = [];
			for (var n in tradeNotifier.outbound) { uaidList = uaidList.concat(tradeNotifier.outbound[n]); }
			callBack(uaidList);
		}
	});

	return tradeNotifier;
})();



// WebGL3D
