/* background/notifiers/friendNotifier.js [06/04/2017] */
RPlus.notifiers.friends = (function () {
	function clicknote(friend, header, note) {
		return note = notify({
			header: header,
			icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 4),
			robloxSound: Number((storage.get("notifierSounds") || {}).friend) || 0,
			tag: "friend" + friend.id,
			clickable: true,
			url: {
				url: Roblox.users.getProfileUrl(friend.id),
				close: true
			}
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
				Roblox.users.getPresence(friendIds).then(function (presences) {
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


	return RPlus.notifiers.init({
		name: "Friends",
		sleep: 10 * 1000,
		isEnabled: function (callBack) {
			callBack((storage.get("friendNotifier") || {}).on);
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			var fn = storage.get("friendNotifier") || {};

			getFriendsWithPresence(user.id).then(function (list) {
				var tag = [];

				list.forEach(function (friend) {
					tag.push(friend.id);
					var old = cache[friend.id];

					if (rerun && (!Array.isArray(fn.blocked) || !fn.blocked.includes(friend.id))) {
						if (!old) {
							//clicknote(o,"You and "+o.username+" are now friends!");
						} else if (fn.online && (old.isOnline != friend.isOnline) && friend.isOnline) {
							clicknote(friend, friend.username + " is now online");
						} else if (fn.offline && (old.isOnline != friend.isOnline) && !friend.isOnline) {
							clicknote(friend, friend.username + " is now offline");
						} else if (fn.game && friend.game && (!old.game || old.game.serverId !== friend.game.serverId)) {
							note = notify({
								header: friend.username + " joined a game",
								lite: friend.game.name,
								icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 4),
								buttons: ["Follow"],
								robloxSound: Number((storage.get("notifierSounds") || {}).friend) || 0,
								tag: "friend" + friend.id,
								url: {
									url: Roblox.users.getProfileUrl(friend.id),
									close: true
								},
								clickable: true
							}).button1Click(function () {
								Roblox.games.launch({
									followUserId: friend.id
								});
							});
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
		});
	});
})();


// WebGL3D
