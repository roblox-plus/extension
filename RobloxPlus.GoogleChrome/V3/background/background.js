/*
	background.js [11/23/2016]
*/
rplus.getSettings(function (settings) {
	for (var n in settings) {
		settings[n].forEach(function (setting) {
			if (!localStorage.hasOwnProperty(setting.key)) {
				if (ext.incognito && setting.key == "login.changedUsername.enabled") {
					setting.defaultValue = true;
				} else if (ext.incognito && setting.key == "notifiers.start.enabled") {
					setting.defaultValue = false;
				}
				if (typeof (setting.defaultValue) == "number" && setting.hasOwnProperty("options")) {
					$.storage(setting.key, setting.options[setting.defaultValue]);
				} else {
					$.storage(setting.key, setting.defaultValue);
				}
			}
		});
	}


	(function (callBack) {
		$.storage([
			"notifiers.onlyDisplayWhileOnRoblox.enabled",
			"notifiers.start.enabled",
			"sound.voiceVolume"
		], function (vals) {
			var volume = typeof (vals['sound.voiceVolume']) == "number" ? vals['sound.voiceVolume'] / 100 : .5;

			function ready() {
				rplus.getGlobalSettings(function (settings) {
					Roblox.users.getCurrentUserInfo(function (user) {
						if (user.id) {
							$.storage("tts.usernamePronunciation." + user.username, function (preferredUsername) {
								if (typeof (preferredUsername) != "string") {
									preferredUsername = user.username;
								}
								callBack(settings.updateLog, user, preferredUsername ? "Hello, " + preferredUsername : "", volume);
							});
						} else {
							callBack(settings.updateLog, user, "", volume);
						}
					});
				});
			}

			if (!vals['notifiers.start.enabled']) {
				return;
			}
			if (vals['notifiers.onlyDisplayWhileOnRoblox.enabled']) {
				Roblox.getOpenRobloxTabs(function (tabs) {
					if (tabs.length) {
						ready();
					} else {
						chrome.webRequest.onCompleted.addListener(function () {
							chrome.webRequest.onCompleted.removeListener(arguments.callee);
							ready();
						}, {
							types: ["main_frame"],
							urls: ["*://*.roblox.com/*"]
						});
					}
				});
			} else {
				ready();
			}
		});
	})(function (updateLog, user, speach, volume) {
		$.notification({
			title: ext.manifest.name + " started",
			context: user.username ? "Hello, " + user.username : "",
			items: {
				"Version": ext.manifest.version,
				"Made by": "WebGL3D"
			},
			buttons: [
				"Bugs? Suggestions? Message me!"
			],
			url: updateLog,
			speak: speach,
			volume: volume
		}, function () {
			setTimeout(this.close, 15000);
		}).buttonClick(function (id) {
			if (id == 1) {
				window.open("https://www.roblox.com/messages/compose?recipientId=48103520");
			}
		});
	});
});



/* Update Check */
if (browser.name == "Chrome") {
	setInterval(function () {
		chrome.runtime.requestUpdateCheck(function (e) {
			if (e == "update_available") {
				setTimeout(ext.reload, 10 * 1000);
			}
		});
	}, 60 * 1000);
}



// WebGL3D
