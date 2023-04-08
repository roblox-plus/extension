/* background/notifiers/friendNotifier.js [06/04/2017] */
RPlus.notifiers.friends = (function () {
	function clicknote(friend, header) {
		Extension.Storage.Singleton.get("notifierSounds").then(notifierSounds => {
			Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 150, 150).then((headshotThumbnailUrl) => {
				Extension.NotificationService.Singleton.createNotification({
					id: `friend${friend.id}`,
					context: "Roblox+ Friend Notifier",
					title: header,
					icon: headshotThumbnailUrl,
					displayExpiration: 30 * 1000,
					metadata: {
						robloxSound: Number((notifierSounds || {}).friend) || 0,
						url: Roblox.users.getProfileUrl(friend.id)
					}
				}).then(() => {
					// Notification created
				}).catch(console.warn.bind(console, "Roblox.notifiers.friends"));
			}).catch(console.error.bind(console, "Roblox.notifiers.friends"));
		}).catch(e => {
			console.warn(e);
		});
	};

	function getFriendsWithPresence(userId) {
		return new Promise(function (resolve, reject) {
			Roblox.social.getFriends(userId).then(function (friends) {
				var friendIds = [];
				var friendMap = {};
				friends.forEach(function (friend) {
					friendIds.push(friend.id);
					friendMap[friend.id] = friend;
				});
				Roblox.presence.getPresence(friendIds).then(function (presences) {
					var friendsWithPresence = [];
					for (var n in presences) {
						var friend = friendMap[Number(n)];
						presences[n].username = friend.username;
						presences[n].id = friend.id;
						presences[n].isOnline = presences[n].locationType != 0;
						friendsWithPresence.push(presences[n]);
					}
					resolve(friendsWithPresence);
				}, reject);
			}, reject);
		});
	};

	Extension.NotificationService.Singleton.onNotificationButtonClicked.addEventListener(e => {
		if (e.notification.metadata.followGameUserId) {
			Roblox.games.launch({
				followUserId: e.notification.metadata.followGameUserId
			});
		}
	});

	return RPlus.notifiers.init({
		name: "Friends",
		sleep: 10 * 1000,
		isEnabled: function (callBack) {
			Extension.Storage.Singleton.get("friendNotifier").then(function(notifierSettings) {
				callBack(notifierSettings && notifierSettings.on);
			}).catch(function(e) {
				console.warn(e);
				callBack(false);
			});
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			Extension.Storage.Singleton.get("friendNotifier").then(function(notifierSettings) {
				var fn = notifierSettings || {};

				getFriendsWithPresence(user.id).then(function (list) {
					var tag = [];

					list.forEach(function (friend) {
						tag.push(friend.id);
						var old = cache[friend.id];

						if (rerun && (!Array.isArray(fn.blocked) || !fn.blocked.includes(friend.id))) {
							if (!old) {
								//clicknote(o,"You and "+o.username+" are now friends!");
							} else if (fn.game && friend.game && friend.locationType === 4 && (!old.game || old.game.serverId !== friend.game.serverId)) {
								Extension.Storage.Singleton.get("notifierSounds").then(notifierSounds => {
									Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 150, 150).then((headshotThumbnailUrl) => {
										Extension.NotificationService.Singleton.createNotification({
											id: `friend${friend.id}`,
											title: `${friend.username} joined a game`,
											context: "Roblox+ Friend Notifier",
											message: friend.game.name,
											icon: headshotThumbnailUrl,
											buttons: [
												{ text: "Follow" }
											],
											displayExpiration: 30 * 1000,
											metadata: {
												followGameUserId: friend.id,
												robloxSound: Number((notifierSounds || {}).friend) || 0,
												url: Roblox.users.getProfileUrl(friend.id)
											}
										}).then(function () {
											// Notification created
										}).catch(console.warn.bind(console, "Roblox.notifiers.friends"));
									}).catch(console.error.bind(console, "Roblox.notifiers.friends"));
								}).catch(e => {
									console.warn(e);
								});
							} else if (fn.online && (old.isOnline != friend.isOnline) && friend.isOnline) {
								clicknote(friend, friend.username + " is now online");
							} else if (fn.offline && (old.isOnline != friend.isOnline) && !friend.isOnline) {
								clicknote(friend, friend.username + " is now offline");
							}
						}

						cache[friend.id] = friend;
					});

					for (var n in cache.data) {
						if (!tag.includes(Number(n))) {
							delete cache.data[n];
						}
					}

					resolve([]);
				}, reject);
			}).catch(reject);
		});
	});
})();


// WebGL3D
