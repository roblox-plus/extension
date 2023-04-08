chrome.browserAction.setTitle({ title: Extension.Singleton.manifest.name + " " + Extension.Singleton.manifest.version });

(function() {
	let showNotificationsMessenger = new Extension.Messaging(Extension.Singleton, `notificationStream.showNotifications`, messageData => {
		return Promise.reject("Background page cannot show notifications.");
	});

	chrome.browserAction.onClicked.addListener(function () {
		chrome.tabs.query({
			active: true,
			currentWindow: true,
			url: ["*://www.roblox.com/*", "*://web.roblox.com/*"],
			status: "complete"
		}, function (tabs) {
			if (tabs.length === 1) {
				showNotificationsMessenger.sendMessage({}, tabs[0].id).then((data) => {
					console.log("showNotificationsMessenger", data);
				}).catch(err => {
					console.warn("showNotificationsMessenger", err);
				});
			} else {
				window.open(Extension.Singleton.manifest.homepage_url);
			}
		});
	});
})();
