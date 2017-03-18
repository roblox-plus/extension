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
			reject([]);
		});
	}),

	getByUserId: $.promise.cache(function (resolve, reject, userId) {
		if (typeof (userId) != "number" || userId <= 0) {
			reject([{
				code: 1,
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
				code: 2,
				message: "HTTP request failed"
			}]);
		});
	}, {
		rejectExpiry: 5 * 1000,
		resolveExpiry: 60 * 1000
	}),

	getByUsername: $.promise.cache(function (resolve, reject, username) {
		// Yes the limit of usernames is 20 right now, but there are usernames that exist that are longer than that.
		if (typeof (username) != "string" || username.length < 2 || username.length > 50) {
			reject([{
				code: 1,
				message: "Invalid username"
			}]);
			return;
		}

		$.get("https://api.roblox.com/users/get-by-username", { username: username }).done(function (r) {
			if (!r.hasOwnProperty("success") || r.success) {
				Roblox.users.getByUserId(r.Id).then(resolve, reject);
			} else {
				reject([{
					code: 3,
					message: r.errorMessage
				}]);
			}
		}).fail(function () {
			reject([{
				code: 2,
				message: "HTTP request failed"
			}]);
		});
	}, {
		rejectExpiry: 5 * 1000,
		resolveExpiry: 60 * 1000
	})
};

Roblox.users = $.addTrigger($.promise.background("Roblox.users", Roblox.users));



// WebGL3D
