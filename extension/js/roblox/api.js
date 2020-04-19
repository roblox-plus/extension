var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Api = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.api");

		this.errorCodes = Roblox.Services.Api.ErrorCodes;
		this.subdomains = Roblox.Services.Api.Subdomains;
	}

	$reject(reject) {
		return (jxhr, errors) => {
			if (Array.isArray(errors)) {
				reject(errors);
			} else {
				reject([this.errorCodes.generic.requestFailed]);
			}
		};
	}
};

Roblox.Services.Api.Subdomains = ["abtesting", "abuse", "accountsettings", "ads", "assetdelivery", "auth", "avatar", "badges", "billing", "captcha", "catalog", "cdnproviders", "chat", "clientsettings", "contacts", "develop", "discussions", "economy", "followings", "friends", "gameinternationalization", "gamejoin", "gamepersistence", "games", "groups", "inventory", "locale", "metrics", "midas", "notifications", "points", "premiumfeatures", "presence", "publish", "ratings", "surveys", "textfilter", "thumbnails", "translationroles", "translations", "users"];
Roblox.Services.Api.ErrorCodes = {
	generic: {
		requestFailed: {
			code: 0,
			message: "HTTP Request Failed"
		},
		unauthorized: {
			code: 0,
			message: "Unauthorized"
		}
	}
};

Roblox.api = new Roblox.Services.Api();
