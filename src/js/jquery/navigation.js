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
		Extension.Storage.Singleton.get("navigation").then(navigation => {
			Extension.Storage.Singleton.get("navcounter").then(navcounter => {
				if (!navigation || typeof (navigation) !== "object") {
					navigation = {};
				}
	
				navigation.liveNavigationCounters = !!navcounter;
	
				callBack(navigation);
			}).catch(console.warn);
		}).catch(console.warn);
	};

	let getRobux = function () {
		return navigationBar.getRobux();
	};

	let setRobux = function (robux) {
		if (isNaN(robux) || robux < 0) {
			robux = 0;
		}

		navigationBar.setRobux(robux);
	};

	let getTradeCount = function () {
		return navigationBar.getBubbleValue('nav-trade');
	};

	let setTradeCount = function (tradeCount) {
		navigationBar.setBubbleValue('nav-trade', tradeCount);
	};

	let getMessagesCount = function () {
		return navigationBar.getBubbleValue('nav-message');
	};

	let setMessagesCount = function (messageCount) {
		navigationBar.setBubbleValue('nav-message', messageCount);
	};

	let getFriendRequestCount = function () {
		return navigationBar.getBubbleValue('nav-friends');
	};

	let setFriendRequestCount = function (friendRequestCount) {
		navigationBar.setBubbleValue('nav-friends', friendRequestCount);
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
				button: $(button),
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

		buttonTextAndLink.button.text(text).attr("href", link);
	};

	$(function () {
		// Sync counters with settings
		let updateLoop = function () {
			// Control Panel link
			if ($("#navigation").length && !$("#navigation .rplus-icon").length) {
				let navigationItem = $("<li>").append(
					$("<a href=\"/my/account?tab=rplus\" class=\"dynamic-overflow-container text-nav\">").append(
						$("<div>").append(
							$("<span class=\"rplus-icon\">")
						),
						$("<span class=\"font-header-2 dynamic-ellipsis-item\">").text("Control Panel")
					));
	
				$("#navigation .rbx-upgrade-now").before(navigationItem);
			}
	
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

		updateLoop();
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
