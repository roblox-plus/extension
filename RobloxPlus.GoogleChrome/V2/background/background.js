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
		items: 205318910,
		tradeInbound: 0,
		tradeOutbound: 0,
		tradeCompleted: 0,
		tradeDeclined: 0,
		friend: 0,
		forum: 0,
		messages: 0,
		groupShout: 0
	},
	"changedLogin": ext.incognito,
	"startupNotification": {
		on: !ext.incognito,
		visit: browser.name != "Chrome",
		names: {}
	},
	"forums": {
		last: 0,
		floodcheck: 0,
		signature: "",
		lines: 3,
		blacklist: [],
		postIds: false,
		rap: false,
		blocking: false,
		embedding: false,
		embedSize: 75
	},
	"changedLogin": ext.incognito,
	"groupShoutNotifierList": { 2518656: "Roblox+ Fan Group" },
	"navigation": {
		"sideOpen": false,
		"counterCommas": 100000000,
		"buttons": [
			{ text: "Develop", href: "/develop" },
			{ text: "Forums", href: "/forum" }
		]
	},
	"userSince": getMil()
}, function (n, o) {
	if (type(storage.get(n)) != type(o)) {
		storage.set(n, o);
	}
});



/* Notifications, and notifiers */
function setupNotifier(run, arg, ret) {
	arg = type(arg) == "object" ? arg : {};
	arg.timeout = arg.timeout || 60000;
	arg.interval = arg.interval || 5000;
	return ret = {
		id: 0,
		run: function (id) {
			if (id == undefined) { id = ++ret.id; } else if (id != ret.id) { return; }
			var tim = setTimeout(function () {
				ret.run(++ret.id);
			}, arg.timeout);
			var go = function (loop) {
				if (!tim) { return; }
				clearTimeout(tim);
				tim = 0;
				loop = loop || arg.interval;
				setTimeout(ret.run, loop, id);
			};
			if (type(arg.storage) != "string" || storage.get(arg.storage)) {
				Roblox.users.getCurrentUserId().then(function (uid) {
					if (!arg.userId || uid) {
						run(go, uid);
					} else {
						go();
					}
				}, go);
			} else {
				go();
			}
		}
	};
}

notification.properties.robloxSound = function (a, note) {
	if (!Number(a)) { return notification.properties.speak(note.header + "\n" + note.lite, note); }
	soundService.robloxSound(a, function (s) {
		if (s && !note.closed) {
			s.volume(Number(storage.get("notificationVolume")) || .5).play(function () {
				if (note.closed) {
					s.stop();
				}
			}).play();
			note.close(function () { s.stop(); });
		}
	});
};

if (!ext.incognito) {
	setInterval(function () {
		chrome.browserAction.setBadgeText({ text: (Object.keys(notification.server).length || "").toString() });
	}, 250);
}

if (browser.name == "Chrome") {
	chrome.contextMenus.create({
		id: "clearNotifications", title: "Clear Notifications", contexts: ["browser_action"], onclick: function () {
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
			var id = Roblox.users.getIdFromUrl(e.linkUrl);
			var u = "https://www.roblox.com/Trade/TradeWindow.aspx?TradePartnerID=" + id;
			$.get(u).done(function (r) {
				if (($._(r).find("#aspnetForm[action]").attr("action") || "").endsWith("TradePartnerID=" + id)) {
					Roblox.trades.openSettingBasedTradeWindow(id);
				}
			});
		}
	});
};



