Extension.NotificationService = class extends Extension.BackgroundService {
	constructor(extension) {
		super("Extension.NotificationService");

		this._idBase = 0;
		this.notifications = {};
		this.extension = extension;
		this.onNotificationClosed = new Extension.Event("Extension.NotificationService.onNotificationClosed", extension);
		this.onNotificationCreated = new Extension.Event("Extension.NotificationService.onNotificationCreated", extension);
		this.onNotificationClicked = new Extension.Event("Extension.NotificationService.onNotificationClicked", extension);
		this.onNotificationButtonClicked = new Extension.Event("Extension.NotificationService.onNotificationButtonClicked", extension);

		this.register([
			this.createNotification,
			this.closeNotification,
			this.showNotification,
			this.hideNotification,
			this.getNotifications,

			this.clickNotification,
			this.clickNotificationButton
		]);
	}

	createNotification(notificationData) {
		return new Promise((resolve, reject) => {
			let notification = {
				// A unique identifier for the notification that can be used to ensure no two notifications exist at the same time for the same thing.
				id: typeof (notificationData.id) === "string" && notificationData.id.length > 0 ? notificationData.id : `Extension.NotificationService.Notification.${this.extension.id}.${++this._idBase}`,

				// Title of the notification
				title: typeof (notificationData.title) === "string" && notificationData.title.length > 0 ? notificationData.title : this.extension.name,

				// Main notification content.
				message: typeof (notificationData.message) === "string" && notificationData.message.length > 0 ? notificationData.message : "",

				// Alternate notification content with a lower-weight font.
				context: typeof (notificationData.context) === "string" && notificationData.context.length > 0 ? notificationData.context : "",

				// A URL to the sender's avatar, app icon, or a thumbnail for image notifications.
				// URLs can be a data URL, a blob URL, or a URL relative to a resource within this extension's .crx file.
				icon: typeof (notificationData.icon) === "string" && notificationData.icon.length > 0 ? notificationData.icon : this.extension.icon.imageUrl,

				// Items for multi-item notifications. Users on Mac OS X only see the first item.
				items: typeof(notificationData.items) === "object" ? notificationData.items : {},

				// Text and icons for up to two notification action buttons.
				buttons: Array.isArray(notificationData.buttons) ? notificationData.buttons.filter(b => {
					return b && b.text;
				}) : [],

				// Metadata about the notification that can be dumped into. Not used for any display purposes.
				metadata: typeof(notificationData.metadata) === "object" ? notificationData.metadata : {}
			};

			const createNotification = () => {
				this.notifications[notification.id] = notification;
				this.onNotificationCreated.blindDispatchEvent(notification);
				resolve(notification);

				if (!notificationData.hidden) {
					this.showNotification(notification.id, notificationData.displayExpiration).then(() => {
						// Notification shown successfully
					}).catch(err => {
						console.warn(`Extension.NotificationService.showNotification("${notification.id}", ${notificationData.displayExpiration})`, err);
					});
				}
			};

			let existingNotification = this.notifications[notification.id];
			if (existingNotification) {
				this.closeNotification(existingNotification.id).then(createNotification).catch(reject);
			} else {
				createNotification();
			}
		});
	}

	closeNotification(id) {
		return new Promise((resolve, reject) => {
			const removeNotification = () => {
				let notification = this.notifications[id];
				delete this.notifications[id];

				if (notification) {
					this.onNotificationClosed.blindDispatchEvent(notification);
				}

				resolve({});
			};

			this.hideNotification(id).then(removeNotification).catch((err) => {
				console.warn(`Extension.NotificationService.closeNotification("${id}")`, err);
				removeNotification();
			});
		});
	}

	showNotification(id, expiration) {
		let notification = this.notifications[id];
		if (notification) {
			return new Promise((resolve, reject) => {
				let items = [];
				let buttons = notification.buttons.map(button => {
					return {
						title: button.text
					};
				}).slice(0, 2);
	
				for (let key in notification.items) {
					items.push({
						title: key,
						message: notification.items[key]
					});
				}
	
				let chromeNotification = {
					type: "basic",
					iconUrl: notification.icon,
					title: notification.title,
					message: notification.message,
					requireInteraction: true
				};
	
				if (notification.context.length > 0) {
					chromeNotification.contextMessage = notification.context;
				}
	
				if (buttons.length > 0) {
					chromeNotification.buttons = buttons;
				}
	
				if (items.length > 0) {
					chromeNotification.type = "list";
					chromeNotification.items = items;
				}

				if (expiration && expiration > 0) {
					chromeNotification.requireInteraction = false;
					setTimeout(() => {
						// TODO: This will give an unexpected result if the user clicks close on the notification and then another notification is shown with the same id after
						this.hideNotification(notification.id);
					}, expiration);
				}
	
				chrome.notifications.create(notification.id, chromeNotification, function() {
					resolve({});
				});
			});
		} else {
			return Promise.reject("Notification does not exist");
		}
	}

	hideNotification(id) {
		return new Promise((resolve, reject) => {
			chrome.notifications.clear(id, wasCleared => {
				resolve(wasCleared);
			});
		});
	}

	clickNotification(id) {
		let notification = this.notifications[id];
		if (notification) {
			return this.onNotificationButtonClicked.dispatchEvent(notification);
		} else {
			return Promise.reject("Notification does not exist");
		}
	}

	clickNotificationButton(id, buttonIndex) {
		let notification = this.notifications[id];
		if (notification) {
			return this.onNotificationButtonClicked.dispatchEvent({
				notification: notification,
				buttonIndex: buttonIndex
			});
		} else {
			return Promise.reject("Notification does not exist");
		}
	}

	getNotifications() {
		let notifications = [];
		for (var id in this.notifications) {
			notifications.push(this.notifications[id]);
		}

		return Promise.resolve(notifications);
	}

	clearNotifications() {
		return new Promise((resolve, reject) => {
			this.getNotifications().then(notifications => {
				let promises = [];
				notifications.forEach(notification => {
					promises.push(this.closeNotification(notification.id));
				});

				Promise.all(promises).then(() => {
					resolve(notifications);
				}).catch(reject);
			}).catch(reject);
		});
	}
};

Extension.NotificationService.Singleton = new Extension.NotificationService(Extension.Singleton);

if (Extension.Singleton.executionContextType == Extension.ExecutionContextTypes.background) {
	//Extension.NotificationService.Singleton.onNotificationCreated.addEventListener(console.log.bind(console, "onNotificationCreated"));
	//Extension.NotificationService.Singleton.onNotificationClosed.addEventListener(console.log.bind(console, "onNotificationClosed"));
	//Extension.NotificationService.Singleton.onNotificationClicked.addEventListener(console.log.bind(console, "onNotificationClicked"));
	//Extension.NotificationService.Singleton.onNotificationButtonClicked.addEventListener(console.log.bind(console, "onNotificationButtonClicked"));

	chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
		if (byUser) {
			Extension.NotificationService.Singleton.closeNotification(notificationId);
		}
	});

	chrome.notifications.onClicked.addListener(function (notificationId) {
		Extension.NotificationService.Singleton.clickNotification(notificationId);
	});

	chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
		Extension.NotificationService.Singleton.clickNotificationButton(notificationId, buttonIndex);
	});
}
