/*
	Roblox.js
	A file containing homeless Roblox methods
*/
if(!window.Roblox){
	Roblox = {};
}

Roblox.getOpenRobloxTabs = $.cache(request.backgroundFunction("Roblox.getOpenRobloxTabs", function(callBack){
	chrome.tabs.query({ url: "*://*.roblox.com/*" }, function(tabs){
		callBack(tabs);
	});
}), 1000);



// WebGL3D
