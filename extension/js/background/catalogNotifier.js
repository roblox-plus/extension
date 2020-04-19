/* background/notifiers/catalogNotifier.js [06/03/2017] */
RPlus.notifiers.catalog = (function () {
	var lastRegistration = 0;
	var maxTokenBackoff = 5 * 60 * 1000;
	var minTokenBackoff = 7500;
	var tokenBackoff = minTokenBackoff;
	var tokenExpiration = 30 * 60 * 1000;

	function updateToken() {
		storage.get("itemNotifier", function (itemNotifierOn) {
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
		});
	}

	function showNotification(notification, metadata, assetId) {
		console.log("showNotification", notification, metadata, assetId);

		$.notification({
			title: notification.title || "Roblox+ Catalog Notifier",
			context: notification.message || "",
			icon: notification.icon || ext.manifest.icons['48'],
			buttons: notification.buttons || [],
			items: notification.items || {},
			clickable: true,
			metadata: metadata
		}).buttonClick(function (index) {
			delete metadata.robloxSound;
			var notification = this;

			if (!isNaN(assetId) && notification.buttons[index].includes("Buy for")) {
				notification.close();
				var start = performance.now();
				var purchaseFailed = function (e) {
					$.notification({
						title: "Purchase failed",
						icon: notification.icon,
						context: e[0] && e[0].message ? e[0].message : "Unknown issue",
						clickable: true,
						metadata: metadata
					});
				};
				Roblox.catalog.getAssetInfo(assetId).then(function (asset) {
					// Use the price from the notification - worst case scenario it fails but we don't want to charge the user more than they think they're being charged.
					Roblox.economy.purchaseProduct(asset.productId, pround(notification.items.Price)).then(function (receipt) {
						console.log("Purchased!", receipt);
						var speed = performance.now() - start;
						$.notification({
							title: "Purchased!",
							context: asset.name,
							items: speed > 0 ? {
								"Speed": speed.toFixed(3) + "ms"
							} : {},
							icon: notification.icon,
							clickable: true,
							metadata: metadata
						});
					}).catch(purchaseFailed);
				}).catch(purchaseFailed);
			}
		});
	}

	function processNotification(notification) {
		var assetId = NaN;

		var metadata = {};

		if (notification.url) {
			metadata.url = notification.url;
			assetId = Roblox.catalog.getIdFromUrl(notification.url) || NaN;
			if (!isNaN(assetId)) {
				var notifierSounds = storage.get("notifierSounds") || {};
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
	}

	function processMessage(message) {
		console.log("Message from: " + message.from, message);

		if (message.from === "/topics/catalog-notifier" || message.from === "/topics/catalog-notifier-premium") {
			if (message.data && message.data.notification) {
				storage.get("itemNotifier", function (itemNotifierOn) {
					if(!itemNotifierOn) {
						return;
					}

					try {
						processNotification(JSON.parse(message.data.notification));
					} catch (e) {
						console.error("Failed to parse notification.", message);
					}
				});
			}
		} else if (message.from === "/topics/catalog-notifier-freebies") {
			try {
				storage.get("autoTakeFreeItems", function (autoTake) {
					if(!autoTake) {
						return;
					}
					
					console.log("IT'S FREE!", message.data);
					Roblox.economy.purchaseProduct(Number(message.data.productId), 0).then(function (receipt) {
						console.log("Got me a freebie", receipt);

						var notification = {
							title: "Purchased new free item!",
							context: message.data.name,
							clickable: true,
							metadata: {}
						};

						if (message.data.itemType === "Asset") {
							notification.metadata.url = "https://www.roblox.com/catalog/" + message.data.id + "/Roblox-Plus";

							Roblox.thumbnails.getAssetThumbnailUrl(message.data.id, 150, 150).then(function(assetThumbnailUrl) {
								notification.icon = assetThumbnailUrl;
								$.notification(notification);
							}).catch(function(err) {
								console.error(message, err);
								$.notification(notification);
							});
						} else if (message.data.itemType === "Bundle") {
							notification.metadata.url = "https://www.roblox.com/bundles/" + message.data.id + "/Roblox-Plus";

							Roblox.thumbnails.getBundleThumbnailUrl(message.data.id, 150, 150).then(function(bundleThumbnailUrl) {
								notification.icon = bundleThumbnailUrl;
								$.notification(notification);
							}).catch(function(err) {
								console.error(message, err);
								$.notification(notification);
							});
						} else {
							$.notification(notification);
						}
					}).catch(function (e) {
						console.error("Did a new item really come out? Why did this fail to purchase?", e);
					});
				});
			} catch (e) {
				console.error("Failed to parse asset.", message);
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
