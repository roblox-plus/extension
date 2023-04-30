RPlus.navigation = RPlus.navigation || (function () {
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
				// Navigation buttons
				for (var CN = 0; CN < Math.min(2, navigationSettings.buttons.length); CN++) {
					let button = navigationSettings.buttons[CN];
					if (type(button) === "object") {
						RPlus.navigation.setButtonTextAndLink(CN + 2, button.text, button.href);
					}
				}

				setTimeout(updateLoop, 250);
			});
		};

		updateLoop();
	});

	return {
		setButtonTextAndLink: setButtonTextAndLink,
		getButtonTextAndLink: getButtonTextAndLink,

		getNavigationSettings: getNavigationSettings
	};
})();