/* Forums */
(function () {
	var threadCache = {};

	forumNotifier = setupNotifier(function (loop, uid) {
		var startup = forumNotifier.ran != uid;
		if (startup) {
			threadCache = {};
		}
		var blacklist = (storage.get("forums") || {}).blacklist;
		if (type(blacklist) != "array") {
			blacklist = [];
		}
		var dcb = 0;
		var mcb = 1;
		var tracked = [];
		var fcb = function () {
			if (++dcb == mcb) {
				loop();
			}
		};
		Roblox.users.getAuthenticatedUser().then(function (authenticatedUser) {
			mcb++;
			function handleForumData(data, isTrackedThreads) {
				forumNotifier.ran = uid;
				data.forEach(function (thread) {
					// If we're not starting up, and the thread is:
					// Just appearing and isn't a brand new post or something we just tracked
					// Has a new reply than we've seen before
					// not something we just posted
					// not blacklisted
					if (!startup && (
						(!threadCache.hasOwnProperty(thread.id) && !isTrackedThreads)
						|| (threadCache.hasOwnProperty(thread.id) && threadCache[thread.id].lastReply.id != thread.lastReply.id))
						&& thread.lastReply.poster != authenticatedUser.username
						&& !blacklist.includes(thread.id)) {
						mcb++;
						Roblox.forum.getForumThreadReplies(thread.id, thread.lastReply.page).then(function (post) {
							var o;
							for (var n in post.data) {
								if (post.data[n].id == thread.lastReply.id) {
									var reply = post.data[n];
									var note = {
										header: string.clean(reply.poster.username + " replied to thread\n" + post.subject.substring(0, 50)),
										lite: string.clean(reply.body.split("\n")[0]),
										icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(reply.poster.id, 3),
										buttons: ["Reply"],
										clickable: true,
										robloxSound: Number((storage.get("notifierSounds") || {}).forum) || 0,
										tag: "forum" + reply.id,
										url: {
											url: "https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + reply.id + (thread.lastReply.page != 1 ? "&PageIndex=" + thread.lastReply.page : "") + "#" + reply.id,
											close: true
										}
									};
									if (!note.robloxSound) {
										delete note.robloxSound;
										note.speak = note.header.split(/\n/)[0];
									}
									note = notify(note).button1Click(function () {
										window.open("https://forum.roblox.com/Forum/AddPost.aspx?mode=flat&PostID=" + reply.id);
										note.close();
									});
									break;
								}
							}
							fcb();
						}, fcb);
					}
					threadCache[thread.id] = thread;
				});
				fcb();
			}
			Roblox.forum.getTrackedThreads().then(function (data) {
				handleForumData(data.data);
			}, fcb);
			Roblox.forum.getRecentThreads().then(function (data) {
				handleForumData(data.data);
			}, fcb);
		}, fcb);
	}, {
		userId: true,
		storage: "forumNotifier",
		interval: 5 * 1000
	});

	forumNotifier.ran = 0;
	forumNotifier.run();
	forumNotifier.ransack = function (threadId) {
		delete threadCache[threadId];
	};
})();


chrome.webRequest.onBeforeRedirect.addListener(function (details) {
	if (url.path(details.url).toLowerCase() == "/forum/addpost.aspx" && details.method == "POST") {
		storage.get("forums", function (f) {
			f.last = Number(url.hash(details.redirectUrl))
			f.floodcheck = getMil();
			storage.set("forums", f);
		});
	}
}, { urls: ["*://*.roblox.com/Forum/*"] }, ["responseHeaders"]);



