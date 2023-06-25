(function () {
	let audioPlayers = {};
	let speaking = "";

	const audioStopped = (notificationId) => {
		delete audioPlayers[notificationId];
	};

	Extension.NotificationService.Singleton.onNotificationCreated.addEventListener(notification => {
		Extension.Storage.Singleton.get("notificationVolume").then(storedVolume => {
			var volume = 0.5;
			if (notification.metadata.hasOwnProperty("volume")) {
				volume = notification.metadata.volume;
			} else {
				volume = isNaN(storedVolume) ? 0.5 : storedVolume;
			}

			if (notification.metadata.robloxSound) {
				// This is no longer supported
			} else if (notification.metadata.speak) {
				if (chrome.tts.isSpeaking) {
					chrome.tts.stop();
				}

				chrome.tts.speak(notification.metadata.speak, {
					lang: "en-GB",
					volume: volume,
					onEvent: function (e) {
						if (e.type == "start") {
							speaking = notification.id;
						} else {
							if (speaking == notification.id) {
								speaking = "";
							}
						}
					}
				});
			}
		}).catch(err => {
			console.warn(notification, err);
		});
	});

	Extension.NotificationService.Singleton.onNotificationClosed.addEventListener(notification => {
		if (audioPlayers[notification.id]) {
			audioPlayers[notification.id].stop();
		}

		if (speaking == notification.id) {
			chrome.tts.stop();
		}

		delete audioPlayers[notification.id];
	});

	Extension.NotificationService.Singleton.onNotificationClicked.addEventListener(notification => {
		if (notification.metadata.url) {
			window.open(notification.metadata.url);
		}
	});

	Extension.NotificationService.Singleton.onNotificationButtonClicked.addEventListener(data => {
		let button = data.notification.buttons[data.buttonIndex];
		if (button && button.url) {
			window.open(button.url);
		}
	});

	chrome.contextMenus.create({
		id: "clearNotifications",
		title: "Clear Notifications",
		contexts: ["browser_action"],
		onclick: function () {
			Extension.NotificationService.Singleton.clearNotifications().then(notifications => {
				console.log("Notifications cleared", notifications);
			}).catch(console.error);
		}
	});
})();


// WebGL3D
