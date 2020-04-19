RPlus.notifiers.gameServerTracker = (function () {
	return RPlus.notifiers.init({
		name: "GameServerTracker",
		sleep: 20 * 1000,
		isEnabled: function (callBack) {
			Extension.Storage.Singleton.get("gameServerTracker").then(setting => {
				callBack(setting && setting.on === true);
			}).catch(err => {
				console.warn(err);
				callBack(false);
			});
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			Roblox.presence.getPresenceByUserId(user.id).then(function(presence) {
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