/* Trade Notifier */
tradeNotifier = setupNotifier(function (loop, uid, load) {
	var tn = storage.get("tradeNotifier");
	if (!tn && !storage.get("tradeChecker")) { loop(); return; }
	var old = tradeNotifier.cache.get(uid) || {};
	var dcb = 0;
	var outbound = [];
	var startup = tradeNotifier.ran != uid;
	if (startup) { tradeNotifier.cache.clear(); }
	load = function (t, p) {
		Roblox.trades.getTradesPaged(t, p).then(function (trades) {
			var outcheck = t == "outbound" && storage.get("tradeChecker");
			trades.data.forEach(function (trade) {
				var c = old[trade.id] != t;
				if (t == "outbound") {
					outbound.push(trade.id);
				}
				if (c || outcheck) {
					old[trade.id] = t;
					var lab = tradeNotifier.headers[trade.status];
					if ((outcheck && !tradeNotifier.outbound.hasOwnProperty(trade.id)) || (c && lab)) {
						Roblox.trades.get(trade.id).then(function (trade) {
							if (outcheck) {
								tradeNotifier.outbound[trade.id] = [];
								trade.authenticatedUserOffer.userAssets.forEach(function (userAsset) {
									tradeNotifier.outbound[trade.id].push(userAsset.userAssetId);
								});
								trade.tradePartnerOffer.userAssets.forEach(function (userAsset) {
									tradeNotifier.outbound[trade.id].push(userAsset.userAssetId);
								});
							}
							if (startup || !lab || !c || tradeNotifier.displayCache[trade.id + lab]) { return; }
							tradeNotifier.displayCache[trade.id + lab] = getMil();
							notify({
								header: "Trade " + lab,
								icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(trade.tradePartnerOffer.user.id, 3),
								items: {
									"Partner": trade.tradePartnerOffer.user.username,
									"Your RAP": addComma(trade.authenticatedUserOffer.assetValue) + (trade.authenticatedUserOffer.robux ? " +R$" + addComma(trade.authenticatedUserOffer.robux) : ""),
									"Their RAP": addComma(trade.tradePartnerOffer.assetValue) + (trade.tradePartnerOffer.robux ? " +R$" + addComma(trade.tradePartnerOffer.robux) : "")
								},
								buttons: trade.status == "Outbound" ? ["Cancel"] : [],
								clickable: true,
								robloxSound: Number((storage.get("notifierSounds") || {})["trade" + (trade.status == "Rejected" ? "Declined" : trade.status)]) || 0,
								url: { url: "https://www.roblox.com/My/Money.aspx?tradeId=" + trade.id + "#/#TradeItems_tab", close: true },
								tag: "trade" + trade.id
							}).button1Click(function () {
								Roblox.trades.decline(trade.id);
							});
						});
					}
				}
			});
			if (p < trades.count / 20 && outcheck) {
				load(t, p + 1);
			} else if (++dcb == (tn ? 4 : 1)) {
				for (var n in tradeNotifier.outbound) {
					if (outbound.indexOf(Number(n)) < 0) {
						delete tradeNotifier.outbound[n];
					}
				}
				tradeNotifier.cache.set(uid, old);
				tradeNotifier.ran = uid;
				loop();
			}
		}, function(){
			setTimeout(load, 5000, t, p);
		});
	};
	if (tn) {
		load("inbound", 1);
		load("completed", 1);
		load("inactive", 1);
	}
	load("outbound", 1);
}, {
	userId: true
});

tradeNotifier.ran = 0;
tradeNotifier.outbound = {};
tradeNotifier.displayCache = {};
tradeNotifier.cache = compact.cache(0);
tradeNotifier.headers = {
	"Pending approval from you": "inbound",
	"Pending approval from ": "outbound",
	"Completed": "completed",
	"Rejected due to error": "rejected",
	"Declined": "declined"
};
tradeNotifier.run();

request.sent(function (req, callBack) {
	if (req.request == "outboundTrades") {
		var uaidList = [];
		for (var n in tradeNotifier.outbound) { uaidList = uaidList.concat(tradeNotifier.outbound[n]); }
		callBack(uaidList);
	}
});



/* Friend Notifier */
friendNotifier = setupNotifier(function (loop, uid) {
	var fn = storage.get("friendNotifier") || {};
	if (!fn.on) {
		loop();
		return;
	}
	var startup = friendNotifier.ran != uid;
	if (startup) {
		friendNotifier.cache.clear();
	}
	friendNotifier.getFriendsWithPresence(uid).then(function (list) {
		friendNotifier.ran = uid;
		var tag = [];
		list.forEach(function (friend) {
			tag.push(friend.id);
			var old = friendNotifier.cache.get(friend.id);
			if (!startup && (type(fn.blocked) != "array" || fn.blocked.indexOf(friend.id) < 0)) {
				if (!old) {
					//friendNotifier.clicknote(o,"You and "+o.username+" are now friends!");
				} else if (fn.online && (old.isOnline != friend.isOnline) && friend.isOnline) {
					friendNotifier.clicknote(friend, friend.username + " is now online");
				} else if (fn.offline && (old.isOnline != friend.isOnline) && !friend.isOnline) {
					friendNotifier.clicknote(friend, friend.username + " is now offline");
				} else if (fn.game && friend.game && (!old.game || old.game.serverId != friend.game.serverId)) {
					note = notify({
						header: friend.username + " joined a game",
						lite: friend.game.name,
						icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 4),
						buttons: ["Follow"],
						robloxSound: Number((storage.get("notifierSounds") || {}).friend) || 0,
						tag: "friend" + friend.id,
						url: {
							url: Roblox.users.getProfileUrl(friend.id),
							close: true
						},
						clickable: true
					}).button1Click(function () {
						Roblox.games.launch({
							followUserId: friend.id
						});
					});
				}
			}
			friendNotifier.cache.set(friend.id, friend);
		});
		for (var n in friendNotifier.cache.data) {
			if (!tag.includes(Number(n))) {
				delete friendNotifier.cache.data[n];
			}
		}
		loop();
	}, loop);
}, {
	userId: true
});

