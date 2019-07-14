/*
	roblox/groups.js [04/23/2017]
*/
var Roblox = Roblox || {};

Roblox.groups = (function () {
	return {
		getIdFromUrl: function (url) {
			return typeof (url) === "string" ? Number((url.match(/gid=(\d+)/i) || ["", 0])[1]) || 0 : 0;
		},

		getGroupRoles: $.promise.cache(function (resolve, reject, groupId) {
			if (typeof (groupId) != "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}

			$.get("https://groups.roblox.com/v1/groups/" + groupId + "/roles").done(function (r) {
				resolve(r.roles.map(function (role) {
					return {
						id: role.id,
						name: role.name,
						rank: role.rank
					};
				}));
			}).fail(function (jxhr, errors) {
				reject(errors);
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

			$.ajax({
				type: "PATCH",
				url: "https://groups.roblox.com/v1/groups/" + groupId + "/users/" + userId,
				data: {
					roleId: groupRolesetId
				}
			}).done(function () {
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

			$.get("https://groups.roblox.com/v1/users/" + userId + "/groups/roles").done(function (r) {
				for (var n = 0; n < r.data.length; n++) {
					var membership = r.data[n];
					if (membership.group.id === groupId) {
						resolve({
							id: membership.role.id,
							name: membership.role.name,
							rank: membership.role.rank
						});
						return;
					}
				}

				resolve({
					id: 0,
					name: "Guest",
					rank: 0
				});
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 15 * 1000
		}),

		deleteGroupWallPost: $.promise.cache(function (resolve, reject, groupId, groupWallPostId) {
			if (typeof (groupId) !== "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}
			if (typeof (groupWallPostId) !== "number" || groupWallPostId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupWallPostId"
				}]);
				return;
			}

			$.ajax({
				type: "DELETE",
				url: "https://groups.roblox.com/v1/groups/" + groupId + "/wall/posts/" + groupWallPostId
			}).done(function () {
				resolve();
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 5 * 1000,
			rejectExpiry: 5 * 1000
		}),

		getGroupWallPosts: $.promise.cache(function (resolve, reject, groupId, cursor) {
			if (typeof (groupId) !== "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}

			$.get("https://groups.roblox.com/v1/groups/" + groupId + "/wall/posts", { cursor: cursor || "", limit: 100, sortOrder: "Desc" }).done(function (posts) {
				resolve(posts);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			resolveExpiry: 10 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		})
	};
})();

Roblox.groups = $.addTrigger($.promise.background("Roblox.groups", Roblox.groups));

// WebGL3D
