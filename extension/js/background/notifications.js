/*
	jquery.notifications.ext.js [10/08/2016]
*/
(function () {
	var audioPlayers = {};
	var speaking = "";

	function setNotificationCount() {
		if (ext.incognito) {
			return;
		}
		chrome.browserAction.setBadgeText({
			text: (Object.keys($.notification.getNotifications()).length || "").toString()
		});
	}

	$.notification.on("notification", function (notification) {
		if (notification.metadata.hasOwnProperty("url")) {
			notification.click(function (tabId) {
				if (tabId === 0) {
					window.open(this.metadata.url);
				}
			});
		}

		var volume = 0.5;
		if (notification.metadata.hasOwnProperty("volume")) {
			volume = notification.metadata.volume;
		} else {
			var storedVolume = Number(storage.get("notificationVolume"));
			volume = isNaN(storedVolume) ? 0.5 : storedVolume;
		}

		if (notification.metadata.robloxSound) {
			Roblox.audio.getSoundPlayer(notification.metadata.robloxSound).then(function (player) {
				audioPlayers[notification.tag] = player;
				player.play(volume).stop(function () {
					delete audioPlayers[notification.tag];
				});
			}).catch(function(e) {
				console.error("Failed to play audio", notification.metadata.robloxSound, e);
			});
		} else if (notification.metadata.speak) {
			chrome.tts.speak(notification.metadata.speak, {
				lang: "en-GB",
				volume: volume,
				onEvent: function (e) {
					if (e.type == "start") {
						speaking = notification.tag;
					} else {
						if (speaking == notification.tag) {
							speaking = "";
						}
					}
				}
			});
		}

		if (notification.metadata.hasOwnProperty("expiration")) {
			setTimeout(function () {
				notification.close();
			}, notification.metadata.expiration);
		}

		setNotificationCount();
	}).on("close", function (notification) {
		if (audioPlayers[notification.tag]) {
			audioPlayers[notification.tag].stop();
		}
		if (speaking == notification.tag) {
			chrome.tts.stop();
		}

		setNotificationCount();
	});

	chrome.contextMenus.create({
		id: "clearNotifications",
		title: "Clear Notifications",
		contexts: ["browser_action"],
		onclick: function () {
			$.notification.clear();
		}
	});
})();


// WebGL3D