friendNotifier.clicknote = function (friend, header, note) {
	return note = notify({
		header: header,
		icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 4),
		robloxSound: Number((storage.get("notifierSounds") || {}).friend) || 0,
		tag: "friend" + friend.id,
		clickable: true,
		url: {
			url: Roblox.users.getProfileUrl(friend.id),
			close: true
		}
	});
};

friendNotifier.getFriendsWithPresence = function (userId) {
	return new Promise(function (resolve, reject) {
		Roblox.social.getFriends(userId).then(function (friends) {
			var friendIds = [];
			var friendMap = {};
			friends.forEach(function (friend) {
				friendIds.push(friend.id);
				friendMap[friend.id] = friend;
			});
			Roblox.users.getPresence(friendIds).then(function (presences) {
				var friendsWithPresence = [];
				for (var n in presences) {
					var friend = friendMap[Number(n)];
					presences[n].username = friend.username;
					presences[n].id = friend.id;
					presences[n].isOnline = presences[n].locationType != 0;
					friendsWithPresence.push(presences[n]);
				}
				resolve(friendsWithPresence);
			}, reject);
		}, reject);
	});
};

friendNotifier.ran = 0;
friendNotifier.cache = compact.cache(0);
friendNotifier.run();



/* Group Shout Notifier */
groupNotifier = setupNotifier(function (loop, uid) {
	var startup = groupNotifier.ran != uid;
	$.get("https://www.roblox.com/Feeds/GetUserFeed").done(function (r) {
		var whitelist = storage.get("groupShoutNotifierList") || {};
		var got = {};
		$._(r).find(".feeds>.list-item").each(function () {
			var group = $(this).find(".list-content>a[href*='gid=']");
			if (group.length) {
				var id = Number(url.param("gid", group.attr("href"))) || 0;
				if (!id || got[id]) { return; }
				got[id] = true;
				var shout = $(this).find(".feedtext.linkify").text();
				shout = shout.substring(1, shout.length - 1);
				var timestamp = new Date($(this).find(".text-date-hint").text().replace(/\s*\|\s*/g, " ")).getTime();
				if (!startup && (groupNotifier.cache[id] || 0) < timestamp && (storage.get("groupShoutNotifier_mode") != "whitelist" || whitelist[id])) {
					var links = [];
					var buttons = [];
					foreach(shout.match(url.roblox.linkify) || [], function (n, o) {
						if (buttons.length < 2) {
							links.push(o);
							buttons.push("Visit link " + links.length);
						} else {
							return true;
						}
					});
					var note = {
						header: group.text(),
						lite: string.clean(shout.replace(/https?:\/\/w?w?w?\./gi, "")),
						icon: $(this).find(".header-thumb").attr("src"),
						buttons: buttons,
						clickable: true,
						robloxSound: Number((storage.get("notifierSounds") || {}).groupShout) || 0,
						tag: "groupshout" + id,
						url: { url: group.attr("href"), close: true }
					};
					if (!note.robloxSound) {
						delete note.robloxSound;
						note.speak = "Group shout from " + note.header;
					}
					notify(note).button1Click(function () {
						window.open(links[0]);
					}).button2Click(function () {
						window.open(links[1]);
					});
				}
				groupNotifier.cache[id] = Math.max(groupNotifier.cache[id] || 0, timestamp);
			}
		});
		groupNotifier.ran = uid;
	}).always(function () {
		loop();
	});
}, {
	userId: true,
	storage: "groupShoutNotifier"
});

groupNotifier.cache = {};
groupNotifier.ran = 0;
groupNotifier.run();



