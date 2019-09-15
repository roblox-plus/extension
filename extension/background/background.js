// background.js [3/30/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
foreach({
	"friendNotifier": {
		on: false,
		online: true,
		offline: true,
		game: true,
		blocked: []
	},
	"notificationVolume": .5,
	"notifierSounds": {
		item: 205318910,
		tradeInbound: 0,
		tradeOutbound: 0,
		tradeCompleted: 0,
		tradeDeclined: 0,
		friend: 0,
		messages: 0,
		groupShout: 0
	},
	"changedLogin": ext.incognito,
	"startupNotification": {
		on: !ext.incognito,
		visit: browser.name !== "Chrome",
		names: {}
	},
	"groupShoutNotifierList": { 2518656: "Roblox+ Fan Group" },
	"navigation": {
		"sideOpen": false,
		"counterCommas": 100000000,
		"buttons": [
			{ text: "Create", href: "/develop" },
			{ text: "Trade", href: "/my/money.aspx#/#TradeItems_tab" }
		]
	},
	"userSince": getMil()
}, function (n, o) {
	if (type(storage.get(n)) != type(o)) {
		storage.set(n, o);
	}
});

/* Comment Timer */
commentTimer = type(storage.get("commentTimer")) == "object" ? storage.get("commentTimer") : {};
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	commentTimer.last = getMil();
	Roblox.catalog.getAssetInfo(Number(details.requestBody.formData.assetId[0])).then(function(asset) {
		Roblox.users.getCurrentUserId().then(function (uid) {
			if (uid > 0 && uid != asset.creator.id) {
				commentTimer[uid] = commentTimer[uid] || {};
				commentTimer.last = getMil();
				commentTimer[uid][asset.id] = getMil();
			}
		});
	});
}, { urls: ["*://*.roblox.com/comments/post"] }, ["requestBody"]);

setInterval(function () {
	foreach(commentTimer, function (n, o) {
		if (n != "last") {
			foreach(o, function (i, v) {
				if (v + (60 * 60 * 1000) < getMil()) {
					delete o[i];
				}
			});
			if (!Object.keys(o).length) {
				delete commentTimer[n];
			}
		}
		if (JSON.stringify(commentTimer) != JSON.stringify(storage.get("commentTimer"))) {
			storage.set("commentTimer", commentTimer);
		}
	});
}, 5000);



/* Some garbage that shouldn't be in this extension */
Roblox.users.getAuthenticatedUser().then(function (user) {
	if (user && user.id === 48103520) {
		chrome.webRequest.onBeforeRequest.addListener(function (details) {
			if (details.url.includes("navigation_06282017.svg")) {
				return { redirectUrl: ext.getUrl("/images/navigation_06282017.svg") };
			} else if (details.url.includes("generic_09152017.svg")) {
				return { redirectUrl: ext.getUrl("/images/generic_09152017.svg") };
			}
		}, { urls: ["*://static.rbxcdn.com/images/*"] }, ["blocking"]);

		// I should release this for everyone but I don't want to risk it breaking someday and actually destroying the page.
		chrome.webRequest.onBeforeRequest.addListener(function (details) {
			var match = details.url.match(/\/asset\/(.*)/i) || ["", ""];
			console.log("redirect", match[1]);
			return { redirectUrl: "https://assetgame.roblox.com/asset/" + match[1] };
		}, { urls: ["*://www.roblox.com/asset/*"] }, ["blocking"]);

		// Sound is dumb sometimes: net::ERR_CONTENT_DECODING_FAILED
		chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
			details.requestHeaders.forEach(function (header) {
				if (header.name === "Accept-Encoding") {
					header.value = "gzip, deflate";
				}
			});

			return { requestHeaders: details.requestHeaders };
		}, {
			urls: [
				"*://c1.rbxcdn.com/*",
				"*://c2.rbxcdn.com/*",
				"*://c3.rbxcdn.com/*",
				"*://c4.rbxcdn.com/*",
				"*://c5.rbxcdn.com/*",
				"*://c6.rbxcdn.com/*",
				"*://c7.rbxcdn.com/*"
			] 
		}, [
			"blocking",
			"requestHeaders",
			"extraHeaders"
		]);

		chrome.webRequest.onHeadersReceived.addListener(function (details) {
			var id = Roblox.catalog.getIdFromUrl(details.url);
			if (id > 0) {
				var redirectLocation = "";
				details.responseHeaders.forEach(function (header) {
					if (header.name.toLowerCase() === "location") {
						redirectLocation = header.value;
					}
				});

				if (redirectLocation && redirectLocation.toLowerCase().endsWith("www.roblox.com/catalog/")) {
					return { cancel: true };
				}
			}
		}, { urls: ["*://www.roblox.com/catalog/*/*"] }, ["blocking", "responseHeaders"]);
	}
}).catch(function (e) {
	// oh well..
	console.error(e);
});



/* Update Check */
if (browser.name == "Chrome") {
	setInterval(function () {
		chrome.runtime.requestUpdateCheck(function (e) {
			if (e == "update_available") {
				setTimeout(ext.reload, 10 * 1000);
			}
		});
	}, 60 * 1000);
}



/* Startup Notification */
(function (startnote, makenote) {
	startnote.names = type(startnote.names) == "object" ? startnote.names : {};
	if (startnote.on && !startnote.visit) {
		makenote(startnote);
	} else if (startnote.on) {
		var listener; listener = function () { chrome.webRequest.onCompleted.removeListener(listener); makenote(startnote); };
		chrome.webRequest.onCompleted.addListener(listener, { types: ["main_frame"], urls: ["*://*.roblox.com/*"] });
	}
})(storage.get("startupNotification"), function (startnote) {
	Roblox.users.getAuthenticatedUser().then(function (user) {
		var username = user ? user.username : "";
		for (var n in startnote.names) {
			if (n.toLowerCase() === username.toLowerCase()) {
				username = startnote.names[n];
				break;
			}
		}

		RPlus.settings.get().then(function (ul) {
			var note = $.notification({
				title: ext.manifest.name + " started",
				context: user ? "Hello, " + user.username + "!" : "You're currently signed out",
				buttons: [
					"Problems? Suggestions? Post here!"
				],
				items: {
					"Version": ext.manifest.version,
					"Made by": "WebGL3D"
				},
				clickable: true,
				metadata: {
					speak: username ? "Hello, " + username : "",
					url: ul.updateLog || "https://www.roblox.com/users/48103520/profile?rbxp=48103520",
					expiration: 15 * 1000
				}
			}).buttonClick(function () {
				note.close();
				window.open("https://www.roblox.com/groups/2518656/ROBLOX-Fan-Group?rbxp=48103520");
			});
		}).catch(function(e) {
			console.warn("no startup notification", e);
		});
	});
});



// WebGL3D
