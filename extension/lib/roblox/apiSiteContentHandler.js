/*
	roblox/apiSiteContentHandler.js [02/26/2017]
*/
(window.Roblox || (Roblox = {})).apiSiteContentHandler = (function () {
	var validContentMethods = ["POST", "PATCH", "DELETE"];
	var contentTrigger = $.addTrigger({
		apiSubdomains: ["abtesting", "abuse", "accountsettings", "ads", "assetdelivery", "auth", "avatar", "badges", "billing", "captcha", "catalog", "cdnproviders", "chat", "clientsettings", "contacts", "develop", "discussions", "economy", "followings", "friends", "gameinternationalization", "gamejoin", "gamepersistence", "games", "groups", "inventory", "locale", "metrics", "midas", "notifications", "points", "premiumfeatures", "presence", "publish", "ratings", "surveys", "textfilter", "thumbnails", "translationroles", "translations", "users"]
	});

	var originalAjax = $.ajax;
	$.ajax = function () {
		var options = arguments[0];
		if (typeof(options) == "object" && typeof(options.data) == "object" && validContentMethods.includes((options.type || "").toUpperCase())) {
			var robloxSubdomain = ((options.url || "").match(/^https?:\/\/(\w+)\.roblox\.com\//) || ["", ""])[1];
			if (contentTrigger.apiSubdomains.includes(robloxSubdomain)) {
				options.contentType = "application/json";
				options.data = JSON.stringify(options.data);
			}
		}
		return originalAjax.apply(this, arguments);
	};

	return contentTrigger;
})();


// WebGL3D
