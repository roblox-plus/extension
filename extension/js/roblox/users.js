/*
	roblox/users.js [10/15/2016]
*/
var Roblox = Roblox || {};

Roblox.users = (function () {
	var maxUsernameLength = 50; // Yes the limit of usernames is 20 right now, but there are usernames that exist that are longer than that.

	var isUsernameValid = function (username) {
		if (typeof (username) !== "string" || username.length < 2 || username.length > maxUsernameLength) {
			return false;
		}

		return true;
	};

	return {
		getIdFromUrl: function (url) {
			var match = url.match(/\/users\/(\d+)\//i) || url.match(/user\.aspx.*id=(\d+)/i) || ["", 0];
			return Number(match[1]) || 0;
		},

		getProfileUrl: function (info) {
			if (typeof (info) == "string") {
				return "https://www.roblox.com/users/profile?username=" + encodeURIComponent(info);
			}
			return "https://www.roblox.com/users/" + (Number(info) || 0) + "/profile";
		},

		getCurrentUserId: $.promise.cache(function (resolve, reject) {
			this.getAuthenticatedUser().then((user) => {
				resolve(user ? user.id : 0);
			}).catch(reject);
		}),

		getAuthenticatedUser: $.promise.cache(function (resolve, reject) {
			$.get("https://users.roblox.com/v1/users/authenticated").done((r) => {
				resolve({
					id: r.id,
					username: r.name
				});
			}).fail((jxhr, errors) => {
				if (jxhr.status === 401) {
					resolve();
				}

				reject(errors);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 15 * 1000
		}),

		getByUserId: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) !== "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			this.getUsernameByUserId(userId).then(function (username) {
				if (username) {
					resolve({
						id: userId,
						username: username
					});
				} else {
					reject([{
						code: 0,
						message: "User not found"
					}]);
				}
			}).catch(reject);
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000
		}),

		getByUsername: $.promise.cache(function (resolve, reject, username) {
			if (!isUsernameValid(username)) {
				reject([{
					code: 0,
					message: "Invalid username"
				}]);
				return;
			}

			$.post("https://users.roblox.com/v1/usernames/users", {
				usernames: [username]
			}).done(function (r) {
				if (r.data.length > 0) {
					resolve({
						id: r.data[0].id,
						username: r.data[0].name
					});
				} else {
					reject([{
						code: 0,
						message: "User not found"
					}]);
				}
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000,
			queued: true
		}),

		getUserIdByUsername: $.promise.cache(function (resolve, reject, usernames) {
			var results = {};
			var remainingUsernames = [];

			usernames.forEach(function (username) {
				if (!isUsernameValid(username)) {
					return;
				}

				username = username.toLowerCase();
				if (!remainingUsernames.includes(username)) {
					remainingUsernames.push(username);
				}
			});

			if (remainingUsernames.length <= 0) {
				resolve(results);
				return;
			}

			$.post("https://users.roblox.com/v1/usernames/users", {
				usernames: remainingUsernames
			}).done(function (r) {
				var usernameMap = {};
				r.data.forEach(function (user) {
					usernameMap[user.requestedUsername] = user.id;
				});

				usernames.forEach(function (username) {
					var userId = usernameMap[username.toLowerCase()];
					if (userId) {
						results[username] = userId;
					}
				});

				resolve(results);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000,
			queued: true,
			batchSize: 100,
			singleArgument: true
		}),

		getUsernameByUserId: $.promise.cache(function (resolve, reject, userIds) {
			var results = {};
			var remainingUserIds = [];

			userIds.forEach(function (userId) {
				if (typeof(userId) === "number" && userId > 0 && !remainingUserIds.includes(userId)) {
					remainingUserIds.push(userId);
				}
			});

			if (remainingUserIds.length <= 0) {
				resolve(results);
				return;
			}

			$.post("https://users.roblox.com/v1/users", {
				userIds: remainingUserIds
			}).done(function (r) {
				r.data.forEach(function (user) {
					results[user.id] = user.name;
				});

				resolve(results);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000,
			queued: true,
			batchSize: 100,
			singleArgument: true
		}),

		/*
			locationTypes:
				2 - Online
				3 - Studio
				4 - Game
		*/
		getPresence: $.promise.cache(function (resolve, reject, userIds) {
			if (!Array.isArray(userIds)) {
				reject([{
					code: 0,
					message: "userIds must be array"
				}]);
				return;
			}

			var presence = {};
			if (userIds.length <= 0) {
				resolve(presence);
			}

			// Mappings from location types from Api -> comment types mentioned above
			var locationTypeTranslations = {
				3: 3,
				2: 4,
				1: 2
			};

			$.post("https://presence.roblox.com/v1/presence/users", { userIds: userIds }).done(function (presences) {
				presences.userPresences.forEach(function (report) {
					presence[report.userId] = {
						game: report.gameId ? {
							placeId: report.placeId,
							serverId: report.gameId,
							name: report.lastLocation
						} : null,
						locationName: report.lastLocation,
						locationType: locationTypeTranslations[report.userPresenceType] || 0
					};
				});

				resolve(presence);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000,
			queued: true
		})
	};
})();

Roblox.users = $.addTrigger($.promise.background("Roblox.users", Roblox.users));



// WebGL3D
