// middle.js [4/4/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
Roblox.trades.openSettingBasedTradeWindow = function (userId, counterTradeId) {
	return new Promise(function (resolve, reject) {
		storage.get("tradeTab", function (on) {
			if (on) {
				Roblox.trades.openTradeTab(userId).then(resolve, reject);
			} else {
				Roblox.trades.openTradeWindow(userId).then(resolve, reject);
			}
		});
	});
};


forumService.youtube = $.promise.background("forumService.youtube", $.promise.cache(function (resolve, reject, v) {
	$.get("http://forum.roblox.plus/yt.php", { v: v }).done(function (r) {
		resolve(r.title);
	}).fail(function () {
		reject([{
			code: 0,
			message: "HTTP request failed"
		}]);
	});
}, {
	resolveExpiry: 24 * 60 * 60 * 1000,
	rejectExpiry: 15 * 1000,
	queued: true
}));



// WebGL3D
