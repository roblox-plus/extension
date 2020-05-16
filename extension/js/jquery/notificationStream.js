/*
	content/notificationStream.js [07/28/2017]
*/
var RPlus = RPlus || {};
RPlus.notificationStream = RPlus.notificationStream || (function () {
	var selectedNotificationStream = "";
	let notificationCards = {};

	function createNotificationImageContainer(src, title, link) {
		var container = $("<div class=\"notification-image-container\">");
		var plainCard = $("<div class=\"avatar avatar-headshot-sm card-plain\">");
		var anchor = $("<a>").attr("href", link || "javascript:/* Roblox+ */");
		var img = $("<img class=\"avatar-card-image\">").attr("src", src);

		if (title) {
			img.attr("title", title);
		}

		container.append(plainCard.append(anchor.append(img)));
		return container;
	}

	function createNotificationContentContainer(title, context, message) {
		var container = $("<div class=\"notification-item-content\">");
		var innerContainer = $("<div class=\"notification-data-container\">");

		var titleContainer = $("<div class=\"small notification-display-text\">").text(title);
		var itemsContainer = $("<span class=\"small notification-display-text\">");
		var contextContainer = $("<div class=\"text-date-hint\">").text(context);

		if (message) {
			var messageLabel = $("<div class=\"small message-preview\">").text(message);
			itemsContainer.append(messageLabel);
		}

		container.append(innerContainer.append(titleContainer, itemsContainer, contextContainer));
		return container;
	}

	function createNotificationCard(notification) {
		var message = notification.message;
		if (!message) {
			for (var n in notification.items) {
				message += n + ": " + notification.items[n] + "\n";
			}
		}

		var card = $("<li class=\"notification-stream-item unInteracted\">");
		var innerCard = $("<a class=\"notification-item\" disabled>").attr({
			"href": notification.metadata.url || "javascript:/* Roblox+ */",
			"title": message
		});
		var closeButton = $("<span class=\"icon-turn-off\">").attr({
			"title": "Close notification"
		});
		var imageContainer = createNotificationImageContainer(notification.icon, "", notification.metadata.url);
		var contentContainer = createNotificationContentContainer(notification.title, notification.context, message);

		if (notification.metadata.url) {
			card.addClass("clickable");
			innerCard.removeAttr("disabled");
		}

		innerCard.click(function (e) {
			if (e.target === closeButton[0]) {
				Extension.NotificationService.Singleton.closeNotification(notification.id).then(() => {
					// notification closed
				}).catch(console.error);
				return false;
			}
		});

		innerCard.append(imageContainer, contentContainer, closeButton);
		card.append(innerCard);

		return card.hide();
	}

	function pushNotification(customStreamDiv, data) {
		var notification = createNotificationCard(data);
		customStreamDiv.prepend(notification);
		notification.show();
		return notification;
	}

	function toggleStreams() {
		selectedNotificationStream = selectedNotificationStream === ext.id ? "roblox" : ext.id;
		$("ul[data-extension-stream][data-extension-stream != '" + selectedNotificationStream + "']").fadeOut();
		$("ul[data-extension-stream][data-extension-stream = '" + selectedNotificationStream + "']").fadeIn();
	}

	function notificationClosed(notification) {
		let notificationCard = notificationCards[notification.id];
		delete notificationCards[notification.id];

		if (notificationCard) {
			// TODO: Why doesn't this work?
			notificationCard.card.remove();
		}
	}

	function init() {
		var notificationView = $(".notification-content-view").each(function () {
			var customStreamDiv = $("<ul class=\"rplus-stream-list notification-stream-list\">").attr("data-extension-stream", ext.id).hide();
			var robloxStreamDiv = $(this).find(".notification-stream-list").attr("data-extension-stream", "roblox");
			
			robloxStreamDiv.after(customStreamDiv);

			const notificationCreated = function (notification) {
				var card = pushNotification(customStreamDiv, notification);

				card.click(function () {
					Extension.NotificationService.Singleton.clickNotification(notification.id).then(() => {
						// notification clicked
					}).catch(err => {
						console.error(err, notification);
					});
				});

				notificationCards[notification.id] = {
					notification: notification,
					card: card
				};
			};

			Extension.NotificationService.Singleton.onNotificationCreated.addEventListener(notificationCreated);
			Extension.NotificationService.Singleton.onNotificationClosed.addEventListener(notificationClosed);

			Extension.NotificationService.Singleton.getNotifications().then(notifications => {
				notifications.forEach(notificationCreated);
			}).catch(console.error);			
		});

		let showNotificationsMessenger = new Extension.Messaging(Extension.Singleton, `notificationStream.showNotifications`, messageData => {
			toggleStreams();
			if (!notificationView.is(":visible")) {
				$("#nav-ns-icon")[0].click();
			}

			return Promise.resolve({});
		});
	}

	$(init);

	return {};
})();


// WebGL3D
