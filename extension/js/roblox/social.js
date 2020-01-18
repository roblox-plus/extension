/*
	roblox/social.js [03/18/2017]
*/
var Roblox = Roblox || {};

Roblox.social = (function () {
	return {
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
