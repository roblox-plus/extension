/*
	roblox/groups.js [04/23/2017]
*/
var Roblox = Roblox || {};

Roblox.groups = (function () {
	return {
		getGroupRoles: $.promise.cache(function (resolve, reject, groupId) {
			if (typeof (groupId) != "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}

			$.get("https://www.roblox.com/api/groups/" + groupId + "/RoleSets").done(function (r) {
				var roles = [];
				r.forEach(function (role) {
					roles.push({
						id: role.ID,
						name: role.Name,
						rank: role.Rank
					});
				});
				resolve(roles);
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
		setUserRole: $.promise.cache(function (resolve, reject, groupId, userId, groupRolesetId) {
			if (typeof (groupId) != "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}
			if (typeof (groupRolesetId) != "number" || groupRolesetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupRolesetId"
				}]);
				return;
			}

			$.post("https://www.roblox.com/groups/api/change-member-rank?groupId=" + groupId + "&newRoleSetId=" + groupRolesetId + "&targetUserId=" + userId).done(function (r) {
				resolve();
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true,
			resolveExpiry: 100,
			rejectExpiry: 500
		}),
		getUserRole: $.promise.cache(function (resolve, reject, groupId, userId) {
			if (typeof (groupId) != "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			this.getGroupRoles(groupId).then(function (roles) {
				$.get("https://assetgame.roblox.com/Game/LuaWebService/HandleSocialRequest.ashx?method=GetGroupRole&playerid=" + userId + "&groupid=" + groupId).done(function (role) {
					for (var n = 0; n < roles.length; n++) {
						if (roles[n].name == role) {
							resolve(roles[n]);
							return;
						}
					}
					resolve({
						id: 0,
						name: "Guest",
						rank: 0
					});
				}).fail(function () {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}, reject);
		}, {
			queued: true,
			resolveExpiry: 15 * 1000
		})
	};
})();

Roblox.groups = $.addTrigger($.promise.background("Roblox.groups", Roblox.groups));

// WebGL3D
