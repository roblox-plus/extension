var RPlus = RPlus || {};
RPlus.notifiers = RPlus.notifiers || (function () {
	var notifierIdBase = 0;
	var notifierCaches = {};
	var notifierUsers = {};
	var lastRunDate = {};

	function rerunNotifier(properties, action) {
		setTimeout(runNotifier, properties.sleep, properties, action);
	}
	
	function runNotifier(properties, action) {
		lastRunDate[properties.notifierId] = new Date();

		Roblox.users.getAuthenticatedUser().then(function (user) {
			properties.isEnabled(function (isEnabled) {
				if (!isEnabled) {
					delete notifierUsers[properties.notifierId];
					delete notifierCaches[properties.notifierId];
					rerunNotifier(properties, action);
					return;
				}
				
				if (!user && properties.requireAuthenticatedUser) {
					rerunNotifier(properties, action);
					return;
				}

				var userId = user ? user.id : 0;
				if (notifierUsers[properties.notifierId] !== userId && properties.requireAuthenticatedUser) {
					delete notifierCaches[properties.notifierId];
				}
				notifierUsers[properties.notifierId] = userId;

				var rerun = notifierCaches.hasOwnProperty(properties.notifierId);
				if (!rerun) {
					notifierCaches[properties.notifierId] = {};
				}
				
				action(user, notifierCaches[properties.notifierId], rerun).then(function () {
					rerunNotifier(properties, action);
				}).catch(function () {
					rerunNotifier(properties, action);
				});
			});
		}).catch(function () {
			rerunNotifier(properties, action);
		});
	}

	function init(properties, action) {
		properties.notifierId = ++notifierIdBase;

		if (typeof (properties.sleep) !== "number") {
			properties.sleep = 5000;
		}

		if (typeof (properties.timeout) !== "number") {
			properties.timeout = 120 * 1000;
		}

		if (typeof (properties.isEnabled) !== "function") {
			properties.isEnabled = function (callBack) {
				callBack(true);
			};
		}

		runNotifier(properties, action);
		setInterval(function () {
			if ((+new Date) - lastRunDate[properties.notifierId].getTime() > properties.timeout) {
				console.log("Notifier timed out!", properties.notifierId, properties.name);
			}
		}, properties.sleep);

		return {
			getId: function () {
				return properties.notifierId;
			},

			getCache: function () {
				return notifierCaches[properties.notifierId] || {};
			},

			getLastRunDate: function () {
				return lastRunDate[properties.notifierId];
			},

			isEnabled: properties.isEnabled
		};
	}

	return {
		init: init
	};
})();


// WebGL3D
