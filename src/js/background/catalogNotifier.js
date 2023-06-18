/* background/notifiers/catalogNotifier.js [06/03/2017] */
RPlus.notifiers.catalog = (function () {
	var lastRegistration = 0;
	var maxTokenBackoff = 5 * 60 * 1000;
	var minTokenBackoff = 7500;
	var tokenBackoff = minTokenBackoff;
	var tokenExpiration = 30 * 60 * 1000;

	function updateToken() {
		Extension.Storage.Singleton.get("itemNotifier").then(itemNotifierOn => {
			if (!itemNotifierOn) {
				setTimeout(updateToken, minTokenBackoff);
				return;
			}

			Roblox.users.getAuthenticatedUser().then(function (user) {
				chrome.instanceID.getToken({ authorizedEntity: "303497097698", scope: "FCM" }, function (token) {
					$.post("https://api.roblox.plus/v2/itemnotifier/registertoken", {
						token: token,
						robloxUserId: user ? user.id : null
					}).done(function () {
						tokenBackoff = minTokenBackoff;
						lastRegistration = +new Date;
						setTimeout(updateToken, tokenExpiration);
					}).fail(function () {
						tokenBackoff = Math.min(maxTokenBackoff, tokenBackoff * 2);
						setTimeout(updateToken, tokenBackoff);
					});
				});
			}).catch(function () {
				tokenBackoff = Math.min(maxTokenBackoff, tokenBackoff * 2);
				setTimeout(updateToken, tokenBackoff);
			});
		}).catch(err => {
			console.warn(err);
			setTimeout(updateToken, minTokenBackoff);
		});
	}

	function showNotification(notification, metadata) {
		console.log("showNotification", notification, metadata);

		if (notification.buttons && notification.buttons.length === 1 && notification.buttons[0].includes("Buy for")) {
			// No longer supported.
			delete notification.buttons;
		}

		Extension.NotificationService.Singleton.createNotification({
			title: notification.message,
			message: notification.message,
			context: notification.title || "Roblox+ Catalog Notifier",
			icon: notification.icon || Extension.Singleton.icon.imageUrl,
			buttons: notification.buttons ? notification.buttons.map(b => {
				return { text: b };
			}) : [],
			items: notification.items || {},
			displayExpiration: 30 * 1000,
			metadata: metadata
		}).then(() => {
			// Notification created
		}).catch(console.warn);
	}

	function processNotification(notification) {
		Extension.Storage.Singleton.get("notifierSounds").then(notifierSounds => {
			notifierSounds = notifierSounds || {};
			var metadata = {};

			if (notification.url) {
				metadata.url = notification.url;
				metadata.robloxSound = Number(notifierSounds.item) || 205318910;
			}

			var creatorName = notification.items && notification.items.Creator;
			if (creatorName) {
				Roblox.users.getAuthenticatedUser().then(function(user) {
					if (!user) {
						console.log("Skipping notification because user is not logged in", notification);
						return;
					}

					if (creatorName === user.username) {
						showNotification(notification, metadata);
						return;
					}

					Roblox.users.getUserIdByUsername(creatorName).then(function(creatorId) {
						if (!creatorId) {
							console.warn("Skipping notification because could not map creatorName -> creatorId", notification, creatorName, creatorId);
							return;
						}

						if (creatorId === user.id) {
							showNotification(notification, metadata);
							return;
						}

						followingsService.isAuthenticatedUserFollowing(creatorId).then(function(following) {
							if (!following) {
								console.log("Skipping notification because user does not follow creator", notification);
								return;
							}

							showNotification(notification, metadata);
						}).catch(function(err) {
							console.error("Skipping notification for failure to check following creator", creatorName, notification, err);
						});
					}).catch(function(err) {
						console.error("Skipping notification for failure to map creatorName -> creatorId", creatorName, notification, err);
					});
				}).catch(function(err) {
					console.error("Skipping notification because could not check user is not logged in", notification, err);
				});
			} else {
				showNotification(notification, metadata);
			}
		}).catch(err => {
			console.warn("Not showing notification", err, notification);
		});
	}

	function processMessage(message) {
		console.log("Message from: " + message.from, message);

		if (message.from === "/topics/catalog-notifier" || message.from === "/topics/catalog-notifier-premium") {
			if (message.data && message.data.notification) {
				Extension.Storage.Singleton.get("itemNotifier").then(itemNotifierOn => {
					if(!itemNotifierOn) {
						return;
					}

					try {
						processNotification(JSON.parse(message.data.notification));
					} catch (e) {
						console.error("Failed to parse notification.", message);
					}
				}).catch(err => {
					console.warn(err, message);
				});
			}
		}
	}
	
	chrome.gcm.onMessage.addListener(processMessage);
	chrome.instanceID.onTokenRefresh.addListener(updateToken);

	function init() {
		updateToken();
	}

	init();

	return {
		processMessage: processMessage,
		updateToken: updateToken,
		getLastRegistration: function () {
			return new Date(lastRegistration);
		}
	};
})();


// WebGL3D
