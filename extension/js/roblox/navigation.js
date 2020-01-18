/*
	roblox/navigation.js [04/30/2017]
	This library exists souly to serve content.js in Roblox+
	NOTHING new should be added to this library, and ideally it shouldn't exist.
	But content.js needs both friend request count, and unread message count. And this endpoint conveniently contains both. What an evil world.
*/
var Roblox = Roblox || {};

Roblox.navigation = (function () {
	return {
		getNavigationCounters: $.promise.cache(function (resolve, reject) {
			Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
				if (authenticatedUserId <= 0) {
					reject([{
						code: 0,
						message: "Unauthorized"
					}]);
					return;
				}

				$.get("https://api.roblox.com/incoming-items/counts").done(function (r) {
					resolve({
						unreadMessageCount: r.unreadMessageCount,
						friendRequestCount: r.friendRequestsCount
					});
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			queued: true
		})
	};
})();

Roblox.navigation = $.addTrigger($.promise.background("Roblox.navigation", Roblox.navigation));

// WebGL3D
