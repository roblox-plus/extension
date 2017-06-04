/* background/notifiers/friendNotifier.js [06/04/2017] */

var RPlus = RPlus || {};
RPlus.notifiers = RPlus.notifiers || {};
// Leaving friendNotifier for legacy reasons.
// TODO: Delete friendNotifier accessor
RPlus.notifiers.friend = friendNotifier = RPlus.notifiers.friend || (function () {
	var friendNotifier;
	friendNotifier = setupNotifier(function (loop, uid) {
		var fn = storage.get("friendNotifier") || {};
		if (!fn.on) {
			loop();
			return;
		}
		var startup = friendNotifier.ran != uid;
		if (startup) {
			friendNotifier.cache.clear();
		}
		friendNotifier.getFriendsWithPresence(uid).then(function (list) {
			friendNotifier.ran = uid;
			var tag = [];
			list.forEach(function (friend) {
				tag.push(friend.id);
				var old = friendNotifier.cache.get(friend.id);
				if (!startup && (type(fn.blocked) != "array" || fn.blocked.indexOf(friend.id) < 0)) {
					if (!old) {
						//friendNotifier.clicknote(o,"You and "+o.username+" are now friends!");
					} else if (fn.online && (old.isOnline != friend.isOnline) && friend.isOnline) {
						friendNotifier.clicknote(friend, friend.username + " is now online");
					} else if (fn.offline && (old.isOnline != friend.isOnline) && !friend.isOnline) {
						friendNotifier.clicknote(friend, friend.username + " is now offline");
					} else if (fn.game && friend.game && (!old.game || old.game.serverId != friend.game.serverId)) {
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
				friendNotifier.cache.set(friend.id, friend);
			});
			for (var n in friendNotifier.cache.data) {
				if (!tag.includes(Number(n))) {
					delete friendNotifier.cache.data[n];
				}
			}
			loop();
		}, loop);
	}, {
			userId: true
		});

	friendNotifier.clicknote = function (friend, header, note) {
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

	friendNotifier.getFriendsWithPresence = function (userId) {
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

	friendNotifier.ran = 0;
	friendNotifier.cache = compact.cache(0);
	friendNotifier.run();

	return friendNotifier;
})();



// WebGL3D
