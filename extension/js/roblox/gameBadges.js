var Roblox = Roblox || {};

Roblox.gameBadges = (function () {
	return {
		getIdFromUrl: function (url) {
			return Number((url.match(/\/badges\/(\d+)\//i) || ["", 0])[1]) || 0;
		},

		// getBadgeAwardedDate(userId, badgeId)
		getBadgeAwardedDate: $.promise.cache(function (resolve, originalReject, userIdsAndBadgeIds) {
			var userIdRequests = {};
			var resultIndexes = {};
			var results = [];
			var doneUserIds = 0;

			userIdsAndBadgeIds.forEach(function(kvp, index) {
				let userId = kvp[0];
				let badgeId = kvp[1];
				
				if (userIdRequests[userId]) {
					userIdRequests[userId].push(badgeId);
				} else {
					userIdRequests[userId] = [badgeId];
				}

				var resolveKey = userId + ":" + badgeId;
				if (resultIndexes[resolveKey]) {
					resultIndexes[resolveKey].push(index);
				} else {
					resultIndexes[resolveKey] = [index];
				}

				results[index] = null;
			});

			var reject = function(e) {
				if (originalReject) {
					originalReject(e);
					resolve = null;
					originalReject = null;
				}
			};

			var fcb = function() {
				if (!resolve) {
					return;
				}

				if (++doneUserIds == Object.keys(userIdRequests).length) {
					resolve(results);
				}
			};

			for (let userId in userIdRequests) {
				$.get(`https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates`, {
					badgeIds: userIdRequests[userId].join(",")
				}).done(function(awardedDates) {
					try {
						awardedDates.data.forEach(function(award) {
							resultIndexes[userId + ":" + award.badgeId].forEach(function(index) {
								results[index] = award.awardedDate;
							});
						});

						fcb();
					} catch (e) {
						reject(e);
						return;
					}
				}).fail(function(jxhr, errors) { 
					reject(errors);
				});
			}

			if (Object.keys(userIdRequests).length <= 0) {
				reject([
					{
						code: 0,
						message: "No badge ids."
					}
				]);
			}
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000,
			queued: true,
			batchSize: 100
		})
	};
})();

Roblox.gameBadges = $.addTrigger($.promise.background("Roblox.gameBadges", Roblox.gameBadges));



// WebGL3D
