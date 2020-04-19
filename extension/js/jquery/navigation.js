RPlus.navigation = RPlus.navigation || (function () {
	let devexRate = 0.0035;
	let thousand = 1000;
	let million = 1000000;
	let billion = 1000000000;
	let trillion = 1000000000000;
	let suffixes = {};
	let bubbleAbbreviations = {};

	suffixes[thousand] = "K";
	suffixes[million] = "M";
	suffixes[billion] = "B";
	suffixes[trillion] = "T";

	let getNavigationSettings = function (callBack) {
		storage.get(["navigation", "navcounter"], function (settings) {
			if (!settings.navigation || typeof (settings.navigation) !== "object") {
				settings.navigation = {};
			}

			settings.navigation.liveNavigationCounters = !!settings.navcounter;

			callBack(settings.navigation);
		});
	};

	let getDivider = function (number) {
		if (number >= trillion) {
			return trillion;
		} else if (number >= billion) {
			return billion;
		} else if (number >= million) {
			return million;
		}

		return thousand;
	};

	let getAbbreviationSuffix = function (number) {
		var divider = getDivider(number);
		if (number < divider) {
			return "";
		}

		var suffix = suffixes[divider];
		if (number % divider === 0) {
			return suffix;
		}

		return suffix + "+";
	};

	let abbreviateNumberAt = function (number, roundAt) {
		if (number < roundAt) {
			return global.addCommas(number);
		}

		var divideBy = getDivider(number);
		return global.addCommas(Math.floor(number / divideBy) + getAbbreviationSuffix(number));
	};

	let abbreviateNumber = function (number, callBack) {
		getNavigationSettings(function (navigationSettings) {
			var roundAt = Math.max(thousand, Number(navigationSettings.counterCommas) || thousand);
			callBack(abbreviateNumberAt(number, roundAt));
		});
	};

	let shouldUpdateByAbbreviation = function (key, callBack) {
		getNavigationSettings(function (navigationSettings) {
			var roundAt = Math.max(thousand, Number(navigationSettings.counterCommas) || thousand);
			var requiresAbbreviationUpdate = bubbleAbbreviations[key] !== roundAt;
			bubbleAbbreviations[key] = roundAt;

			callBack(requiresAbbreviationUpdate);
		});
	};

	let hasDevexRate = function () {
		return $("#rplus-devex-rate").length > 0;
	};

	let requiresUpdate = function (key, element, currentCount, newCount, callBack) {
		if (currentCount !== newCount) {
			callBack(true);
			return;
		}

		if (!element.attr("count")) {
			callBack(true);
			return;
		}

		shouldUpdateByAbbreviation(key, function (requiresAbbreviationUpdate) {
			if (requiresAbbreviationUpdate) {
				callBack(true);
				return;
			}

			getNavigationSettings(function (navigationSettings) {
				if (key === "robux") {
					if ((hasDevexRate() && !navigationSettings.showDevexRate) || (navigationSettings.showDevexRate && !hasDevexRate())) {
						callBack(true);
						return;
					}
				}

				callBack(false);
			});
		});
	};

	let getRobux = function () {
		var balanceTag = $("#nav-robux-balance");
		var robuxAttr = Number(balanceTag.attr("count"));

		if (!isNaN(robuxAttr)) {
			return robuxAttr;
		}

		var robuxMatch = (balanceTag.text().match(/([\d,]+)/) || ["", ""])[1];
		var robuxText = robuxMatch.replace(/\D+/g, "");
		return Number(robuxText);
	};

	let setRobux = function (robux) {
		if (isNaN(robux) || robux < 0) {
			robux = 0;
		}

		var robuxBalance = $("#nav-robux-balance");
		requiresUpdate("robux", robuxBalance, getRobux(), robux, function (requiresUpdate) {
			if (!requiresUpdate) {
				return;
			}

			getNavigationSettings(function (navigationSettings) {
				abbreviateNumber(robux, function (abbreviatedRobux) {
					var robuxSpan = $("<span>").text(abbreviateNumberAt(robux, billion) + " Robux");
					robuxBalance.attr({
						title: global.addCommas(robux),
						count: robux
					}).html(robuxSpan);

					if (navigationSettings.showDevexRate) {
						robuxSpan.after($("<br>"), $("<span class=\"text-secondary\" id=\"rplus-devex-rate\">").text("USD $" + global.addCommas((robux * devexRate).toFixed(2))));
					}

					$("#nav-robux-amount").text(abbreviatedRobux);
				});
			});
		});
	};

	let getBubbleCount = function (bubble) {
		var tradeCountText = bubble.attr("title") || bubble.text();
		return Number(tradeCountText.replace(/\D+/g, "")) || 0;
	};

	let setBubbleCount = function (bubbleKey, bubble, count) {
		requiresUpdate(bubbleKey, bubble, getBubbleCount(bubble), count, function (requiresUpdate) {
			if (!requiresUpdate) {
				return;
			}

			abbreviateNumber(count, function (abbreviatedCount) {
				bubble.attr({
					title: global.addCommas(count),
					count: count
				}).text(count > 0 ? abbreviatedCount : "").removeClass("hide");
			});
		});
	};

	let getTradeCount = function () {
		return getBubbleCount($("#nav-trade .notification-blue"));
	};

	let setTradeCount = function (tradeCount) {
		setBubbleCount("trade", $("#nav-trade .notification-blue"), tradeCount);
	};

	let getMessagesCount = function () {
		return getBubbleCount($("#nav-message .notification-blue"));
	};

	let setMessagesCount = function (messageCount) {
		setBubbleCount("messages", $("#nav-message .notification-blue"), messageCount);
	};

	let getFriendRequestCount = function () {
		return getBubbleCount($("#nav-friends .notification-blue"));
	};

	let setFriendRequestCount = function (friendRequestCount) {
		setBubbleCount("friends", $("#nav-friends .notification-blue"), friendRequestCount);
	};

	let isSideOpen = function () {
		return $("#navigation").is(":visible") && $("#navigation").width() > 0;
	};

	let setSideNavigationOpen = function (open) {
		var button = $(".rbx-nav-collapse")[0];
		if (isSideOpen() !== open && button) {
			button.click();
		}
	};

	let getButtonTextAndLink = function (buttonIndex) {
		var button = $("ul.nav.rbx-navbar").first().find(">li>a")[buttonIndex];
		if (button) {
			return {
				text: $(button).text(),
				href: $(button).attr("href")
			};
		}
	};

	let setButtonTextAndLink = function (buttonIndex, text, link) {
		var buttonTextAndLink = getButtonTextAndLink(buttonIndex);
		if (!buttonTextAndLink || (buttonTextAndLink.text === text && buttonTextAndLink.href === link)) {
			return;
		}

		$("ul.nav.rbx-navbar").each(function () {
			var li = $(this).find(">li>a");
			var button = li[buttonIndex];
			if (button) {
				$(button).text(text).attr("href", link);
			}
		});
	};

	$(function () {
		// Sync counters with settings
		let updateLoop = function () {
			getNavigationSettings(function (navigationSettings) {
				let loops = 0;
				let maxLoops = 1;
				let tryLoop = function () {
					if (++loops === maxLoops) {
						setTimeout(updateLoop, 250);
					}
				};

				// Navigation buttons
				for (var CN = 0; CN < Math.min(2, navigationSettings.buttons.length); CN++) {
					let button = navigationSettings.buttons[CN];
					if (type(button) === "object") {
						RPlus.navigation.setButtonTextAndLink(CN + 2, button.text, button.href);
					}
				}

				// Navigation counters
				if (navigationSettings.liveNavigationCounters) {
					Roblox.users.getAuthenticatedUser().then(function (user) {
						if (!user) {
							tryLoop();
							return;
						}

						maxLoops++;
						Roblox.trades.getTradeCount("Inbound").then(function (count) {
							RPlus.navigation.setTradeCount(count);
							tryLoop();
						}).catch(tryLoop);

						maxLoops++;
						Roblox.privateMessages.getUnreadMessageCount().then((count) => {
							RPlus.navigation.setMessagesCount(count);
							tryLoop();
						}).catch(tryLoop);

						maxLoops++;
						Roblox.social.getFriendRequestCount().then((count) => {
							RPlus.navigation.setFriendRequestCount(count);
							tryLoop();
						}).catch(tryLoop);

						Roblox.economy.getCurrencyBalance().then(function (currency) {
							RPlus.navigation.setRobux(currency.robux);
							tryLoop();
						}).catch(tryLoop);
					}).catch(tryLoop);
				} else {
					// If Roblox updates the counters, re-update them to set the suffix according to R+ settings.
					// Check for zeros to see if Roblox has loaded any counters at all.
					// Race condition valid if we update the counters while Roblox is still loading them.
					let robux = RPlus.navigation.getRobux();
					if (robux > 0) {
						RPlus.navigation.setRobux(robux);
					}

					let tradeCount = RPlus.navigation.getTradeCount();
					if (tradeCount > 0) {
						RPlus.navigation.setTradeCount(tradeCount);
					}

					let messageCount = RPlus.navigation.getMessagesCount();
					if (messageCount > 0) {
						RPlus.navigation.setMessagesCount(messageCount);
					}

					let friendRequestCount = RPlus.navigation.getFriendRequestCount();
					if (friendRequestCount > 0) {
						RPlus.navigation.setFriendRequestCount(friendRequestCount);
					}

					tryLoop();
				}
			});
		};

		RPlus.navigation.getNavigationSettings(function (navigationSettings) {
			if (navigationSettings.sideOpen) {
				RPlus.navigation.setSideNavigationOpen(true);
			}
		});

		// Control Panel link
		if ($("#navigation").length && !$("#navigation .rplus-icon").length) {
			$("#navigation .rbx-upgrade-now").before("<li><a href=\"/my/account?tab=rplus\" class=\"text-nav\"><span class=\"rplus-icon\"></span><span>Control Panel</span></a></li>");
		}

		// Allow messages button in navigation bar to refresh the page while on the messages page
		// TODO: Investigate what's overriding this (it doesn't work)
		$("#nav-message").attr("href", "/my/messages");

		updateLoop();
	});

	return {
		getRobux: getRobux,
		setRobux: setRobux,
		hasDevexRate: hasDevexRate,

		getTradeCount: getTradeCount,
		setTradeCount: setTradeCount,

		getMessagesCount: getMessagesCount,
		setMessagesCount: setMessagesCount,

		getFriendRequestCount: getFriendRequestCount,
		setFriendRequestCount: setFriendRequestCount,

		isSideOpen: isSideOpen,
		setSideNavigationOpen: setSideNavigationOpen,

		setButtonTextAndLink: setButtonTextAndLink,
		getButtonTextAndLink: getButtonTextAndLink,

		getNavigationSettings: getNavigationSettings
	};
})();
