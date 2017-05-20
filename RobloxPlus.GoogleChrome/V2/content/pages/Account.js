var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

function loadV2Page() {
	var pageContent = $("<div class=\"page-content\">");
}

RPlus.Pages.Account = function () {
	// Lock off new page to just me for development.
	if (Roblox.page.user.id === 48103520 && location.search.includes("dev")) {
		loadV2Page();
		return;
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
		rplusSettings.get(function (s) {
			if (s.updateLog) {
				window.open(s.updateLog);
			}
		});
	})))).hide();
	var tabContent = $("#horizontal-tabs").parent().find(">.tab-content");

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
				window.open(Roblox.catalog.getAssetUrl(391072534));
			});
			request.send({ request: "buttonOwner" }, function (x) { o.checkbox.prop("checked", !!x); });
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
					"OBC": "obc-theme"
				},
				storage: function (v) {
					var cont = function () {
						storage.get("siteTheme", function (x) {
							if (isCB(v)) {
								v(x);
							} else {
								storage.set("siteTheme", v);
							}
						});
					};
					if ($("option[value='easter-theme']").length) {
						cont();
					} else {
						Roblox.inventory.userHasAsset(users.userId, 375602203).then(function (e) {
							if (e) {
								$("option[value='obc-theme']").after("<option value=\"easter-theme\">Easter</option>");
							}
							cont();
						}, cont);
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

	$("#horizontal-tabs").append($("<li class=\"rbx-tab\">").attr("ui-sref", "rplus").append($("<a class=\"rbx-tab-heading\">").html($("<span class=\"text-lead\">").text(ext.manifest.name)))).on("click", ".rbx-tab", function (x) {
		$("#horizontal-tabs .rbx-tab").removeClass("active");
		$(this).addClass("active");
		controlPanel[(x = $(this).attr("ui-sref") == "rplus") ? "show" : "hide"]();
		styleTag.html(".rbx-tabs-horizontal>.tab-content[ng-controller]{display:" + (x ? "none" : "block") + ";}");
	}).find(".rbx-tab").css("width", "20%");
	$("#horizontal-tabs").parent().append(controlPanel).append(styleTag);
	if (url.param("tab").toLowerCase() == "rplus") { $("li.rbx-tab[ui-sref=\"rplus\"]>a")[0].click(); }

	request.send({ request: "isBlockingMaliciousContent" }, function (grantedPermission) {
		if (grantedPermission) {
			return;
		}
		var html = $("<a href=\"javascript:/* Enable Malicious Content Blocker */\">").click(function (e) {
			request.send({ request: "startBlockingMaliciousContent" }, function (granted) {
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
