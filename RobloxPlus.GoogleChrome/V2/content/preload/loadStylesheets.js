(function () {
	var themeOverride = null;
	if (location.pathname.toLowerCase().startsWith("/games/341017984/")) {
		themeOverride = RPlus.style.themeTypes.easter;
	}
	RPlus.style.init(themeOverride);
	RPlus.style.loadStylesheet(chrome.extension.getURL("/css/rplus/images.css"));
	RPlus.style.loadStylesheet(chrome.extension.getURL("/css/customIcon.css"));
})();

// WebGL3D
