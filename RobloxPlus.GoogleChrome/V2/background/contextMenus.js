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
		var userId = Roblox.users.getIdFromUrl(e.linkUrl);
		Roblox.trades.canTradeWithUser(userId).then(function (canTrade) {
			if (canTrade) {
				Roblox.trades.openSettingBasedTradeWindow(userId);
			}
		}).catch(function (e) {
			console.error(e);
		});
	}
});


// WebGL3D