/* Harmful Website Blocker */
(function () {
	var blocked = {};
	var hasPermission = true;
	var permissions = {
		origins: ["<all_urls>"]
	};
	var mustCloseUrls = [];

	function getMaliciousUrls(callBack) {
		$.get("http://vps.roblox.plus/urlBlacklist.json").done(callBack).fail(function () {
			setTimeout(getMaliciousUrls, 30 * 1000, callBack);
		});
	}

	function blockMaliciousUrls(urls, reason, mustClose) {
		var blockList = [];
		for (var n in urls) {
			if (blocked[n]) {
				continue;
			}
			blocked[n] = urls[n];
			blockList.push(n);
		}
		if (blockList.length) {
			console.log("Blocking " + blockList.length + " url" + (blockList.length === 1 ? "" : "s") + "\n\t", blockList, "\n\tReason:", reason);
			if (mustClose) {
				mustCloseUrls = mustCloseUrls.concat(blockList);
			}
			chrome.webRequest.onBeforeRequest.addListener(function (details) {
				var note = notify({
					header: "Attempt to load malicious content blocked",
					content: "Reason: " + reason
				});
				setTimeout(note.close, 5000);
				return { cancel: true };
			}, { urls: blockList }, ["blocking"]);
		}
	}

	function getAndBlockMaliciousUrls() {
		getMaliciousUrls(function (urls) {
			for (var n in urls) {
				var list = n.split(",");
				var obj = {};
				for (var i = 0; i < list.length; i++) {
					obj[list[i]] = urls[n].dateAdded;
				}
				blockMaliciousUrls(obj, urls[n].description, urls[n].mustClose);
			}
			setTimeout(getAndBlockMaliciousUrls, 15 * 1000);
		});
	}

	function checkPermissions() {
		chrome.permissions.contains(permissions, function (hasAccess) {
			hasPermission = hasAccess;
			if (hasAccess) {
				getAndBlockMaliciousUrls();
			} else {
				setTimeout(checkPermissions, 5000);
			}
		});
	}
	checkPermissions();

	request.sent(function (req, callBack) {
		if (req.request == "isBlockingMaliciousContent") {
			callBack(hasPermission);
		} else if (req.request == "startBlockingMaliciousContent") {
			chrome.permissions.request(permissions, function (granted) {
				callBack(granted);
			});
		}
	});

	setTimeout(function () {
		setInterval(function () {
			if (mustCloseUrls.length) {
				chrome.tabs.query({
					url: mustCloseUrls,
					status: "loading"
				}, function (tabs) {
					var tabIds = [];
					tabs.forEach(function (tab) { tabIds.push(tab.id); });
					if (tabs.length && tabs.length < 3) { // Failsafe...
						console.log("Closing " + tabIds.length + " tab" + (tabIds.length === 1 ? "" : "s") + " for malicious content.");
						var note = notify({
							header: tabIds.length + " tab" + (tabIds.length === 1 ? "" : "s") + " closed for malicious content"
						});
						setTimeout(note.close, 5000);
						chrome.tabs.remove(tabIds, function () { });
					}
				});
			}
		}, 100);
	}, 60 * 1000);
})();



/* Extension Icon */
chrome.browserAction.setTitle({ title: ext.manifest.name + " " + ext.manifest.version });



/* hueee no image or ticket stealing */
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	var path = url.path(details.url);
	if (path.match(/^\/asset\/?$/)) {
		return { cancel: true };
	}
}, { urls: ["*://*.roblox.com/asset/*"], types: ["sub_frame", "main_frame"] }, ["blocking"]);



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
		for (var n in startnote.names) { ext.tts.replacements.push([RegExp.escape(n).regex("gi"), startnote.names[n]]); }
		var note = $.notification({
			speachGender: "male",
			title: ext.manifest.name + " started",
			context: user ? "Hello, " + user.username + "!" : "You're currently signed out",
			speak: user ? "Hello, " + user.username : "",
			buttons: [
				"Problems? Suggestions? Message me!"
			],
			items: {
				"Version": ext.manifest.version,
				"Made by": "WebGL3D"
			},
			clickable: true
		}).click(function () {
			this.close();
			rplusSettings.get(function (ul) {
				window.open(ul.updateLog || "https://www.roblox.com/users/48103520/profile?rbxp=48103520");
			});
		}).buttonClick(function () {
			note.close();
			window.open("https://www.roblox.com/messages/compose?recipientId=48103520");
		});
		setTimeout(note.close, 15 * 1000);
	});
});



// WebGL3D
