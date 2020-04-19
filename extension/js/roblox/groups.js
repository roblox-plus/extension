/*
	roblox/groups.js [04/23/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Groups = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.groups");

		this.register([
			this.getUserGroups
		]);
	}

	getIdFromUrl(url) {
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

		let configureGroupMatch = url.toLowerCase().includes("groups/configure") ? Number((url.match(/id=(\d+)/i) || ["", 0])[1]) : NaN;
		if (!isNaN(configureGroupMatch) && configureGroupMatch > 0) {
			return configureGroupMatch;
		}

		return NaN;
	}

	getGroupUrl(id, name) {
		if (typeof (name) != "string" || !name) {
			name = "redirect";
		} else {
			name = name.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
		}

		return `https://www.roblox.com/groups/${id}/${name}`;
	}

	getUserGroups(userId) {
		return CachedPromise(`${this.serviceId}.getUserGroups`, (resolve, reject) => {
			// TODO: Audit groups api error codes
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`).done((r) => {
				let groups = r.data.map((userGroup) => {
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
			}).fail(Roblox.api.$reject(reject));
		}, [userId], {
			queued: true,
			resolveExpiry: 15 * 1000
		});
	}

	getUserGroup(groupId, userId) {
		return new Promise((resolve, reject) => {
			// TODO: Audit groups api error codes
			if (typeof (groupId) != "number" || groupId <= 0) {
				reject([{
					code: 0,
					message: "Invalid groupId"
				}]);
				return;
			}

			this.getUserGroups(userId).then((groups) => {
				for (let n = 0; n < groups.length; n++) {
					let membership = groups[n];
					if (membership.group.id === groupId) {
						resolve(membership);
						return;
					}
				}

				resolve(null);
			}).catch(reject);
		});
	}

	getUserRole(groupId, userId) {
		return new Promise((resolve, reject) => {
			this.getUserGroup(groupId, userId).then((membership) => {
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
		});
	}
};

Roblox.groups = new Roblox.Services.Groups();

// WebGL3D
