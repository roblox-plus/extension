var RPlus = RPlus || {};
RPlus.notifiers = RPlus.notifiers || (function () {
	var notifierIdBase = 0;
	var notifierCaches = {};
	var notifierUsers = {};

	function rerunNotifier(properties, action) {
		setTimeout(runNotifier, properties.sleep, properties, action);
	}
	
	function runNotifier(properties, action) {
		Roblox.users.getAuthenticatedUser().then(function (user) {
			if (!user && properties.requireAuthenticatedUser) {
				rerunNotifier(properties, action);
				return;
			}

			var userId = user ? user.id : 0;
			if (notifierUsers[properties.notifierId] !== userId) {
				notifierUsers[properties.notifierId] = userId;
				delete notifierCaches[properties.notifierId];
			}

			var rerun = notifierCaches.hasOwnProperties(properties.notifierId);
			if (!rerun) {
				notifierCaches[properties.notifierId] = {};
			}

			action(user, notifierCaches[properties.notifierId], rerun).then(function () {
				rerunNotifier(properties, action);
			}).catch(function () {
				rerunNotifier(properties, action);
			});
		}).catch(function () {
			rerunNotifier(properties, action)
		});
	}

	function init(properties, action) {
		if (typeof (properties.sleep) !== "number") {
			properties.sleep = 5000;
		}
		properties.notifierId = ++notifierIdBase;

		runNotifier(properties, action);
	}

	return {
		init: runNotifier
	};
})();


// WebGL3D
