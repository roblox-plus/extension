/*
	jquery.notifications.ext.js [10/08/2016]
*/
(function () {
	var audioPlayers = {};
	var speaking = "";


	$.notification.on("beforeCreate", function () {
		if (this.details.hasOwnProperty("url")) {
			this.creationDetails.isClickable = true;
		}
	});

	$.notification.on("click", function () {
		if (this.details.hasOwnProperty("url")) {
			window.open(this.details.url);
		}
	});

	$.notification.on("close", function () {
		if (audioPlayers[this.details.tag]) {
			audioPlayers[this.details.tag].stop();
		}
		if (speaking == this.details.tag) {
			chrome.tts.stop();
		}
	});


	$.notification.on("afterCreate", function () {
		var note = this;
		var volume = note.details.hasOwnProperty("volume") ? note.details.volume : .5;
		if (note.details.hasOwnProperty("robloxSound") && note.details.robloxSound) {
			Roblox.audio.getSoundPlayer(note.details.robloxSound).then(function (player) {
				audioPlayers[note.details.tag] = player;
				player.play(volume).stop(function () {
					delete audioPlayers[note.details.tag];
				});
			});
		} else if (note.details.hasOwnProperty("speak") && note.details.speak) {
			chrome.tts.speak(note.details.speak, {
				lang: "en-GB",
				gender: note.details.speachGender || "male",
				volume: volume,
				onEvent: function (e) {
					if (e.type == "start") {
						speaking = note.details.tag;
					} else {
						if (speaking == note.details.tag) {
							speaking = "";
						}
					}
				}
			});
		}
	});
})();


// WebGL3D
