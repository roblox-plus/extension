var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};
RPlus.Pages.Account = function () {
	if (!location.search.includes("rplus")) {
		var li = $("<li class=\"menu-option\">");
		var a = $("<a class=\"rbx-tab-heading text-lead\">").text(ext.manifest.name).attr("href", ext.manifest.homepage_url);
		$("#vertical-menu").append(li.append(a));
		return {};
	}

	function constantBoolSetting(name, description, value, unsupported) {
		var setting = {
			"name": name,
			"type": typeof (true),
			"get": function (callBack) { callBack(true); },
			"set": function () { },
			"description": description,
			"disabled": true
		};
		if (unsupported) {
			setting.unsupported = true;
		}
		return setting;
	}

	var themeSetting = {
		"name": "Website theme",
		"type": [
			{
				"name": "Default",
				"value": ""
			}, {
				"name": "OBC",
				"value": RPlus.style.themeTypes.obc.type
			}
		],
		"get": function (callBack) {
			storage.get("siteTheme", function(val) {
				callBack(val);
			});
		},
		"set": function(val) {
			RPlus.style.setTheme(RPlus.style.themeTypes[val]);
		},
		"description": "Sets a style for the website."
	};
	var settings = {
		"General": [
			{
				"name": "Roblox+ Premium",
				"type": typeof (true),
				"disabled": true,
				"get": function (callBack) {
					RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(callBack).catch(function () {
						callBack(false);
					});
				},
				"set": function () { },
				"description": "Roblox+ Premium unlocks the purchase button for new collectible items, and all the website themes.",
				"after": function (row) {
					RPlus.premium.getPremium(Roblox.users.authenticatedUserId).then(function (premium) {
						row.append($("<br>"));
						var hubLink = $("<a>").attr({
							"href": Roblox.games.getGameUrl(258257446, "Roblox+ Hub"),
							"class": "text-link",
							"target": "_blank"
						}).text("Roblox+ Hub");

						if (premium) {
							if (premium.expiration) {
								var expiration = new Date(premium.expiration);
								row.append("You have Roblox+ Premium, thanks for the support!",
									$("<br>"),
									"Your premium membership expires on: " + expiration.toLocaleDateString(),
									$("<br>"),
									"To keep premium going after this date make sure you have automatic renewal for the VIP server turned on at the ", hubLink);
							} else {
								row.append("You have a lifetime Roblox+ Premium membership! Nice!",
									$("<br>"),
									"You are either a friend of WebGL3D, or bought it when it was still a t-shirt.",
									$("<br>"),
									"Either way, thanks for sticking around!");
							}
						} else {
							row.append("To get Roblox+ Premium buy a VIP server from this place: ", hubLink);
						}
					}).catch(function() {
						row.append($("<br>"), "Failed to load premium membership status. Try reloading the extension.");
					});
				}
			},
			themeSetting
		],
		"Sound": [
			constantBoolSetting("Sound volume control", "Upgrades all audio play buttons on the website to have volume controls.", true),
			{
				"name": "Audio volume",
				"type": { "min": 0, "max": 100 },
				"get": function(callBack) {
					storage.get("volume", function (x) {
						callBack(typeof(x) === "number" ? x * 100 : 50);
					});
				},
				"set": function(val) {
					storage.set("volume", val / 100);
				},
				"description": "The default volume for audio"
			}, {
				"name": "Voice volume",
				"type": { "min": 0, "max": 100 },
				"get": function (callBack) {
					storage.get("voiceVolume", function (x) {
						callBack(typeof (x) === "number" ? x * 100 : 50);
					});
				},
				"set": function (val) {
					storage.set("voiceVolume", val / 100);
				},
				"description": "The default volume for the voice"
			}
		],
		"Item": [
			{
				"name": "Catalog notifier",
				"type": typeof (true),
				"storage": "itemNotifier",
				"description": "Get notifications when an official Roblox item in the catalog gets updated or created."
			}, {
				"name": "Catalog notifier sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function(notifierSounds) {
						callBack(notifierSounds ? notifierSounds.item : 205318910);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.item = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when a catalog item notification pops up."
			}, {
				"name": "Purchase button on new limited notifications",
				"type": typeof (true),
				"disabled": true,
				"get": function (callBack) {
					RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(callBack).catch(function () {
						callBack(false);
					});
				},
				"set": function () { },
				"description": "When a new collectible item comes out in the catalog if you have this enabled you will have a purchase button directly on the notification."
			}, {
				"name": "Live collectible remaining counter",
				"type": typeof (true),
				"storage": "remainingCounter",
				"description": "Collectible items with have their remaining counters updated without refreshing the page."
			},
			constantBoolSetting("Asset content", "View assets contained inside another asset under a Content tab on specific asset pages.", true),
			constantBoolSetting("Texture download", "Adds a download button to the pages of Roblox created image assets.", true),
			constantBoolSetting("Asset owners", "On Roblox created assets see a list of everyone who owns that asset.", true),
			constantBoolSetting("Easily delete items from inventory page", "Adds delete buttons to all free items on your inventory page.", true),
			constantBoolSetting("Comments timer", "Keeps track of how long it will be until you can post another comment", true, true)],
		"Forum": [
			{
				"name": "Display individual post Ids",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? !!forums.postIds : false);
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.postIds = !!val;
						storage.set("forums", forums);
					});
				},
				"description": "Display the ids of each individual post next to the date they were posted."
			}, {
				"name": "Respect blocked users list",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? !!forums.blocked : false);
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.blocked = !!val;
						storage.set("forums", forums);
					});
				},
				"description": "If a user is on your block list hide their posts."
			}, {
				"name": "Collectibles value on posts",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? !!forums.rap : false);
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.rap = !!val;
						storage.set("forums", forums);
					});
				},
				"description": "Display a users Recent Average Price (RAP) of all of their collectibles under their character on their posts."
			}, {
				"name": "Post embedding",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? !!forums.embedding : false);
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.embedding = !!val;
						storage.set("forums", forums);
					});
				},
				"description": "Convert audio links to playable format, YouTube links into videos, decals into images, Lua syntax highlighting, and more!"
			}, {
				"name": "Post embedding size",
				"type": { "min": 25, "max": 100, "step": 25 },
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? forums.embedSize : 75);
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.embedSize = Number(val);
						storage.set("forums", forums);
					});
				},
				"description": "The size of images when embedded on posts."
			},
			constantBoolSetting("Forum stretch prevention", "Prevents forum post titles from stretching the page. Double click under a poster to shrink their height as well.", true),
			constantBoolSetting("Forum flood checking", "When posting on the forums a timer will kick off in the background to keep track of when you can post again.", true),
			constantBoolSetting("Background thread tracking", "Tracking, and untracking forum threads won't refresh the page. My Forums will have tracked threads with tick boxes to untrack them.", true, true),
			{
				"name": "Forum signature",
				"type": typeof (""),
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? forums.signature : "");
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.signature = val;
						storage.set("forums", forums);
					});
				},
				"description": "A line of text added to posts you make on the forum.",
				"maxlength": 250
			}, {
				"name": "How many lines to put below your post before the signature",
				"type": { "min": 1, "max": 4 },
				"get": function (callBack) {
					storage.get("forums", function (forums) {
						callBack(forums ? forums.lines : 3);
					});
				},
				"set": function (val) {
					storage.get("forums", function (forums) {
						forums = forums || {};
						forums.lines = Number(val);
						storage.set("forums", forums);
					});
				},
				"description": "The size of images when embedded on posts."
			}, {
				"name": "Forum notifier",
				"type": typeof (true),
				"storage": "forumNotifier",
				"description": "Get notifications when someone replies to a thread you're tracking, or have replied to."
			}, {
				"name": "Forum notifier sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.forum : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.forum = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when the forum notifier goes off."
			}],
		"Trade": [
			{
				"name": "Outbound asset checker",
				"type": typeof (true),
				"storage": "tradeChecker",
				"description": "Items you have in outbound trades will be highlighted in the trade window."
			}, {
				"name": "Open trades in new tab",
				"type": typeof (true),
				"storage": "tradeTab",
				"description": "Trades will open in a new tab instead of a new window."
			}, {
				"name": "Trade evaluator",
				"type": typeof (true),
				"storage": "tradePageRapAssist",
				"description": "Loads trade information beforing opening the trade and determines who has higher value."
			},
			constantBoolSetting("Trade and transaction counters", "Counts how many trades, or transactions you have on the money page.", true, true),
			constantBoolSetting("Cancel all outbound trades button", "On the trades page for outbound trade there will be a button to cancel all trades outboundl.", true),
			{
				"name": "Trade notifier",
				"type": typeof (true),
				"storage": "tradeNotifier",
				"description": "Get notified about new inbound, completed, declined, or outbound trades."
			}, {
				"name": "Trade inbound sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.tradeInbound : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.tradeInbound = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when a trade comes inbound."
			}, {
				"name": "Trade outbound sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.tradeOutbound : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.tradeOutbound = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when a trade goes outbound."
			}, {
				"name": "Trade completed sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.tradeCompleted : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.tradeCompleted = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when a trade is completed."
			}, {
				"name": "Trade declined sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.tradeDeclined : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.tradeDeclined = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when a trade comes inbound."
			}],
		"Navigation": [
			{
				"name": "Live navigation counters",
				"type": typeof (true),
				"storage": "navcounter",
				"description": "Up-to-date navigation counters without refreshing for Robux, Messages, Friends, and Trades."
			}, {
				"name": "Side navigation bar always open",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("navigation", function (navigation) {
						callBack(navigation ? !!navigation.sideOpen : false);
					});
				},
				"set": function (val) {
					storage.get("navigation", function (navigation) {
						navigation = navigation || {};
						navigation.sideOpen = !!val;
						storage.set("navigation", navigation);
					});
				},
				"description": "Keeps the side navigation bar open on smaller screens.",
				"unsupported": true
			}, {
				"name": "Navigation counter caps",
				"type": [
					{
						"name": "1,000",
						"value": 1000
					}, {
						"name": "10,000",
						"value": 10000
					}, {
						"name": "100,000",
						"value": 100000
					}, {
						"name": "1,000,000",
						"value": 1000000
					}, {
						"name": "10,000,000",
						"value": 10000000
					}, {
						"name": "100,000,000",
						"value": 100000000
					}
				],
				"get": function (callBack) {
					storage.get("navigation", function (navigation) {
						callBack(navigation ? navigation.counterCommas : 10000);
					});
				},
				"set": function (val) {
					storage.get("navigation", function (navigation) {
						navigation = navigation || {};
						navigation.counterCommas = val;
						storage.set("navigation", navigation);
					});
				},
				"description": "Will cut off navigation counters and start capping at this value."
			}, {
				"name": "Navigation button one text",
				"type": typeof (""),
				"get": function (callBack) {
					storage.get("navigation", function (navigation) {
						callBack(navigation && navigation.buttons && navigation.buttons[0] ? navigation.buttons[0].text : "Develop");
					});
				},
				"set": function (val) {
					storage.get("navigation", function (navigation) {
						navigation = navigation || {};
						navigation.buttons = navigation.buttons || [{ "text": "Develop", "href": "/develop" }, { "text": "Forums", "href": "/forum" }];
						navigation.buttons[0].text = val;
						storage.set("navigation", navigation);
					});
				},
				"description": "Sets the text for the first overrideable navigation button"
			}, {
				"name": "Navigation button one link",
				"type": typeof (""),
				"get": function (callBack) {
					storage.get("navigation", function (navigation) {
						callBack(navigation && navigation.buttons && navigation.buttons[0] ? navigation.buttons[0].href : "/develop");
					});
				},
				"set": function (val) {
					storage.get("navigation", function (navigation) {
						navigation = navigation || {};
						navigation.buttons = navigation.buttons || [{ "text": "Develop", "href": "/develop" }, { "text": "Forums", "href": "/forum" }];
						navigation.buttons[0].href = val;
						storage.set("navigation", navigation);
					});
				},
				"description": "Sets the link for the first overrideable navigation button"
			}, {
				"name": "Navigation button two text",
				"type": typeof (""),
				"get": function (callBack) {
					storage.get("navigation", function (navigation) {
						callBack(navigation && navigation.buttons && navigation.buttons[1] ? navigation.buttons[1].text : "Forums");
					});
				},
				"set": function (val) {
					storage.get("navigation", function (navigation) {
						navigation = navigation || {};
						navigation.buttons = navigation.buttons || [{ "text": "Develop", "href": "/develop" }, { "text": "Forums", "href": "/forum" }];
						navigation.buttons[1].text = val;
						storage.set("navigation", navigation);
					});
				},
				"description": "Sets the text for the second overrideable navigation button"
			}, {
				"name": "Navigation button two link",
				"type": typeof (""),
				"get": function (callBack) {
					storage.get("navigation", function (navigation) {
						callBack(navigation && navigation.buttons && navigation.buttons[1] ? navigation.buttons[1].href : "/forum");
					});
				},
				"set": function (val) {
					storage.get("navigation", function (navigation) {
						navigation = navigation || {};
						navigation.buttons = navigation.buttons || [{ "text": "Develop", "href": "/develop" }, { "text": "Forums", "href": "/forum" }];
						navigation.buttons[1].href = val;
						storage.set("navigation", navigation);
					});
				},
				"description": "Sets the link for the second overrideable navigation button"
			}],
		"Groups": [
			{
				"name": "Group shout notifier",
				"type": typeof (true),
				"storage": "groupShoutNotifier",
				"description": "When a group your in changes their group shout you will get a notification."
			}, {
				"name": "Group shout notifier sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.groupShout : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.groupShout = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when the group shout notifier pops up a notification."
			}, {
				"name": "Group shout notifier mode",
				"type": [
					{
						"name": "All notifications",
						"value": "all"
					}, {
						"name": "Whitelisted groups",
						"value": "whitelist"
					}],
				"storage": "groupShoutNotifier_mode",
				"description": "How the group shout notifier should decide whether or not to show you a notification."
			}, {
				"name": "Display roles on posts",
				"type": typeof (true),
				"storage": "groupRoleDisplay",
				"description": "Display a users role in the group on their wall posts."
			}],
		"Friends": [
			{
				"name": "Notify me when my friend joins a game",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("friendNotifier", function (friendNotifier) {
						callBack(friendNotifier ? !!friendNotifier.game : false);
					});
				},
				"set": function (val) {
					storage.get("friendNotifier", function (friendNotifier) {
						friendNotifier = friendNotifier || {};
						friendNotifier.game = !!val;
						storage.set("friendNotifier", friendNotifier);
					});
				},
				"description": "If the friend notifier and this are enabled you will get a notification when a friend of yours joins a game."
			}, {
				"name": "Notify me when my friend comes online",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("friendNotifier", function (friendNotifier) {
						callBack(friendNotifier ? !!friendNotifier.online : false);
					});
				},
				"set": function (val) {
					storage.get("friendNotifier", function (friendNotifier) {
						friendNotifier = friendNotifier || {};
						friendNotifier.online = !!val;
						storage.set("friendNotifier", friendNotifier);
					});
				},
				"description": "If the friend notifier and this are enabled you will get a notification when a friend of yours comes online.",
				"unsupported": true
			}, {
				"name": "Notify me when my friend goes offline",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("friendNotifier", function (friendNotifier) {
						callBack(friendNotifier ? !!friendNotifier.offline : false);
					});
				},
				"set": function (val) {
					storage.get("friendNotifier", function (friendNotifier) {
						friendNotifier = friendNotifier || {};
						friendNotifier.offline = !!val;
						storage.set("friendNotifier", friendNotifier);
					});
				},
				"description": "If the friend notifier and this are enabled you will get a notification when a friend of yours goes offline.",
				"unsupported": true
			},
			constantBoolSetting("Unfollow all users button on friends page", "Unfollows all users who you are not friends with.", true), 
			constantBoolSetting("Follow all friends button on friends page", "Follows all users who you are friends with.", true),
			{
				"name": "Friends notifier",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("friendNotifier", function (friendNotifier) {
						callBack(friendNotifier ? !!friendNotifier.on : false);
					});
				},
				"set": function (val) {
					storage.get("friendNotifier", function (friendNotifier) {
						friendNotifier = friendNotifier || {};
						friendNotifier.on = !!val;
						storage.set("friendNotifier", friendNotifier);
					});
				},
				"description": "Master on/off switch for any friend notifications from the extension."
			}, {
				"name": "Friend notifier sound",
				"type": "audio",
				"get": function (callBack) {
					storage.get("notifierSounds", function (notifierSounds) {
						callBack(notifierSounds ? notifierSounds.friend : 0);
					});
				},
				"set": function (val) {
					storage.get("notifierSounds", function (notifierSounds) {
						notifierSounds = notifierSounds || {};
						notifierSounds.friend = Number(val);
						storage.set("notifierSounds", notifierSounds);
					});
				},
				"description": "An id of a Roblox sound that will play when a notification for the friends notifier pops up."
			}],
		"Other": [
			{
				"name": "Changed username login",
				"type": typeof (true),
				"storage": "changedLogin",
				"description": "Allows you to log in with a previous username."
			}, {
				"name": "Sale toggle buttons on the develop page",
				"type": typeof (true),
				"storage": "quickSell",
				"description": "Buttons on items on the develop page for toggling whether or not an item is on sale (using lowest price) from the develop page.",
				"unsupported": true
			}, {
				"name": "Collectibles value on profiles",
				"type": typeof (true),
				"storage": "profileRAP",
				"description": "Display a users Recent Average Price (RAP) of all of their collectibles on their profile."
			}, {
				"name": "Startup notification",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("startupNotification", function (startup) {
						callBack(startup ? !!startup.on : false);
					});
				},
				"set": function (val) {
					storage.get("startupNotification", function (startup) {
						startup = startup || {};
						startup.on = !!val;
						storage.set("startupNotification", startup);
					});
				},
				"description": "When the extension turns on if this is ticked it will give you a notification with a link to the update log, and current version."
			}, {
				"name": "Only display startup notification after visiting Roblox",
				"type": typeof (true),
				"get": function (callBack) {
					storage.get("startupNotification", function (startup) {
						callBack(startup ? !!startup.visit : false);
					});
				},
				"set": function (val) {
					storage.get("startupNotification", function (startup) {
						startup = startup || {};
						startup.visit = !!val;
						storage.set("startupNotification", startup);
					});
				},
				"description": "Will display the startup notification after you visit Roblox rather than when the extension starts."
			},
			constantBoolSetting("Avatar filter bar", "On the avatar page a filter bar will be added to only show items that match text you've put in.", true),
			constantBoolSetting("Roblox+ Notification Center", "In the Roblox notification stream there is also a section for Roblox+ which is a history of all unclosed notifications from the extension per session.", true),
			constantBoolSetting("Profile sale statistics", "On user profiles sale counters are added for how many clothing, or models they've sold.", true, true),
			constantBoolSetting("Allow multiple private message sending", "Send the same message to multiple people at the same time by adding more users in the \"to\" bar.", true, true),
			constantBoolSetting("JSON Pretty Printing", "On JSON pages from Roblox hitting enter will \"pretty-print\" the page.", true, true),
			{
				"name": "How Roblox+ should pronounce your name",
				"type": typeof (""),
				"get": function(callBack) {
					Roblox.users.getAuthenticatedUser().then(function (user) {
						if (user) {
							storage.get("startupNotification", function (x) {
								var names = x && x.names ? x.names : {};
								callBack(names[user.username.toLowerCase()] || user.username);
							});
						} else {
							callBack("");
						}
					}).catch(function () {
						callBack("");
					});
				},
				"set": function (val) {
					Roblox.users.getAuthenticatedUser().then(function (user) {
						if (user) {
							storage.get("startupNotification", function (x) {
								x = x || {};
								x.names = x.names || {};
								x.names[user.username.toLowerCase()] = val;
								storage.set("startupNotification", x);
							});
						} else {
							console.warn("Failed to set username pronunciation: no user");
						}
					}).catch(function (e) {
						console.warn("Failed to set username pronunciation", e);
					});
				},
				"description": "Currently only has effect on the startup notification."
			}]
	};

	var pageContent = $("<div class=\"page-content rplus\">");

	var settingIdBase = 0;
	function getSettingId() {
		return "rplus-setting-" + (++settingIdBase);
	}

	function createToolTip(tip) {
		var container = $("<span>").attr({
			"class": "tooltip-container",
			"title": tip
		});
		var icon = $("<span>").attr("class", "icon-moreinfo");
		return container.append(icon);
	}

	for (var n in RPlus.style.themeTypes) {
		if (RPlus.style.themeTypes.hasOwnProperty(n) && n !== "obc") {
			themeSetting.type.push({
				"name": RPlus.style.themeTypes[n].name,
				"value": RPlus.style.themeTypes[n].type,
				"disabled": true
			});
		}
	}

	function loadSettings() {
		for (var n in settings) {
			if (settings.hasOwnProperty(n)) {
				(function (title, list) {
					var section = $("<div>").attr("class", "section rplus");
					var header = $("<h3>").text(title);
					var outerContainer = $("<div>").attr("class", "section-content");
					var container = $("<div>").attr("class", "col-sm-12");

					list.forEach(function (setting) {
						var id = getSettingId();
						if (setting.storage) {
							if (typeof (true) === setting.type) {
								setting.get = function (callBack) {
									storage.get(setting.storage, function (val) {
										callBack(!!val);
									});
								};
								setting.set = function (val) {
									storage.set(setting.storage, !!val);
								};
							} else if (Array.isArray(setting.type) || setting.type === typeof ("")) {
								setting.get = function (callBack) {
									storage.get(setting.storage, function (val) {
										callBack(val || "");
									});
								};
								setting.set = function (val) {
									storage.set(setting.storage, val);
								};
							}
						}

						var row = $("<div>");

						if (typeof (true) === setting.type) {
							row.attr("class", "checkbox");
							var checkbox = $("<input>").attr({
								"type": "checkbox",
								"id": id
							});
							var label = $("<label>").attr("for", id).text(setting.name);

							if(typeof(setting.disabled) === "function") {
								setting.disabled(function (isDisabled) {
									checkbox.prop("disabled", isDisabled);
								});
							} else if (setting.disabled) {
								checkbox.prop("disabled", true);
							}

							setting.get(function(val) {
								checkbox.prop("checked", val).change(function() {
									setting.set(checkbox.prop("checked"));
								});
							});

							var tooltip = createToolTip(setting.description);
							row.append(tooltip, checkbox, label);
						} else if (Array.isArray(setting.type)) {
							row.addClass("section-content");
							var radioTitle = $("<h4>").text(setting.name);
							var radioDescription = $("<div>").addClass("text-date-hint").text(setting.description);

							setting.type.forEach(function(radio, n) {
								var radioId = id + "-" + n;
								var radioRow = $("<div>").attr("class", "radio");
								var input = $("<input>").attr({
									"id": radioId,
									"name": id,
									"type": "radio"
								}).val(radio.value);
								var label = $("<label>").attr("for", radioId).text(radio.name);

								if (radio.disabled) {
									input.prop("disabled", true);
								}

								input.change(function() {
									if (input.prop("checked")) {
										setting.set(radio.value);
									}
								});

								row.append(radioRow.append(input, label));
							});

							setting.get(function(val) {
								$("input[type='radio'][name='" + id + "'][value='" + val + "']").prop("checked", true);
							});

							row.prepend(radioTitle, radioDescription);
						} else if (setting.type === typeof ("")) {
							row.attr("class", "form-group");
							var label = $("<label>").attr("class", "text-label").text(setting.name);
							var input = $("<input>").attr({
								"id": id,
								"type": "text",
								"class": "form-control input-field",
								"maxlength": setting.maxlength
							});

							input.blur(function () {
								setting.set(input.val());
							}).keyup(function (key) {
								if (key.keyCode === 13) {
									$(this).blur();
								}
							});

							setting.get(function (val) {
								input.val(val);
							});

							row.append(label, input);
						} else if (setting.type === "audio") {
							row.attr("class", "form-group");
							var label = $("<label>").attr("class", "text-label").text(setting.name);
							var input = $("<input>").attr({
								"id": id,
								"type": "number",
								"class": "form-control input-field",
								"maxlength": 12
							});
							var soundButton = soundService.robloxSound.button(input, "div");

							input.blur(function () {
								setting.set(input.val());
							}).keyup(function (key) {
								if (key.keyCode === 13) {
									$(this).blur();
								}
							});

							setting.get(function (val) {
								input.val(val.toString()).trigger("change");
							});

							row.append(label, input, soundButton);
						} else if (typeof(setting.type) === typeof ({}) && setting.type.hasOwnProperty("min") && setting.type.hasOwnProperty("max")) {
							row.attr("class", "form-group");
							var label = $("<label>").attr("class", "text-label").text(setting.name);
							var input = $("<input>").attr({
								"id": id,
								"type": "range",
								"class": "form-control",
								"max": setting.type.max,
								"min": setting.type.min,
								"step": setting.type.step || 1
							});

							input.on("input", function () {
								setting.set(input.val());
								input.attr("title", input.val());
							});

							setting.get(function (val) {
								input.val(val).attr("title", val);
							});

							row.append(label, input);
						} else {
							console.warn("Unknown setting type: " + setting.type);
							return;
						}

						if (setting.unsupported) {
							var warning = $("<p>").text("Warning: This feature is unsupported by the creator of this extension. If it stops working it may not be fixed!").addClass("text-warning").hide();
							warning.prepend($("<span>").attr("class", "icon-warning-orange"));
							row.append(warning);
							row.find("label,h4").mouseover(function() {
								warning.slideDown(100);
							}).mouseout(function() {
								warning.slideUp(100);
							});
						}

						if (setting.after) {
							setting.after(row);
						}

						container.append(row);
					});

					header.click(function () {
						if (outerContainer.is(":visible")) {
							outerContainer.slideUp();
						} else {
							outerContainer.slideDown();
						}
					});

					pageContent.append(section.append(header).append(outerContainer.append(container)));
				})(n, settings[n]);
			}
		}
	}

	RPlus.premium.allThemesUnlocked(Roblox.users.authenticatedUserId).then(function (unlocked) {
		if (unlocked) {
			themeSetting.type.forEach(function (setting) {
				delete setting.disabled;
			});
		}
		loadSettings();
	}).catch(function (e) {
		console.warn("Failed to check theme status", e);
		loadSettings();
	});


	var updateLogButton = $("<button>").addClass("btn-control-md").text("Update Log");
	var reloadButton = $("<button>").addClass("btn-control-md").text("Reload");

	updateLogButton.click(function () {
		RPlus.settings.get().then(function (s) {
			if (s.updateLog) {
				window.open(s.updateLog);
			}
		}).catch(function (e) {
			console.error("failed to get update log", e);
		});
	});
	reloadButton.click(function () {
		ext.reload(function () {
			setTimeout(function () {
				window.location.reload(true);
			}, 1500);
		});
	});
	
	RPlus.style.loadStylesheet(ext.getUrl("/css/pages/account.css"));
	$("#settings-container").html(pageContent);
	$(".user-account-header").text(ext.manifest.name + " " + ext.manifest.version).append(reloadButton, updateLogButton);

	return {};
}

RPlus.Pages.Account.patterns = [/^\/my\/account/i];


// WebGL3D
