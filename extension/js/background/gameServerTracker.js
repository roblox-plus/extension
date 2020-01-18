RPlus.notifiers.gameServerTracker = (function () {
	return RPlus.notifiers.init({
		name: "GameServerTracker",
		sleep: 20 * 1000,
		isEnabled: function (callBack) {
			callBack((storage.get("gameServerTracker") || {}).on);
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			Roblox.users.getPresence([user.id]).then(function(presence) {
				presence = presence[user.id];

				if (presence && presence.game && presence.game.serverId) {
					Roblox.games.trackJoinedServer(presence.game.serverId).then(function() {
						// Nothing to do, success!.
						resolve();
					}).catch(function(e) {
						console.error(e);
						reject(e);
					});
				} else {
					resolve();
				}
			}).catch(reject);
		});
	});
})();
