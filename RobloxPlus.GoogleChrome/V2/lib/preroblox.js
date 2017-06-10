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
	update: request.backgroundFunction("catalog.update", function (arg, callBack) {
		if (type(arg) != "object" || typeof(arg.id) != "number" || typeof (callBack) != "function") {
			console.warn("callBack not function! (maybe)");
			return;
		}

		$.get("https://www.roblox.com/My/Item.aspx?ID=" + arg.id).done(function (r) {
			r = $._(r);
			if (r.find("#EditItem").length) {
				arg.robux = round(type(arg.robux) == "number" ? arg.robux : r.find("#ctl00_cphRoblox_RobuxPrice").val()) || 0;
				arg.genre = type(arg.genre) == "number" ? arg.genre : r.find("#ctl00_cphRoblox_actualGenreSelection").val();
				var data = {
					"ctl00$cphRoblox$NameTextBox": type(arg.name) == "string" && arg.name ? arg.name : r.find("#ctl00_cphRoblox_NameTextBox").val(),
					"ctl00$cphRoblox$DescriptionTextBox": type(arg.description) == "string" ? arg.description : r.find("#ctl00_cphRoblox_DescriptionTextBox").val(),
					"ctl00$cphRoblox$SellThisItemCheckBox": (arg.hasOwnProperty("free") && arg.free) || arg.robux > 0 ? "on" : "",
					"ctl00$cphRoblox$SellForRobux": arg.robux > 0 ? "on" : "",
					"ctl00$cphRoblox$RobuxPrice": arg.robux,
					"ctl00$cphRoblox$PublicDomainCheckBox": arg.hasOwnProperty("free") ? (arg.free ? "on" : "") : (r.find("#ctl00_cphRoblox_PublicDomainCheckBox").prop("checked") ? "on" : ""),
					"GenreButtons2": arg.genre,
					"ctl00$cphRoblox$actualGenreSelection": arg.genre,
					"ctl00$cphRoblox$EnableCommentsCheckBox": arg.hasOwnProperty("comments") ? (arg.comments ? "on" : "") : (r.find("#ctl00_cphRoblox_EnableCommentsCheckBox").prop("checked") ? "on" : ""),
					__EVENTTARGET: "ctl00$cphRoblox$SubmitButtonBottom",
					__PREVIOUSPAGE: r.find("#__PREVIOUSPAGE").val(),
					__EVENTVALIDATION: r.find("#__EVENTVALIDATION").val(),
					__VIEWSTATEGENERATOR: r.find("#__VIEWSTATEGENERATOR").val(),
					__VIEWSTATE: r.find("#__VIEWSTATE").val()
				};
				for (var n in data) { if (!r.find("*[name='" + n + "']").length) { delete data[n]; } };
				$.post("https://www.roblox.com/My/Item.aspx?ID=" + arg.id, data, function (r, s) { callBack(s == "success"); });
			} else {
				callBack(false);
			}
		}).fail(function () {
			callBack(false);
		});
	})
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
