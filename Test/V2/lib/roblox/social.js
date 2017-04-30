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
		isBlocked: $.promise.cache(function (resolve, reject, userId) {
			this.getBlockedUsers().then(function (blockedUsers) {
				for (var n in blockedUsers) {
					if (blockedUsers[n].id == userId) {
						resolve(true);
						return;
					}
				}
				resolve(false);
			}, reject);
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
		})
	};
})();

Roblox.social = $.addTrigger($.promise.background("Roblox.social", Roblox.social));

// WebGL3D
