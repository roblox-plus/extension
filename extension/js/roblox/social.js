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
		isFollowing: $.promise.cache(function (resolve, reject, userId, followingUserId) {
			// is userId following followingUserId
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			if (typeof (followingUserId) != "number" || followingUserId <= 0) {
				reject([{
					code: 0,
					message: "Invalid followingUserId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/user/following-exists", {
				userId: followingUserId,
				followerUserId: userId,
			}).done(function(data) {
				if (data.success) {
					resolve(data.isFollowing);
				} else {
					reject([{
						code: 0,
						message: "Unknown error checking follow status"
					}]);
				}
			}).fail(function() {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true,
			resolveExpiry: 60 * 1000,
			rejectExpiry: 15 * 1000
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
