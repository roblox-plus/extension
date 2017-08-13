var RPlus = RPlus || {};

RPlus.premium = RPlus.premium || (function () {
	var knownPremiums = [];

	return {
		isPremium: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) !== "number") {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			if (userId <= 0) {
				resolve(false);
				return;
			} else if (knownPremiums.includes(userId)) {
				resolve(true);
				return;
			}

			$.get("http://api.roblox.plus/v1/rpluspremium/" + userId).done(function (data) {
				if (data.data) {
					knownPremiums.push(userId);
					resolve(true);
				} else {
					resolve(false);
				}
			}).fail(function () {
				reject([{ code: 0, message: "HTTP Request Failed" }]);
			});
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		}),

		allThemesUnlocked: $.promise.cache(function(resolve, reject, userId) {
			this.isPremium(userId).then(function(premium) {
				if (premium) {
					resolve(true);
					return;
				}

				$.get("https://www.roblox.com/Game/Badge/HasBadge.ashx", { UserID: userId, BadgeID: 375602203 }).done(function(r) {
					resolve(r === "Success");
				}).fail(function() {
					reject([{ code: 0, message: "HTTP Request Failed" }]);
				});
			}).catch(reject);
		})
	};
})();

RPlus.premium = $.addTrigger($.promise.background("RPlus.premium", RPlus.premium));


// WebGL3D
