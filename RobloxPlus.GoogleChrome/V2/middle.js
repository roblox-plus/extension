// middle.js [4/4/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
rplusSettings = {
	cache: compact.cache(10 * 1000),
	fields: { "updateLog": "", "serialTracker": true, "forumFloodCheck": 15, "checkPremiumOnServer": false },
	get: request.backgroundFunction("rplusSettings.get", compact(function (callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (rplusSettings.cache.get("get")) {
			callBack(rplusSettings.cache.get("get"));
			return;
		}
		$.get("https://assetgame.roblox.com/asset/?id=311113112").done(function (r) {
			try {
				callBack(r = JSON.parse(decodeURIComponent(r.substring(7, r.length - 9))));
				rplusSettings.cache.set("get", r);
			} catch (e) {
				callBack({});
			}
		}).fail(function () {
			callBack({});
		});
	})),
	set: request.backgroundFunction("rplusSettings.set", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (type(arg) != "object") { callBack(0); return; }
		rplusSettings.get(function (oldSettings) {
			var ns = {};
			for (var n in rplusSettings.fields) {
				var o = rplusSettings.fields[n];
				if (type(o) == type(arg[n])) {
					ns[n] = arg[n];
				} else {
					ns[n] = oldSettings.hasOwnProperty(n) ? oldSettings[n] : o;
				}
			}
			rplusSettings.cache.set("get", ns);
			ns = "<roblox" + encodeURIComponent(JSON.stringify(ns)) + "</roblox>";
			$.post("https://data.roblox.com/Data/Upload.ashx?assetid=311113112&type=Model&length=" + ns.length, ns).done(function (r) {
				callBack(Number(r) || 0);
			}).fail(function () {
				callBack(0);
			});
		});
	}))
};


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
