var RPlus = RPlus || {};
RPlus.style = RPlus.style || (function () {
	var premiumSubscriberClass = "rplus-premium-subscriber";
	var darkThemeClass = "dark-theme";

	function syncNavigationTheme() {
		if (window.$) {
			if (!document.documentElement.classList.contains(premiumSubscriberClass)) {
				return;
			}

			if ($("#BodyWrapper,form[action^='/build/']").length > 0) {
				var hasDarkTheme = window.parent && window.parent !== window ? window.parent.document.body.classList.contains(darkThemeClass) : ($("#header").hasClass(darkThemeClass) || $("#navigation-container").hasClass(darkThemeClass));
				document.body.classList.toggle(darkThemeClass, hasDarkTheme);
				document.body.classList.toggle("rplus-dark-theme", hasDarkTheme);
			}
		}
	}

	function togglePremiumClass(isPremium) {
		document.documentElement.classList.toggle(premiumSubscriberClass, !!isPremium);
		syncNavigationTheme();
	}

	function syncPremiumClass() {
		if (window.Roblox && window.Roblox.users && Roblox.users.authenticatedUserId) {
			RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(function (premiumSubscriber) {
				togglePremiumClass(premiumSubscriber);

				if (premiumSubscriber) {
					localStorage.setItem("isRPlusPremium", premiumSubscriber.toString());
				} else {
					localStorage.removeItem("isRPlusPremium");
				}
			}).catch(console.error);
		} else {
			syncNavigationTheme();
		}
	}

	function init() {
		togglePremiumClass(localStorage.getItem("isRPlusPremium"));
		syncPremiumClass();
	}

	return {
		init: init,
		togglePremiumClass: togglePremiumClass,
		syncPremiumClass: syncPremiumClass
	};
})();

// WebGL3D
