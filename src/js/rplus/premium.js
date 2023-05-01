var RPlus = RPlus || {};
RPlus.Services = RPlus.Services || {};
RPlus.Services.SponsoredItems = class extends Extension.BackgroundService {
	constructor() {
		super("RPlus.premium");
		
		this.knownPremiums = {};

		this.register([
			this.getPremium
		]);
	}

	getPremium(userId) {
		return new Promise((resolve, reject) => {
			if (typeof (userId) !== "number") {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			if (userId <= 0) {
				resolve(null);
				return;
			}

			premiumService.getPremiumExpirationDate(userId).then((expiration) => {
				if (expiration === null || expiration) {
					resolve({
						expiration: expiration ? expiration.getTime() : null
					});
				} else {
					resolve(null);
				}
			}).catch(reject);
		});
	}

	isPremium(userId) {
		return new Promise((resolve, reject) => {
			this.getPremium(userId).then((premium) => {
				resolve(premium ? true : false);
			}).catch(reject);
		});
	}
};

RPlus.premium = new RPlus.Services.SponsoredItems();

// WebGL3D
