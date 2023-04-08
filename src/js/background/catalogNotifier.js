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

	function showNotification(notification, metadata, assetId) {
		console.log("showNotification", notification, metadata, assetId);

		if (!isNaN(assetId) && notification.buttons && notification.buttons.length === 1 && notification.buttons[0].includes("Buy for")) {
			metadata.purchaseAssetId = assetId;
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
			var assetId = NaN;

			var metadata = {};

			if (notification.url) {
				metadata.url = notification.url;
				assetId = Roblox.catalog.getIdFromUrl(notification.url) || NaN;
				if (!isNaN(assetId)) {
					metadata.robloxSound = (notification.title || "").toLowerCase().includes("it's free")
						? 130771265
						: Number(notifierSounds.item) || 205318910;
				}
			}

			var creatorName = notification.items && notification.items.Creator;
			if (creatorName) {
				Roblox.users.getAuthenticatedUser().then(function(user) {
					if (!user) {
						console.log("Skipping notification because user is not logged in", notification);
						return;
					}

					if (creatorName === user.username) {
						showNotification(notification, metadata, assetId);
						return;
					}

					Roblox.users.getUserIdByUsername(creatorName).then(function(creatorId) {
						if (!creatorId) {
							console.warn("Skipping notification because could not map creatorName -> creatorId", notification, creatorName, creatorId);
							return;
						}

						if (creatorId === user.id) {
							showNotification(notification, metadata, assetId);
							return;
						}

						Roblox.social.isFollowing(user.id, creatorId).then(function(following) {
							if (!following) {
								console.log("Skipping notification because user does not follow creator", notification);
								return;
							}

							showNotification(notification, metadata, assetId);
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
				showNotification(notification, metadata, assetId);
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
		} else if (message.from === "/topics/catalog-notifier-freebies") {
			try {
				Extension.Storage.Singleton.get("autoTakeFreeItems").then(function (autoTake) {
					if(!autoTake) {
						return;
					}
					
					console.log("IT'S FREE!", message.data);
					Roblox.economy.purchaseProduct(Number(message.data.productId), 0).then(function (receipt) {
						console.log("Got me a freebie", receipt);

						var notification = {
							title: "Purchased new free item!",
							context: "Item Notifier",
							message: message.data.name,
							displayExpiration: 30 * 1000,
							metadata: {}
						};

						const createNotification = () => {
							Extension.NotificationService.Singleton.createNotification({
							}).then(() => {
								// Notification created
							}).catch(console.warn);
						};

						if (message.data.itemType === "Asset") {
							notification.metadata.url = Roblox.catalog.getAssetUrl(message.data.id, "Roblox-Plus");

							Roblox.thumbnails.getAssetThumbnailUrl(message.data.id, 150, 150).then(function(assetThumbnailUrl) {
								notification.icon = assetThumbnailUrl;
								createNotification();
							}).catch(function(err) {
								console.error(message, err);
								createNotification();
							});
						} else if (message.data.itemType === "Bundle") {
							notification.metadata.url = Roblox.catalog.getBundleUrl(message.data.id, "Roblox-Plus");

							Roblox.thumbnails.getBundleThumbnailUrl(message.data.id, 150, 150).then(function(bundleThumbnailUrl) {
								notification.icon = bundleThumbnailUrl;
								createNotification();
							}).catch(function(err) {
								console.error(message, err);
								createNotification();
							});
						} else {
							createNotification();
						}
					}).catch(function (e) {
						console.error("Did a new item really come out? Why did this fail to purchase?", e);
					});
				}).catch(console.warn);
			} catch (e) {
				console.error("Failed to parse asset.", message);
			}
		}
	}

	Extension.NotificationService.Singleton.onNotificationButtonClicked.addEventListener(e => {
		let notification = e.notification;
		let assetId = notification.metadata.purchaseAssetId;
		if (assetId) {
			let start = performance.now();
			let price = pround(e.notification.items.Price);

			const purchaseFailed = function (e) {
				Extension.NotificationService.Singleton.createNotification({
					title: "Item Notifier",
					context: "Item Purchase",
					message: "Purchase failed: " + (e[0] && e[0].message ? e[0].message : "Unknown issue"),
					icon: notification.icon,
					displayExpiration: 30 * 1000,
					metadata: {
						url: notification.metadata.url
					}
				}).then(() => {
					// Notification created
				}).catch(console.warn);
			};

			Roblox.catalog.getAssetInfo(assetId).then(function (asset) {
				// Use the price from the notification - worst case scenario it fails but we don't want to charge the user more than they think they're being charged.
				Roblox.economy.purchaseProduct(asset.productId, price).then(function (receipt) {
					console.log("Purchased!", receipt);
					var speed = performance.now() - start;
					Extension.NotificationService.Singleton.createNotification({
						title: "Item Notifier",
						context: "Item Purchase",
						message: `${asset.name} purchased in ${speed.toFixed(3)}ms`,
						icon: notification.icon,
						displayExpiration: 30 * 1000,
						metadata: {
							url: notification.metadata.url
						}
					}).then(() => {
						// Notification created
					}).catch(console.warn);
				}).catch(purchaseFailed);
			}).catch(purchaseFailed);

			Extension.NotificationService.Singleton.closeNotification(notification.id).then(() => {
				// Original notification closed
			}).catch(console.warn);
		}
	});
	
	chrome.gcm.onMessage.addListener(processMessage);
	chrome.instanceID.onTokenRefresh.addListener(updateToken);

	function init() {
		updateToken();
	}

	init();

	return {
		processMessage: processMessage,
		updateToken: updateToken,
		testLimitedNotification: function() {
			processMessage({
				"data": {
					"notification": JSON.stringify({
						"metadata": {},
						"buttons": [
							"Buy for R$70"
						],
						"icon": "https://www.roblox.com/asset-thumbnail/image?width=420&height=420&assetId=4484418472",
						"title": "New Hat",
						"message": "Epic Block Head",
						"items": {
							"Price": "R$70"
						},
						"url": "https://www.roblox.com/catalog/4484418472/Epic-Block-Head?rbxp=48103520"
					})
				},
				"from":"/topics/catalog-notifier-premium"
			});
		},
		testFreeItemNotification: function() {
			processMessage({
				"data": {
					"notification": JSON.stringify({
						"metadata": {},
						"buttons": [],
						"icon": "https://www.roblox.com/asset-thumbnail/image?width=420&height=420&assetId=4484418472",
						"title": "IT'S FREE",
						"message": "Epic Block Head",
						"items": {
							"Price": "Free"
						},
						"url": "https://www.roblox.com/catalog/4484418472/Epic-Block-Head?rbxp=48103520"
					})
				},
				"from":"/topics/catalog-notifier-premium"
			});
		},
		getLastRegistration: function () {
			return new Date(lastRegistration);
		}
	};
})();


// WebGL3D
