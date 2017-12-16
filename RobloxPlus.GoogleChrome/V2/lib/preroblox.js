// preroblox.js [3/13/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
url.roblox = {
	linkify: /(https?\:\/\/)?(?:www\.)?([a-z0-9\-]{2,}\.)*(((m|de|www|web|api|blog|wiki|help|corp|polls|bloxcon|developer|devforum|forum)\.roblox\.com|robloxlabs\.com)|(www\.shoproblox\.com))((\/[A-Za-z0-9-+&@#\/%?=~_|!:,.;]*)|(\b|\s))/gm
};


soundService.robloxSound = function (id, callBack) {
	if (!isCB(callBack)) { return; }
	Roblox.audio.getSoundUrl(Number(id)).then(function (url) {
		callBack(soundService(url, true));
	}, function () {
		callBack();
	});
};


// These are dummies that exist for the garbage in other scripts
catalog = {};
users = {};


// WebGL3D
