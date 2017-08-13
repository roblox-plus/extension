// preroblox.js [3/13/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
compact.cache = function (ret, cb) {
	var timeout = type(ret) == "number" ? ret : 5000;
	cb = fixCB(cb);
	return ret = {
		data: {},
		get: function (k) { return ret.data[k] && ret.data[k].v; },
		set: function (k, v, t) {
			if (ret.data[k] && ret.data[k].t) { clearTimeout(ret.data[k].t); }
			ret.data[k] = { v: v };
			if (timeout > 0 && t !== false) {
				ret.data[k].t = setTimeout(function () {
					delete ret.data[k];
				}, timeout);
			}
			cb(k, v);
		},
		remove: function (k) {
			delete ret.data[k];
		},
		clear: function () { ret.data = {}; }
	};
};

url.roblox = {
	linkify: /(https?\:\/\/)?(?:www\.)?([a-z0-9\-]{2,}\.)*(((m|de|www|web|api|blog|wiki|help|corp|polls|bloxcon|developer|devforum|forum)\.roblox\.com|robloxlabs\.com)|(www\.shoproblox\.com))((\/[A-Za-z0-9-+&@#\/%?=~_|!:,.;]*)|(\b|\s))/gm
};



catalog = {
	update: function (arg, callBack) {
		if (type(arg) != "object" || typeof(arg.id) != "number" || typeof (callBack) != "function") {
			console.warn("callBack not function! (maybe)");
			return;
		}

		Roblox.catalog.configureAsset(arg.id, arg).then(function() {
			callBack(true);
		}).catch(function() {
			callBack(false);
		});
	}
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
users = {};
forumService = {};


// WebGL3D
