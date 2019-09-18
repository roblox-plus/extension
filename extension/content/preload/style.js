var RPlus = RPlus || {};
RPlus.style = RPlus.style || (function () {
	function loadStylesheet(stylesheetLocation) {
		fetch(stylesheetLocation).then(function (response) {
			response.text().then(function (originalCss) {
				var css = originalCss.replace(/url\(([^)]+)\)/gi, function (u) {
					var url = u.substring(4, u.length - 1);
					if (url.match(/^\w+:/)) {
						return u;
					} else {
						return "url(" + chrome.extension.getURL(url) + ")";
					}
				});
				var styleTag = document.createElement("style");
				styleTag.innerHTML = css;
				document.head.appendChild(styleTag);
			}).catch(function (e) {
				console.warn("Failed to read stylesheet\n\t", stylesheetLocation, "\n\t", e);
			});
		}).catch(function (e) {
			console.warn("Failed to load stylesheet\n\t", stylesheetLocation, "\n\t", e);
		});
	}

	function togglePremiumClass(isPremium) {
		document.documentElement.classList.toggle("rplus-premium-subscriber", !!isPremium);
		console.log(document.documentElement.classList, isPremium);
	}

	function syncPremiumClass() {
		if (Roblox.users.authenticatedUserId) {
			RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(function (premiumSubscriber) {
				togglePremiumClass(premiumSubscriber);

				if (premiumSubscriber) {
					localStorage.setItem("isRPlusPremium", premiumSubscriber.toString());
				} else {
					localStorage.removeItem("isRPlusPremium");
				}
			}).catch(console.error);
		}
	}

	function init() {
		togglePremiumClass(localStorage.getItem("isRPlusPremium"));
	}

	return {
		loadStylesheet: loadStylesheet,
		init: init,
		togglePremiumClass: togglePremiumClass,
		syncPremiumClass: syncPremiumClass
	};
})();

// WebGL3D
