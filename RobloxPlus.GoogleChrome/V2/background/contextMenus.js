/* background/contextMenus.js [06/10/2017] */
chrome.contextMenus.create({
	id: "clearNotifications",
	title: "Clear Notifications",
	contexts: ["browser_action"],
	onclick: function () {
		notification.clear();
	}
});

chrome.contextMenus.create({
	id: "mainContext",
	documentUrlPatterns: ["*://*.roblox.com/*"],
	title: ext.manifest.name,
	contexts: ["link"],
	targetUrlPatterns: ["*://*.roblox.com/users/*/profile"]
});

chrome.contextMenus.create({
	id: "sendTrade",
	title: "Trade",
	contexts: ["link"],
	targetUrlPatterns: ["*://*.roblox.com/users/*/profile"],
	documentUrlPatterns: ["*://*.roblox.com/*"],
	parentId: "mainContext",
	onclick: function (e) {
		var id = Roblox.users.getIdFromUrl(e.linkUrl);
		$.get("https://www.roblox.com/Trade/TradeWindow.aspx", {
			TradePartnerID: id
		}).done(function (r) {
			if (($._(r).find("#aspnetForm[action]").attr("action") || "").endsWith("TradePartnerID=" + id)) {
				Roblox.trades.openSettingBasedTradeWindow(id);
			}
		});
	}
});


// WebGL3D
