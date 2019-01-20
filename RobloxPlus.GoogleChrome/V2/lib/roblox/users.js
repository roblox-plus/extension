/*
	roblox/users.js [10/15/2016]
*/
var Roblox = Roblox || {};

Roblox.users = {
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
		$.get("https://assetgame.roblox.com/Game/GetCurrentUser.ashx").done(function (r) {
			resolve(Number(r) || 0);
		}).fail(function () {
			reject([{
				code: 0,
				message: "HTTP request failed"
			}]);
		});
	}),

	getAuthenticatedUser: $.promise.cache(function (resolve, reject) {
		this.getCurrentUserId().then(function (authenticatedUserId) {
			if (authenticatedUserId <= 0) {
				resolve();
				return;
			}
			Roblox.users.getByUserId(authenticatedUserId).then(resolve, reject);
		}, reject);
	}),

	getByUserId: $.promise.cache(function (resolve, reject, userId) {
		if (typeof (userId) != "number" || userId <= 0) {
			reject([{
				code: 0,
				message: "Invalid userId"
			}]);
			return;
		}

		$.get("https://www.roblox.com/profile?userId=" + userId).done(function (r) {
			resolve({
				id: r.UserId,
				username: r.Username,
				bc: r.OBC ? "OBC" : (r.TBC ? "TBC" : (r.BC ? "BC" : "NBC"))
			});
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

	getByUsername: $.promise.cache(function (resolve, reject, username) {
		// Yes the limit of usernames is 20 right now, but there are usernames that exist that are longer than that.
		if (typeof (username) != "string" || username.length < 2 || username.length > 50) {
			reject([{
				code: 0,
				message: "Invalid username"
			}]);
			return;
		}

		$.get("https://api.roblox.com/users/get-by-username", { username: username }).done(function (r) {
			if (!r.hasOwnProperty("success") || r.success) {
				Roblox.users.getByUserId(r.Id).then(resolve, reject);
			} else {
				reject([{
					code: 0,
					message: r.errorMessage
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

Roblox.users = $.addTrigger($.promise.background("Roblox.users", Roblox.users));



// WebGL3D
