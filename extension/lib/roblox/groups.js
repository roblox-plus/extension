/*
	roblox/groups.js [04/23/2017]
*/
var Roblox = Roblox || {};

Roblox.groups = (function () {
	return {
		getIdFromUrl: function (url) {
			if (typeof(url) !== "string") {
				return NaN;
			}

			let v2UrlMatch = Number((url.match(/\/groups\/(\d+)/i) || ["", 0])[1]);
			if (!isNaN(v2UrlMatch) && v2UrlMatch > 0) {
				return v2UrlMatch;
			}

			let aspxMatch = Number((url.match(/gid=(\d+)/i) || ["", 0])[1]);
			if (!isNaN(aspxMatch) && aspxMatch > 0) {
				return aspxMatch;
			}

			return NaN;
		},

		getGroupUrl: function(id, name) {
			if (typeof (name) != "string" || !name) {
				name = "redirect";
			} else {
				name = name.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
			}
			return "https://www.roblox.com/groups/" + id + "/" + name;
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

		getUserGroups: $.promise.cache(function(resolve, reject, userId) {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get("https://groups.roblox.com/v2/users/" + userId + "/groups/roles").done(function (r) {
				var groups = r.data.map(function(userGroup) {
					return {
						group: {
							id: userGroup.group.id,
							name: userGroup.group.name
						},
						role: {
							id: userGroup.role.id,
							name: userGroup.role.name,
							rank: userGroup.role.rank
						}
					};
				});

				resolve(groups);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 15 * 1000
		}),

		getUserGroup: $.promise.cache(function (resolve, reject, groupId, userId) {
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

			Roblox.groups.getUserGroups(userId).then(function(groups) {
				for (var n = 0; n < groups.length; n++) {
					var membership = groups[n];
					if (membership.group.id === groupId) {
						resolve(membership);
						return;
					}
				}

				resolve(null);
			}).catch(reject);
		}, {
			queued: true,
			resolveExpiry: 15 * 1000
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

			Roblox.groups.getUserGroup(groupId, userId).then(function(membership) {
				if (membership) {
					resolve(membership.role);
					return;
				}
				
				resolve({
					id: 0,
					name: "Guest",
					rank: 0
				});
			}).catch(reject);
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
