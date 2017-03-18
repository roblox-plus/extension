/*
	roblox/social.js [03/18/2017]
*/
var Roblox = Roblox || {};

Roblox.social = (function () {
	return {
		getBlockedUsers: $.promise.cache(function (resolve, reject) {
			$.get("https://www.roblox.com/my/settings/json").done(function (r) {
				var users = [];
				r.BlockedUsersModel.BlockedUsers.forEach(function (user) {
					users.push({
						id: user.uid,
						username: user.Name
					});
				});
				resolve(users);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 60 * 1000
		}),
		followUser: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.post("https://api.roblox.com/user/follow", { followedUserId: userId }).done(function () {
				resolve();
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true
		}),
		unfollowUser: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.post("https://api.roblox.com/user/unfollow", { followedUserId: userId }).done(function () {
				resolve();
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true
		}),
		unfriendUser: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.post("https://www.roblox.com/api/friends/removefriend", { targetUserID: userId }).done(function () {
				resolve();
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true
		}),
		getFriends: $.promise.cache(function (resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get("https://www.roblox.com/friends/list", { pageSize: 1000, startIndex: 0, userId: userId }).done(function (r) {
				var users = [];
				r.Friends.forEach(function (user) {
					users.push({
						id: user.Id,
						username: user.Username
					});
				});
				resolve(users);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 60 * 1000,
			queued: true
		}),
		getPresence: $.promise.cache(function (resolve, reject, userIds) {
			if (!Array.isArray(userIds)) {
				reject([{
					code: 0,
					message: "Invalid userIds"
				}]);
				return;
			}
			if (userIds.length < 1) {
				resolve({});
				return;
			}

			$.get("https://www.roblox.com/presence/users?userIds=" + userIds.join("&userIds=")).done(function (r) {
				var presence = {};
				r.forEach(function (user) {
					presence[user.UserId] = {
						userId: user.UserId,
						isOnline: user.UserPresenceType != 0,
						game: user.UserPresenceType == 2 ? {
							id: 0,
							name: user.LastLocation
						} : null
					};
				});
				resolve(presence);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
			// https://www.roblox.com/presence/users?userIds=113515332&userIds=13094490
		}, {
			resolveExpiry: 30 * 1000,
			queued: true
		})
	};
})();

Roblox.social = $.addTrigger($.promise.background("Roblox.social", Roblox.social));

// WebGL3D
