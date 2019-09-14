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

			$.post("https://friends.roblox.com/v1/users/" + userId + "/follow").done(function () {
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

			$.post("https://friends.roblox.com/v1/users/" + userId + "/unfollow").done(function () {
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

			$.post("https://friends.roblox.com/v1/users/" + userId + "/unfriend").done(function () {
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

			$.get("https://friends.roblox.com/v1/users/" + userId + "/friends").done(function (r) {
				var users = [];
				r.data.forEach(function (user) {
					users.push({
						id: user.id,
						username: user.name
					});
				});
				resolve(users);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			resolveExpiry: 60 * 1000,
			queued: true
		})
	};
})();

Roblox.social = $.addTrigger($.promise.background("Roblox.social", Roblox.social));

// WebGL3D
