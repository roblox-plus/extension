/*
	ROBLOX+ ContextMenus.js [10/16/2016]
*/
chrome.contextMenus.create({
	id: "clearNotifications",
	title: "Clear Notifications",
	contexts: [
		"browser_action"
	],
	onclick: function(){
		$.notification.clear();
	}
});
	
chrome.contextMenus.create({
	id: "userContext",
	title: ext.manifest.name,
	documentUrlPatterns: [
		"*://*.roblox.com/*"
	],
	contexts: [
		"link"
	],
	targetUrlPatterns: [
		"*://*.roblox.com/users/*/profile"
	]
});

chrome.contextMenus.create({
	id: "sendTrade",
	parentId: "userContext",
	title: "Trade",
	contexts: [
		"link"
	],
	targetUrlPatterns: [
		"*://*.roblox.com/users/*/profile"
	],
	documentUrlPatterns: [
		"*://*.roblox.com/*"
	],
	onclick: function(e){
		Roblox.tradeService.openTradeWindow(Roblox.users.getIdFromUrl(e.linkUrl), null, function(){});
	}
});



// WebGL3D
