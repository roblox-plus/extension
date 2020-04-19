var RPlus = RPlus || {};
RPlus.Services = RPlus.Services || {};
RPlus.Services.SponsoredItems = class extends Extension.BackgroundService {
	constructor() {
		super("RPlus.premium");
		
		this.knownPremiums = {};

		this.register([
			this.getPremium,
			this.isPremium
		]);
	}

	getPremium(userId) {
		return CachedPromise(`${this.serviceId}.getPremium`, (resolve, reject) => {
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
			} else if (this.knownPremiums.hasOwnProperty(userId)) {
				resolve(this.knownPremiums[userId]);
				return;
			}

			const premiumBackup = () => {
				return new Promise((resolve, reject) => {
					$.get(`https://api.roblox.plus/v1/rpluspremium/${userId}`).done((data) => {
						if (data.data) {
							this.knownPremiums[userId] = {
								expiration: data.data.expiration ? new Date(data.data.expiration).getTime() : null
							};
							resolve(this.knownPremiums[userId]);
							RPlus.notifiers.catalog.updateToken();
						} else {
							resolve(null);
						}
					}).fail(Roblox.api.$reject(reject));
				});
			};

			Roblox.games.getVipServers(105689058).then((vipServers) => {
				var currentDateTime = +new Date;
				for (var n = 0; n < vipServers.length; n++) {
					if (vipServers[n].owner.id === userId && vipServers[n].expirationDate >= currentDateTime) {
						this.knownPremiums[userId] = {
							expiration: vipServers[n].expirationDate
						};
						resolve(this.knownPremiums[userId]);
						return;
					}
				}

				premiumBackup().then(resolve).catch(reject);
			}).catch(() => {
				premiumBackup().then(resolve).catch(reject);
			});
		}, [userId], {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		});
	}

	isPremium(userId) {
		return CachedPromise(`${this.serviceId}.isPremium`, (resolve, reject) => {
			this.getPremium(userId).then((premium) => {
				resolve(premium ? true : false);
			}).catch(reject);
		}, [userId], {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		});
	}
};

RPlus.premium = new RPlus.Services.SponsoredItems();

// WebGL3D
