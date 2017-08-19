var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

function loadV2Page() {
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
		"Sound": [
			constantBoolSetting("Sound volume control", "Upgrades all audio play buttons on the website to have volume controls.", true)
		],
		"Premium": [],
		"Item": [
			{
				"name": "Catalog notifier",
				"type": typeof (true),
				"storage": "itemNotifier",
				"description": "Get notifications when an official Roblox item in the catalog gets updated or created."
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
			constantBoolSetting("Follow all friends button on friends page", "Follows all users who you are friends with.", true)],
		"Other": [
			themeSetting,
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

							if (setting.disabled) {
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
						} else if (setting.type === typeof("")) {
							row.attr("class", "form-group");
							var label = $("<label>").attr("class", "text-label").text(setting.name);
							var input = $("<input>").attr({
								"id": id,
								"type": "text",
								"class": "form-control input-field",
								"maxlength": setting.maxlength
							});

							input.blur(function() {
								setting.set(input.val());
							}).keyup(function(key) {
								if (key.keyCode === 13) {
									$(this).blur();
								}
							});

							setting.get(function(val) {
								input.val(val);
							});

							row.append(label, input);
						} else if (setting.type === typeof ({}) && setting.type.min && setting.type.max) {

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

	RPlus.style.loadStylesheet(ext.getUrl("/css/pages/account.css"));
	$("#settings-container").html(pageContent);
	$(".user-account-header").text(ext.manifest.name + " " + ext.manifest.version);
}

RPlus.Pages.Account = function () {
	// Lock off new page to just me for development.
	if (Roblox.users.authenticatedUserId === 48103520 && location.search.includes("dev")) {
		loadV2Page();
		return {};
	}

	var compileStorage;

	var styleTag = $("<style>");
	var controlPanel = $("<div class=\"tab-content rbx-tab-content\" id=\"rplusControlPanel\">").append($("<div class=\"section-content\">").append($("<div class=\"col-sm-3\">").append($("<h3>").text(ext.manifest.name + " " + ext.manifest.version))).append($("<div class=\"col-sm-9\">").append(ext.reload.enabled ? $("<button class=\"btn-control-md acct-settings-btn\" style=\"margin-left: 10px;\">Reload</button>").click(function () {
		ext.reload(function (s) {
			if (s) {
				setTimeout(function () {
					window.location.reload(true);
				}, 1000);
			}
		});
	}) : "").append($("<button class=\"btn-control-md acct-settings-btn\">").text("Update Log").click(function () {
		rplusSettings.get().then(function (s) {
			if (s.updateLog) {
				window.open(s.updateLog);
			}
		}).catch(function (e) {
			console.error("failed to get update log", e);
		});
	})))).hide();
	var tabContent = $("#settings-container > .tab-content");

	var labId = 0;
	var objectSaver = function (s, i, p) {
		p = isCB(p) ? p : function (v) { return v; };
		return function (v) {
			storage.get(s, function (x) {
				x = type(x) == "object" ? x : {};
				if (isCB(v)) {
					v(x[i]);
				} else {
					x[i] = p(v);
					storage.set(s, x);
				}
			});
		}
	};
	var checkStorage = function (o, i) {
		if (isCB(o.storage)) {
			i.change(function () { o.storageHandle(i.val()); });
		} else {
			i.attr("storage", o.storage);
		}
	};
	var toWidth = function (e, o) {
		if (o.hasOwnProperty("width")) {
			e.css("width", type(o.width) == "string" ? o.width : o.width + "px");
		}
	};
	compileStorage = function (n, o) {
		if (o.browser && o.browser.indexOf(browser.name) < 0) { return ""; }
		var gid = "rplusboxid_" + (++labId);
		var group = $("<div class=\"form-group\">");
		o.storageHandle = isCB(o.storage) ? o.storage : (function (s) { return function (v) { storage[isCB(v) ? "get" : "set"](s, v); }; })(o.storage);

		if (!o.tip && o.type == "sound") {
			o.tip = "Paste a Roblox audio id that plays with the notification";
		}
		if (o.tip) {
			o.tip = $("<div class=\"tooltip bottom fade in\">").mouseover(function () {
				$(this).hide();
			}).append($("<div class=\"tooltip-arrow\">")).append($("<div class=\"tooltip-inner\">").text(o.tip)).hide();
			group.prepend($("<span class=\"rbx-tooltip\" tooltip-placement=\"bottom\">").click(function () {
				/*if(el){
					$(".rbx-form-group[rplusscrollto='"+el+"']")[0].scrollIntoView(true);
					window.scrollBy(0,-40);
				}*/
			}).mouseover(function () {
				$(this).after(o.tip.css({ "top": (this.offsetTop + 22) + "px", "left": (this.offsetLeft - 86) + "px" }).show());
			}).mouseout(function () {
				o.tip.hide();
			}).append($("<span class=\"icon-moreinfo\">")));//.css("cursor",el?"pointer":"default"));
		}

		if (n == "New Limited Buy Button") {
			group.addClass("checkbox").append(o.checkbox = $("<input type=\"checkbox\">")).append($("<label for>").text(n)).css("cursor", "pointer").click(function () {
				window.open(Roblox.games.getGameUrl(258257446, "Roblox+ Hub"));
			});
			RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(function (ispremium) {
				o.checkbox.prop("checked", ispremium);
			}).catch(function (e) {
				console.warn(e);
			});
			return group;
		} else if (o.type == "speak" && !ext.tts.enabled) {
			return "";
		}

		if (o.type == "bool") {
			group.addClass("checkbox").append(o.checkbox = $("<input type=\"checkbox\">").attr("id", gid)).append($("<label>").attr("for", gid).text(n));
			o.storageHandle(function (v) {
				o.checkbox.prop("checked", !!v);
				if (isCB(o.storage)) {
					o.checkbox.change(function () { o.storageHandle($(this).prop("checked")); });
				} else {
					o.checkbox.attr("storage", o.storage);
				}
			});
		} else if (type(o.type) == "object" && type(o.type.max) == "number") {
			group.append($("<label>").text(n)).append(o.range = $("<input type=\"range\" class=\"rplusslider\">").attr("step", type(o.type.step) == "number" ? o.type.step : 1).attr("max", o.type.max || 100).attr("min", type(o.type.min) == "number" ? o.type.min : 0));
			toWidth(o.range, o.type);
			o.storageHandle(function (v) {
				checkStorage(o, o.range.val(v).trigger("change"));
			});
		} else if (type(o.type) == "object") {
			group.addClass("rbx-select-group").append($("<label>").text(n)).append(o.dropdown = $("<select class=\"rbx-select\">"));
			foreach(o.type, function (label, val) { o.dropdown.append($("<option>").text(label).val(val)); });
			toWidth(o.dropdown, o);
			o.storageHandle(function (v) {
				checkStorage(o, o.dropdown.val(v));
			});
		} else if (o.type == "sound") {
			var prev = "";
			group.find(".rbx-tooltip").after(soundService.robloxSound.button(o.input = $("<input class=\"input-field\">").css("width", "100px").keyup(function (e) {
				if (e.keyCode == 13) {
					$(this).blur();
				}
			}).blur(function () {
				if (Number($(this).val()) !== NaN) {
					prev = Number($(this).val());
				} else {
					$(this).val(prev.toString()).trigger("change");
				}
			}))).after($("<label>").text(n));
			toWidth(o.input, o);
			o.storageHandle(function (v) {
				group.append(o.input.val(prev = v).trigger("change"));
				checkStorage(o, o.input);
			});
		} else if (o.type == "string" || o.type == "speak") {
			group.append($("<label>").text(n)).append(o.input = $("<input class=\"input-field\">").keyup(function (e) {
				if (e.keyCode == 13) {
					$(this).blur();
				}
			}));
			if (o.type == "speak") {
				o.input.before($("<div class=\"rplusaudio icon-play\">").click(function () {
					var el = $(this);
					if (el.hasClass("icon-pause")) {
						ext.tts.stop();
					} else {
						el.attr("class", "rplusaudio icon-pause");
						ext.tts.speak(o.input.val(), function () {
							el.attr("class", "rplusaudio icon-play");
						});
					}
				}));
			}
			if (type(o.placeholder) == "string") {
				o.input.attr("placeholder", o.placeholder);
			}
			if (type(o.maxlength) == "number") {
				o.input.attr("maxlength", o.maxlength.toString());
			}
			toWidth(o.input, o);
			o.storageHandle(function (v) { checkStorage(o, o.input.val(v)); });
		}

		if (o.hasOwnProperty("minLabelWidth")) {
			group.find("label").css("width", type(o.minLabelWidth) == "string" ? o.minLabelWidth : o.minLabelWidth + "px");
		}
		if (type(o.tabbed) == "object") {
			for (var n in o.tabbed) {
				group.append(compileStorage(n, o.tabbed[n]));
			}
		}

		return group;
	};
	foreach({
		"Notifications & Sound": {
			"Volume": {
				tip: "Choose the volume for the notification sounds",
				type: { min: 0, max: 100 },
				minLabelWidth: 100,
				storage: function (v) {
					storage.get("volume", function (x) {
						if (isCB(v)) {
							v((type(x) == "number" ? x * 100 : 50).toString());
						} else {
							storage.set("volume", (Number(v) || 0) / 100);
						}
					});
				}
			},
			"Voice Volume": {
				tip: "Choose the volume for text-to-speech voice",
				type: { min: 0, max: 100 },
				minLabelWidth: 100,
				storage: function (v) {
					storage.get("voiceVolume", function (x) {
						if (isCB(v)) {
							v((type(x) == "number" ? x * 100 : 50).toString());
						} else {
							storage.set("voiceVolume", (Number(v) || 0) / 100);
						}
					});
				}
			},
			"Item": {
				tip: "When an item comes out, or gets updated",
				type: "bool",
				storage: "itemNotifier",
				tabbed: {
					"Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "items", function (v) { return Number(v) || 0; })
					},
					"New Limited Buy Button": {
						type: "bool",
						tip: "When a new limited comes out a buy button will be under the notification",
						immediateReturn: true,
						browser: ["Chrome"]
					}
				}
			},
			"Forum": {
				tip: "When someone replies to a thread you track, or replied to",
				type: "bool",
				storage: "forumNotifier",
				tabbed: {
					"Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "forum", function (v) { return Number(v) || 0; })
					}
				}
			},
			"Trade": {
				tip: "When trade activity happens",
				type: "bool",
				storage: "tradeNotifier",
				tabbed: {
					"Inbound Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "tradeInbound", function (v) { return Number(v) || 0; }),
						minLabelWidth: 130
					},
					"Outbound Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "tradeOutbound", function (v) { return Number(v) || 0; }),
						minLabelWidth: 130
					},
					"Completed Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "tradeCompleted", function (v) { return Number(v) || 0; }),
						minLabelWidth: 130
					},
					"Declined Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "tradeDeclined", function (v) { return Number(v) || 0; }),
						minLabelWidth: 130
					}
				}
			},
			"Friend": {
				tip: "For friend activity",
				type: "bool",
				storage: objectSaver("friendNotifier", "on"),
				tabbed: {
					"Online": {
						tip: "When a friend comes online",
						type: "bool",
						storage: objectSaver("friendNotifier", "online")
					},
					"Offline": {
						tip: "When a friend goes offline",
						type: "bool",
						storage: objectSaver("friendNotifier", "offline")
					},
					"Games": {
						tip: "When a friend joins a game",
						type: "bool",
						storage: objectSaver("friendNotifier", "game")
					},
					"Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "friend", function (v) { return Number(v) || 0; })
					}
				}
			},
			"Group Shout": {
				tip: "When a shout changes for a group you're in",
				type: "bool",
				storage: "groupShoutNotifier",
				tabbed: {
					"Mode": {
						tip: "Notify on all groups, or ones you choose",
						type: { "All": "all", "Whitelist": "whitelist" },
						storage: "groupShoutNotifier_mode"
					},
					"Sound": {
						type: "sound",
						storage: objectSaver("notifierSounds", "groupShout", function (v) { return Number(v) || 0; })
					}
				}
			},
			"Startup": {
				tip: "When Roblox+ starts/updates",
				type: "bool",
				storage: objectSaver("startupNotification", "on"),
				tabbed: {
					"After I visit Roblox": {
						tip: "Only display after you go to Roblox",
						type: "bool",
						storage: objectSaver("startupNotification", "visit")
					},
					"Username Pronunciation": {
						tip: "How should Roblox+ pronounce your name on startup?",
						type: "speak",
						placeholder: "Leaving blank will disable speaking",
						width: 250,
						storage: function (v) {
							Roblox.users.getAuthenticatedUser().then(function (user) {
								if (user) {
									storage.get("startupNotification", function (x) {
										x = type(x) == "object" ? x : {};
										x.names = type(x.names) == "object" ? x.names : {};
										if (isCB(v)) {
											v(x.names.hasOwnProperty(user.username.toLowerCase()) ? x.names[user.username.toLowerCase()] : user.username);
										} else {
											x.names[user.username.toLowerCase()] = v;
											storage.set("startupNotification", x);
										}
									});
								} else if (isCB(v)) {
									v("");
								}
							}, function (errors) {
								if (isCB(v)) {
									v("");
								}
							});
						}
					}
				}
			}
		},
		"Forum": {
			"Post IDs": {
				tip: "Show post IDs on each reply",
				type: "bool",
				storage: objectSaver("forums", "postIds")
			},
			"RAP": {
				tip: "Show a user's RAP under each post",
				type: "bool",
				storage: objectSaver("forums", "rap")
			},
			"Blocking": {
				tip: "Hide people on the forums from your blocked list",
				type: "bool",
				storage: objectSaver("forums", "blocking")
			},
			"Embedding": {
				tip: "Displays image, decal, audio, and youtube links on the thread",
				type: "bool",
				storage: objectSaver("forums", "embedding"),
				tabbed: {
					"Size": {
						tip: "The size of the embedded images",
						type: { min: 0, max: 100 },
						storage: objectSaver("forums", "embedSize")
					}
				}
			},
			"Signature": {
				tip: "This gets added to the end of your posts",
				type: "string",
				placeholder: array.random(forumService.signatureTips),
				maxlength: 256,
				width: 250,
				storage: objectSaver("forums", "signature"),
				tabbed: {
					"Lines": {
						tip: "How many lines below your post the signature will be",
						type: { min: 0, max: 3, width: 40 },
						storage: objectSaver("forums", "lines", function (v) { return Math.max(0, Math.min(Number(v) || 3, 3)); })
					}
				}
			}
		},
		"Navigation": {
			"Button 1": {
				tip: "Set top navigation third button text",
				type: "string",
				minLabelWidth: 57,
				storage: function (v) {
					storage.get("navigation", function (x) {
						if (isCB(v)) {
							v((x.buttons[0] || {}).text);
						} else {
							x.buttons[0] = x.buttons[0] || { text: v, href: "/" };
							x.buttons[0].text = v;
							storage.set("navigation", x);
						}
					});
				},
				tabbed: {
					"Link": {
						tip: "Set top navigation third button link",
						type: "string",
						minLabelWidth: 37,
						storage: function (v) {
							storage.get("navigation", function (x) {
								if (isCB(v)) {
									v((x.buttons[0] || {}).href);
								} else {
									x.buttons[0] = x.buttons[0] || { text: "?", href: v };
									x.buttons[0].href = v;
									storage.set("navigation", x);
								}
							});
						}
					}
				}
			},
			"Button 2": {
				tip: "Set top navigation fourth button text",
				type: "string",
				minLabelWidth: 57,
				storage: function (v) {
					storage.get("navigation", function (x) {
						if (isCB(v)) {
							v((x.buttons[1] || {}).text);
						} else {
							x.buttons[1] = x.buttons[1] || { text: v, href: "/" };
							x.buttons[1].text = v;
							storage.set("navigation", x);
						}
					});
				},
				tabbed: {
					"Link": {
						tip: "Set top navigation fourth button link",
						type: "string",
						minLabelWidth: 37,
						storage: function (v) {
							storage.get("navigation", function (x) {
								if (isCB(v)) {
									v((x.buttons[1] || {}).href);
								} else {
									x.buttons[1] = x.buttons[1] || { text: "?", href: v };
									x.buttons[1].href = v;
									storage.set("navigation", x);
								}
							});
						}
					}
				}
			},
			"Side Open": {
				tip: "Keep side navigation open",
				type: "bool",
				storage: objectSaver("navigation", "sideOpen")
			},
			"Counter Commas": {
				tip: "Round off navigation counters",
				storage: function (v) {
					storage.get("navigation", function (x) {
						if (isCB(v)) {
							v((type(x.counterCommas) == "number" ? x.counterCommas : 0).toString());
						} else {
							x.counterCommas = Number(v) || 100000000;
							storage.set("navigation", x);
						}
					});
				},
				type: {
					"1k": "1000",
					"10k": "10000",
					"100k": "100000",
					"1m": "1000000",
					"10m": "10000000",
					"100m": "100000000"
				}
			},
			"Live Counters": {
				tip: "Update Robux, Message, Friend Request, and Trade counts without refresh",
				type: "bool",
				storage: "navcounter"
			}
		},
		"Item": {
			"Live Remaining Counter": {
				tip: "While an item is selling out the amount remaining will update without refresh",
				type: "bool",
				storage: "remainingCounter"
			}
		},
		"Trading": {
			"Open trades in new tab": {
				tip: "Open trades in a new tab instead of a new window",
				type: "bool",
				storage: "tradeTab"
			},
			"Trade Checker": {
				tip: "Displays outbound items with red in trade window",
				type: "bool",
				storage: "tradeChecker"
			},
			"RAP Assist": {
				tip: "On the trade page colors trades based on higher RAP",
				type: "bool",
				storage: "tradePageRapAssist"
			}/*,
				"Window Redesign": {
					tip: "Redesigns the trade window slightly with how items are displayed, stacking multiples",
					type: "bool",
					storage: "tradeRedesign"
				}*/
		},
		"Profile": {
			"RAP": {
				tip: "Show the user's RAP on their profile",
				type: "bool",
				storage: "profileRAP"
			}
		},
		"Groups": {
			"Role Display": {
				tip: "Show a user's role on their wall posts",
				type: "bool",
				storage: "groupRoleDisplay"
			}
		},
		"Other": {
			"Changed Username Login": {
				tip: "Allows logging with a previous username",
				type: "bool",
				storage: "changedLogin"
			},
			"Theme": {
				tip: "Changes the theme of the website",
				type: {
					"Default": "",
					"OBC": "obc"
				},
				storage: function (v) {
					var cont = function () {
						if (isCB(v)) {
							v(localStorage.getItem("rplusTheme"));
						} else {
							RPlus.style.setTheme(RPlus.style.themeTypes[v]);
							storage.set("siteTheme", v);
						}
					};
					if ($("option[value='easter']").length) {
						cont();
					} else {
						RPlus.premium.allThemesUnlocked(Roblox.users.authenticatedUserId).then(function (e) {
							if (e) {
								$("option[value='obc']").after("<option value=\"easter\">Easter</option>");
							}
							cont();
						}).catch(cont);
					}
				}
			},
			"Quick-Sell": {
				tip: "Put clothing/models/audio/decals on/off sale from the develop page",
				type: "bool",
				storage: "quickSell"
			}
		}
	}, function (n, o, section) {
		$("<div class=\"section-content\">").prepend($("<div class=\"col-sm-3\">").prepend($("<h3>").text(n))).append(section = $("<div class=\"col-sm-9\">"));
		foreach(o, function (n, o) {
			if (n != "Voice Volume" || ext.tts.enabled) {
				section.append(compileStorage(n, o));
			}
		});
		controlPanel.append(section.parent());
	});

	var features = {
		"Themes": "Allows you to switch between the default site theme, and OBC theme",
		"Item Notifier": "When a new item comes out, or one gets updated you'll get a notification",
		"Trade Notifier": "When you get a new trade, send one, complete one, or one gets declined you'll be notified",
		"Forum Notifier": "When someone replies to a forum thread you've replied to or tracked you'll be notified",
		"Friend Notifier": "Notifications when your friends come online, go offline, or join a game",
		"Group Shout Notifier": "Notifications when a group your in updates their shout",
		"Roblox+ Notification Center": "Click the R+ icon in the top right to view notifications that haven't yet been closed",
		"Forum Post IDs": "On forum threads find out which post has which id, and click the id for the link directly to that post",
		"Forum RAP": "Below each poster on the forums will be their RAP",
		"Forum Blocking": "Threads, and replies made by people you blocked will be hidden",
		"Forum Embedding": "Embeds images, decals, YouTube videos, audio, and Lua on the forums<br>Must be in this group for images/decals: <a href=\"/My/Groups.aspx?gid=2518656\">roblox.com/My/Groups.aspx?gid=2518656</a><br>Every 1,000 posts you're eligible to post another image<br>Use #code in the front of a line to give it syntax highlighting, tab the line below it to keep it going<br>Syntax highlighting thanks to <a href=\"https://highlightjs.org/\" target=\"_blank\">highlight.js</a>",
		"Forum Signature Saver": "Save a signature to be posted on all your threads, and replies<br>Add #RAP to display your current RAP, or #Robux for your current Robux",
		"Forum Add Post Edits": "Flood Checker, count down of how long until you can post again<br>Subject/Message character counter<br>Cancel button goes back instead of to initial forums page",
		"AJAX Thread Tracking": "On threads track check box doesn't refresh the page<br>On <a href=\"https://forum.roblox.com/Forum/User/MyForums.aspx\">My Forums</a> page tracked threads get check boxes to untrack with",
		"Other Forum Features": "Prevents long forum thread names, and usernames from stretching the page<br>Added commas to Total Posts<br>Double click under the poster's character to shrink the post<br>Read button added on Google Chrome, reads the post",
		"Navigation Button Chooser": "Choose what the two right buttons in the top navigation bar lead to",
		"Live Navigation Counters": "Updates Robux, message, trade, and friend request counts live without refreshing",
		"Live Remaining Counter": "When a new limited comes out the remaining count will update live without refreshing",
		"Content Assist": "For certain asset types (like hats, packages, and gear) you can see their route content (like textures, and mesh ids) by clicking the Contents on item pages",
		"Texture Download": "On images made by Roblox you'll be able to get a direct download for the texture, remember to add the image extension on the end of the file name (e.g. .png)",
		"Serial Tracker": "On item pages for assets created by Roblox you will be able to see who owns the asset by clicking Owners",
		"Trade Checker": "See what items you have outbound from the trade window, they'll be highlighted red when the feature is on",
		"RAP Assist": "When this feature is on trades on the trade page will be colored by who has higher RAP",
		"Profile RAP": "On profiles next to friends, and followers there will be the player's added RAP (Recent Average Price, how much their limtieds are worth combined)",
		"Sale Stats": "On profiles near the join date will be counts for how many clothing, and model sales the user has",
		"Changed Username Login": "When signing in you can use a past username, and it will autocorrect to the current one",
		"Quick-Sell": "From the develop page put clothing, models, decals, and audio on sale for the lowest price with one button click",
		"Friend Page Options": "Unfollow all, and follow all friends buttons added to the friends page",
		"Character Page Edits": "Added searchbar, and skin color options to character page",
		//"Multi-Private Selling": "Tick boxes when selling, or taking your items off sale instead of a dropdown",
		//"RAP on sale": "Find out how much the RAP is going to be when buying the item, add your own price to check above the RAP chart or look at the bottom of the confirmation when purchasing",
		"Transation/Trade Counter": "On the money page for <a href=\"/my/money.aspx#/#TradeItems_tab\">trades</a>, and <a href=\"/my/money.aspx#/#MyTransactions_tab\">transactions</a> adds count of how many there are",
		"Game Server Paging": "Rather than a load more button on game page servers, a page system",
		"Server Search": "Type in the username of someone in the game to find which server they're in",
		"Easy-Delete": "On the inventory page delete audio, models, and badges in the top right of each one",
		"Sound Control": "All audio play buttons on the website should have volume control",
		"Group Page Edits": "Character counters for shouts, and posts<br>From the group admin page join requests are clickable to go to profiles",
		"Comment Timer": "On item pages in comments tells you how long until you can make another",
		"Money Page Trade Tab Edits": "In the <a href=\"/my/money.aspx#/#TradeItems_tab\">trade</a> tab of the money page under outbound will be a cancel all button, to decline all outbound trades<br>Added clickable trade id in the top left of open trades",
		"Multi-Messaging": "When sending a new message use the input text box on the <i>To:</i> line to send the message to multiple users",
		"JSON Pretty-Printing": "On JSON pages from Roblox like this one <a href=\"https://search.roblox.com/catalog/json?ResultsPerPage=1\" target=\"_blank\">search.roblox.com\/catalog\/json?ResultsPerPage=1</a> if you press enter it will <i>\"pretty-print\"</i> it",
		"Follow from Home": "On the <a href=\"/home\">Home</a> page if your friend is playing a game click the game icon to follow them"
	};
	var featuresDiv;
	controlPanel.append($("<div id=\"rplusFeatures\" class=\"section-content\">").append("<div class=\"col-sm-3\"><h3>Features (" + addComma(Object.keys(features).length) + ")</h3></div>", featuresDiv = $("<div class=\"col-sm-9\">")));
	foreach(features, function (n, o) { featuresDiv.append($("<div class=\"form-group\">").append($("<label class=\"text-label account-settings-label\">").text(n), $("<p>").html(o))); });

	$("#vertical-menu").append($("<li class=\"menu-option ng-scope\">").attr("ui-sref", "rplus").append($("<a class=\"rbx-tab-heading\">").html($("<span class=\"text-lead\">").text(ext.manifest.name)))).on("click", ".menu-option", function (x) {
		$("#vertical-menu .menu-option").removeClass("active");
		$(this).addClass("active");
		controlPanel[(x = $(this).attr("ui-sref") == "rplus") ? "show" : "hide"]();
		if ($(this).attr("ui-sref") == "rplus") {
			controlPanel.show();
			tabContent.hide();
		} else {
			controlPanel.hide();
			tabContent.show();
		}
	}).find(".rbx-tab").css("width", "20%");
	$("#settings-container").append(controlPanel).append(styleTag);
	if (url.param("tab").toLowerCase() == "rplus") { $("li.menu-option[ui-sref=\"rplus\"]>a")[0].click(); }

	ipc.send("maliciousContentBlocker:isBlocking", {}, function (grantedPermission) {
		if (grantedPermission) {
			return;
		}
		var html = $("<a href=\"javascript:/* Enable Malicious Content Blocker */\">").click(function (e) {
			ipc.send("maliciousContentBlocker:start", {}, function (granted) {
				if (granted) {
					feedback.hide();
				}
			});
		}).text("For an extra layer of protection please enable the malicious content blocker");
		Roblox.ui.feedback(html, "warning", 60 * 1000, true);
	});

	return {};
};

RPlus.Pages.Account.patterns = [/^\/my\/account/i];


// WebGL3D
