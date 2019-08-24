var RPlus = RPlus || {};

RPlus.premium = RPlus.premium || (function () {
	var knownPremiums = {};

	return {
		getPremium: $.promise.cache(function (resolve, reject, userId) {
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
			} else if (knownPremiums.hasOwnProperty(userId)) {
				resolve(knownPremiums[userId]);
				return;
			}

			var premiumBackup = function () {
				return new Promise(function (resolve, reject) {
					$.get("https://api.roblox.plus/v1/rpluspremium/" + userId).done(function (data) {
						if (data.data) {
							knownPremiums[userId] = {
								expiration: data.data.expiration ? new Date(data.data.expiration).getTime() : null
							};
							resolve(knownPremiums[userId]);
							RPlus.notifiers.catalog.updateToken();
						} else {
							resolve(null);
						}
					}).fail(function () {
						reject([{ code: 0, message: "HTTP Request Failed" }]);
					});
				});
			};

			Roblox.games.getVipServers(105689058).then(function (vipServers) {
				var currentDateTime = +new Date;
				for (var n = 0; n < vipServers.length; n++) {
					if (vipServers[n].owner.id === userId && vipServers[n].expirationDate >= currentDateTime) {
						knownPremiums[userId] = {
							expiration: vipServers[n].expirationDate
						};
						resolve(knownPremiums[userId]);
						return;
					}
				}

				premiumBackup().then(resolve).catch(reject);
			}).catch(function () {
				premiumBackup().then(resolve).catch(reject);
			});
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		}),

		isPremium: $.promise.cache(function (resolve, reject, userId) {
			this.getPremium(userId).then(function(premium) {
				resolve(premium ? true : false);
			}).catch(reject);
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		}),
		
		isThemeUnlocked: $.promise.cache(function (resolve, reject, userId, themeType) {
			if (themeType === "obc") {
				resolve(true);
				return;
			} else if (typeof(themeType) !== "string" || themeType === "") {
				resolve(false);
				return;
			}

			this.isPremium(userId).then(function (premium) {
				if (premium) {
					resolve(true);
					return;
				}

				if (themeType === "easter") {
					Roblox.inventory.userHasBadge(userId, 375602203).then(resolve).catch(reject);
				} else {
					resolve(false);
				}
			}).catch(reject);
		})
	};
})();

RPlus.premium = $.addTrigger($.promise.background("RPlus.premium", RPlus.premium));


// WebGL3D
