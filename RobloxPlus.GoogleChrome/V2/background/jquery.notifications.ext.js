/*
	jquery.notifications.ext.js [10/08/2016]
*/
(function () {
	var audioPlayers = {};
	var speaking = "";


	$.notification.on("notification", function (notification) {
		if (notification.metadata.hasOwnProperty("url")) {
			notification.click(function (tabId) {
				if (tabId === 0) {
					window.open(this.metadata.url);
				}
			});
		}

		var volume = notification.metadata.hasOwnProperty("volume") ? notification.metadata.volume : 0.5;
		if (notification.metadata.robloxSound) {
			Roblox.audio.getSoundPlayer(notification.metadata.robloxSound).then(function (player) {
				audioPlayers[notification.tag] = player;
				player.play(volume).stop(function () {
					delete audioPlayers[notification.tag];
				});
			});
		} else if (notification.metadata.speak) {
			chrome.tts.speak(notification.metadata.speak, {
				lang: "en-GB",
				gender: notification.metadata.speachGender || "male",
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
	}).on("close", function (notification) {
		if (audioPlayers[notification.tag]) {
			audioPlayers[notification.tag].stop();
		}
		if (speaking == notification.tag) {
			chrome.tts.stop();
		}
	});
})();


// WebGL3D
