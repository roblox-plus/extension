/*
	Roblox.js
	A file containing homeless Roblox methods
*/
if(!window.Roblox){
	Roblox = {};
}

Roblox.page = Roblox.page || {};


Roblox.getOpenRobloxTabs = $.cache(ipc.backgroundFunction("Roblox.getOpenRobloxTabs", function(callBack){
	chrome.tabs.query({ url: "*://*.roblox.com/*" }, function(tabs){
		callBack(tabs);
	});
}), 1000);


if (ext.isContentScript) {
	$(function () {
		Roblox.page.user = {
			id: $("#chat-data-model").data("userid") || 0,
			username: $("#navigation>ul>li.text-lead>a.text-overflow").text() || ""
		};
	});
}


// WebGL3D
