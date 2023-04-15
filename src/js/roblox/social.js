/*
	roblox/social.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Social = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.social");

		this.register([
			this.getFriendRequestCount,
			this.followUser,
			this.unfollowUser,
			this.unfriendUser,
			this.isFollowing,
			this.getFriends
		]);
	}

	getFriendRequestCount() {
		return CachedPromise(`${this.serviceId}.getFriendRequestCount`, (resolve, reject) => {
			$.get("https://friends.roblox.com/v1/user/friend-requests/count").done((r) => {
				resolve(r.count);
			}).fail(Roblox.api.$reject(reject));
		}, [], {
			resolveExpiry: 30 * 1000
		});
	}

	followUser(userId) {
		return QueuedPromise(`${this.serviceId}.followUser`, (resolve, reject) => {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.post(`https://friends.roblox.com/v1/users/${userId}/follow`).done(() => {
				resolve({});
			}).fail(Roblox.api.$reject(reject));
		});
	}

	unfollowUser(userId) {
		return QueuedPromise(`${this.serviceId}.unfollowUser`, (resolve, reject) => {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.post(`https://friends.roblox.com/v1/users/${userId}/unfollow`).done(() => {
				resolve({});
			}).fail(Roblox.api.$reject(reject));
		});
	}

	unfriendUser(userId) {
		return QueuedPromise(`${this.serviceId}.unfriendUser`, (resolve, reject) => {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.post(`https://friends.roblox.com/v1/users/${userId}/unfriend`).done(() => {
				resolve({});
			}).fail(Roblox.api.$reject(reject));
		});
	}

	isFollowing(userId, followingUserId) {
		return CachedPromise(`${this.serviceId}.isFollowing`, (resolve, reject) => {
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

			Roblox.users.getAuthenticatedUser().then(user => {
				if (!user) {
					reject([{
						code: 0,
						message: "Unauthenticated"
					}]);
					return;
				}

				if (user.id !== userId) {
					reject([{
						code: 0,
						message: "userId must match authenticated user id :("
					}]);
					return;
				}

				$.post("https://friends.roblox.com/v1/user/following-exists", {
					targetUserIds: [
						followingUserId
					]
				}).done(data => {
					resolve(data.followings[0].isFollowing);
				}).catch(Roblox.api.$reject(reject));
			}).catch(reject);
		}, [userId, followingUserId], {
			queued: true,
			resolveExpiry: 60 * 1000,
			rejectExpiry: 15 * 1000
		});
	}

	getFriends(userId) {
		return CachedPromise(`${this.serviceId}.getFriends`, (resolve, reject) => {
			if (typeof (userId) != "number" || userId <= 0) {
				reject([Roblox.api.errorCodes.friends.invalidUserId]);
				return;
			}

			$.get(`https://friends.roblox.com/v1/users/${userId}/friends`).done((r) => {
				let users = r.data.map(user => {
					return {
						id: user.id,
						username: user.name
					};
				});
				
				resolve(users);
			}).fail(Roblox.api.$reject(reject));
		}, [userId], {
			resolveExpiry: 60 * 1000,
			queued: true
		});
	}
};

Roblox.social = new Roblox.Services.Social();

// WebGL3D
