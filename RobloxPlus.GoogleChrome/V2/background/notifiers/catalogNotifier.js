/* background/notifiers/catalogNotifier.js [06/03/2017] */
RPlus.notifiers.catalog = (function () {
	var lastRegistration = 0;
	
	function sendToken() {
		Roblox.users.getCurrentUserId().then(function (userId) {
			if (userId <= 0 || !storage.get("itemNotifier")) {
				setTimeout(sendToken, 5000);
				return;
			}

			chrome.gcm.register(["473489927480"], function (registrationId) {
				$.post("https://api.roblox.plus/v1/itemnotifier/registertoken", {
					token: registrationId,
					robloxUserId: userId
				}).done(function () {
					lastRegistration = +new Date;
				}).fail(function () {
					setTimeout(sendToken, 5000);
				});
			});
		}).catch(function () {
			setTimeout(sendToken, 5000);
		});
	}

	function processMessage(message) {
		console.log("Catalog notifier message", message);
		if (message.data && typeof (message.data.json) === "string" && storage.get("itemNotifier")) {
			try {
				var data = JSON.parse(message.data.json);
				var assetId = NaN;

				var metadata = {
					url: data.url
				};

				if (data.url) {
					assetId = Roblox.catalog.getIdFromUrl(data.url) || NaN;
					if (!isNaN(assetId)) {
						metadata.robloxSound = (data.title || "").toLowerCase().includes("it's free")
							? 130771265
							: Number((storage.get("notifierSounds") || {}).items) || 205318910;
					}
				}

				$.notification({
					title: data.title || "Roblox+ Catalog Notifier",
					context: data.message || "",
					icon: data.icon || ext.manifest.icons['48'],
					buttons: data.buttons || [],
					items: data.items || {},
					clickable: true,
					metadata: metadata
				}).buttonClick(function (index) {
					var notification = this;
					if (!isNaN(assetId) && notification.buttons[index].includes("Buy for")) {
						notification.close();
						var start = performance.now();
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
									metadata: {
										url: data.url
									}
								});
							}).catch(function (e) {
								$.notification({
									title: "Purchase failed",
									icon: notification.icon,
									context: e[0] && e[0].message ? e[0].message : "Unknown issue",
									clickable: true,
									metadata: {
										url: data.url
									}
								});
							});
						}).catch(function (e) {
							$.notification({
								title: "Purchase failed",
								icon: notification.icon,
								context: e[0] && e[0].message ? e[0].message : "Unknown issue",
								clickable: true,
								metadata: {
									url: data.url
								}
							});
						});
					}
				});
			} catch (e) {
				console.error("Error processing notifier message", message, e);
			}
		}
	}


	chrome.gcm.onMessage.addListener(processMessage);

	ipc.on("catalogNotifier:testBuyButton", function () {
		processMessage({
			data: {
				json: JSON.stringify({
					title: "New Limited",
					message: "Noob Assist: S'mores Snacker",
					items: {
						"Price": "R$75",
						"Sales": "5000/10000"
					},
					buttons: ["Buy for R$75"],
					icon: "https://www.roblox.com/asset-thumbnail/image?width=110&height=110&assetId=904518348",
					url: "https://www.roblox.com/catalog/904518348/Noob-Assist-Smores-Snacker"
				})
			},
			from: "self"
		});
	});


	function init() {
		setInterval(sendToken, 30 * 60 * 1000);
		sendToken();
	}

	init();

	return {
		processMessage: processMessage,
		getLastRegistration: function () {
			return new Date(lastRegistration);
		}
	};
})();


// WebGL3D
