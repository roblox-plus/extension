/*
	roblox/users.js [10/15/2016]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Users = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.users");

		this.userIdByNameCache = new TimedCache(30 * 60 * 1000); // username will always map to the same user id, that won't change. Only expire to free up memory.
		this.userNameByIdCache = new TimedCache(60 * 1000); // usernames can change, lookup by id cache is short-lived to support this
		this.getByUserIdProcessor = new BatchItemProcessor({}, this.processGetByUserId.bind(this), console.error.bind(console, "Roblox.users.getByUserId"));
		this.getByUsernameProcessor = new BatchItemProcessor({}, this.processGetByUsername.bind(this), console.error.bind(console, "Roblox.users.getByUsername"));

		this.register([
			this.getAuthenticatedUser,
			this.getByUserId,
			this.getByUsername,
			this.getUsernameByUserId,
			this.getUserIdByUsername
		]);
	}

	get maxUsernameLength() {
		// Yes the limit of usernames is 20 right now, but there are usernames that exist that are longer than that.
		return 50;
	}

	isUsernameValid(username) {
		if (typeof (username) !== "string" || username.length < 2 || username.length > this.maxUsernameLength) {
			return false;
		}

		return true;
	}

	getIdFromUrl(url) {
		var match = url.match(/\/users\/(\d+)\//i) || url.match(/user\.aspx.*id=(\d+)/i) || ["", 0];
		return Number(match[1]) || 0;
	}

	getProfileUrl(info) {
		if (typeof (info) == "string") {
			return "https://www.roblox.com/users/profile?username=" + encodeURIComponent(info);
		}

		return "https://www.roblox.com/users/" + (Number(info) || 0) + "/profile";
	}

	getCurrentUserId() {
		return new Promise((resolve, reject) => {
			this.getAuthenticatedUser().then(user => {
				resolve(user ? user.id : 0);
			}).catch(reject);
		});
	}

	getAuthenticatedUser() {
		return CachedPromise("Roblox.users.getAuthenticatedUser", (resolve, reject) => {
			$.get("https://users.roblox.com/v1/users/authenticated").done((r) => {
				this.userIdByNameCache.set(r.name.toLowerCase(), r.id);
				this.userNameByIdCache.set(r.id, r.name);

				resolve({
					id: r.id,
					username: r.name
				});
			}).fail((jxhr, errors) => {
				if (jxhr.status === 401) {
					resolve();
					return;
				}

				reject(errors);
			});
		}, [], {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 15 * 1000
		});
	}

	getByUserId(userId) {
		return new Promise((resolve, reject) => {
			let cachedUsername = this.userNameByIdCache.get(userId);
			if (cachedUsername.exists) {
				if (cachedUsername.item) {
					resolve({
						id: userId,
						username: cachedUsername.item
					});
				} else {
					reject([
						{
							code: 0,
							message: "User not found"
						}
					]);
				}

				return;
			}

			this.getByUserIdProcessor.push(userId).then(user => {
				if (user) {
					resolve({
						id: user.id,
						username: user.name
					});
				} else {
					reject([
						{
							code: 0,
							message: "User not found"
						}
					]);
				}
			}).catch(reject);
		});
	}

	getByUsername(username) {
		return new Promise((resolve, reject) => {
			if (!this.isUsernameValid(username)) {
				reject([
					{
						code: 0,
						message: "Invalid username"
					}
				]);

				return;
			}

			let cachedUserId = this.userIdByNameCache.get(username.toLowerCase());
			if (cachedUserId.exists) {
				let cachedUsername = this.userNameByIdCache.get(cachedUserId.item);
				if (cachedUsername.exists) {
					if (cachedUserId.item && cachedUsername.item) {
						resolve({
							id: cachedUserId.item,
							username: cachedUsername.item
						});
					} else {
						reject([
							{
								code: 0,
								message: "User not found"
							}
						]);
					}

					return;
				}
			}

			this.getByUsernameProcessor.push(username.toLowerCase()).then(user => {
				if (user) {
					resolve({
						id: user.id,
						username: user.name
					});
				} else {
					reject([
						{
							code: 0,
							message: "User not found"
						}
					]);
				}
			}).catch(reject);
		});
	}

	getUserIdByUsername(username) {
		return new Promise((resolve, reject) => {
			var cachedUserId = this.userIdByNameCache.get(username.toLowerCase());
			if (cachedUserId.exists) {
				resolve(cachedUserId.item);
				return;
			}

			this.getByUsernameProcessor.push(username.toLowerCase()).then(user => {
				resolve(user && user.id);
			}).catch(reject);
		});
	}

	getUsernameByUserId(userId) {
		return new Promise((resolve, reject) => {
			var cachedUserName = this.userNameByIdCache.get(userId);
			if (cachedUserName.exists) {
				resolve(cachedUserName.item);
				return;
			}

			this.getByUserIdProcessor.push(userId).then(user => {
				resolve(user && user.name);
			}).catch(reject);
		});
	}

	processGetByUserId(userIds) {
		return new Promise((resolve, reject) => {
			let result = [];
			let remainingUserIds = [];

			userIds.forEach(userId => {
				if (userId > 0) {
					remainingUserIds.push(userId);
				} else {
					result.push({
						success: true,
						item: userId,
						value: null
					});
				}
			});

			if (remainingUserIds.length <= 0) {
				resolve(result);
				return;
			}

			$.post("https://users.roblox.com/v1/users", {
				userIds: remainingUserIds
			}).done((r) => {
				let userMap = {};

				r.data.forEach((user) => {
					userMap[user.id] = user;
				});

				remainingUserIds.forEach((userId) => {
					let user = userMap[userId] || null;
					if (user) {
						this.userIdByNameCache.set(user.name.toLowerCase(), user.id);
						this.userNameByIdCache.set(user.id, user.name);
					} else {
						this.userNameByIdCache.set(userId, null);
					}

					result.push({
						success: true,
						item: userId,
						value: user
					});
				});

				resolve(result);
			}).fail((jxhr, errors) => {
				reject(errors);
			});
		});
	}

	processGetByUsername(usernames) {
		return new Promise((resolve, reject) => {
			let result = [];
			let remainingUserNames = [];

			usernames.forEach(username => {
				if (this.isUsernameValid(username)) {
					remainingUserNames.push(username);
				} else {
					result.push({
						success: true,
						item: username,
						value: null
					});
				}
			});

			if (remainingUserNames.length <= 0) {
				resolve(result);
				return;
			}

			$.post("https://users.roblox.com/v1/usernames/users", {
				usernames: remainingUserNames
			}).done((r) => {
				let userMap = {};

				r.data.forEach((user) => {
					userMap[user.requestedUsername.toLowerCase()] = user;
				});

				remainingUserNames.forEach((username) => {
					let user = userMap[username.toLowerCase()] || null;
					if (user) {
						this.userIdByNameCache.set(username.toLowerCase(), user.id);
						this.userIdByNameCache.set(user.name.toLowerCase(), user.id);
						this.userNameByIdCache.set(user.id, user.name);
					} else {
						this.userIdByNameCache.set(username.toLowerCase(), null);
					}

					result.push({
						success: true,
						item: username,
						value: user
					});
				});

				resolve(result);
			}).fail((jxhr, errors) => {
				reject(errors);
			});
		});
	}
};

Roblox.users = new Roblox.Services.Users();
// WebGL3D
