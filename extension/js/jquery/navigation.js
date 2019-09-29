RPlus.navigation = RPlus.navigation || (function () {
	let thousand = 1000;
	let million = 1000000;
	let billion = 1000000000;
	let trillion = 1000000000000;
	let suffixes = {};

	suffixes[thousand] = "K";
	suffixes[million] = "M";
	suffixes[billion] = "B";
	suffixes[trillion] = "T";

	let getNavigationSettings = function (callBack) {
		storage.get(["navigation", "navcounter"], function (settings) {
			if (!settings.navigation || typeof(settings.navigation) !== "object") {
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

	let setRobux = function (robux) {
		if (isNaN(robux) || robux < 0) {
			robux = 0;
		}

		abbreviateNumber(robux, function (abbreviatedRobux) {
			$("#nav-robux-balance").attr({
				title: global.addCommas(robux),
				robux: robux
			}).text(abbreviateNumberAt(robux, billion) + " Robux");
			$("#nav-robux-amount").text(abbreviatedRobux);
		});
	};

	let getRobux = function () {
		var balanceTag = $("#nav-robux-balance");
		var robuxAttr = Number(balanceTag.attr("robux"));

		if (!isNaN(robuxAttr)) {
			return robuxAttr;
		}

		var robuxText = balanceTag.text().replace(/\D+/g, "");
		return Number(robuxText);
	};

	let getBubbleCount = function (bubble) {
		var tradeCountText = bubble.attr("title") || bubble.text();
		return Number(tradeCountText.replace(/\D+/g, "")) || 0;
	};

	let setBubbleCount = function (bubble, count) {
		if (getBubbleCount(bubble) === count) {
			return;
		}

		abbreviateNumber(count, function (abbreviatedCount) {
			bubble.attr({
				title: global.addCommas(count),
				count: count
			}).text(count > 0 ? abbreviatedCount : "").removeClass("hide");
		});
	};

	let getTradeCount = function () {
		return getBubbleCount($("#nav-trade .notification-blue"));
	};

	let setTradeCount = function (tradeCount) {
		setBubbleCount($("#nav-trade .notification-blue"), tradeCount);
	};

	let getMessagesCount = function () {
		return getBubbleCount($("#nav-message .notification-blue"));
	};

	let setMessagesCount = function (messageCount) {
		setBubbleCount($("#nav-message .notification-blue"), messageCount);
	};

	let getFriendRequestCount = function () {
		return getBubbleCount($("#nav-friends .notification-blue"));
	};

	let setFriendRequestCount = function (friendRequestCount) {
		setBubbleCount($("#nav-friends .notification-blue"), friendRequestCount);
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

	$(function(){
		// Sync counters with settings
		RPlus.navigation.setRobux(RPlus.navigation.getRobux());
		RPlus.navigation.setTradeCount(RPlus.navigation.getTradeCount());
		RPlus.navigation.setMessagesCount(RPlus.navigation.getMessagesCount());
		RPlus.navigation.setFriendRequestCount(RPlus.navigation.getFriendRequestCount());
		
		RPlus.navigation.getNavigationSettings(function(navigationSettings) {
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
	});

	return {
		getRobux: getRobux,
		setRobux: setRobux,

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
