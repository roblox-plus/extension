/*
	content/notificationStream.js [07/28/2017]
*/
var RPlus = RPlus || {};
RPlus.notificationStream = RPlus.notificationStream || (function () {
	var customStreamDiv, streamContainer, buttonContainer;

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
		var container = $("<div class=\"notificaiton-item-content\">");
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

		if (notification.clickable) {
			card.addClass("clickable");
			innerCard.removeAttr("disabled");
		}

		innerCard.click(function (e) {
			if (e.target === closeButton[0]) {
				notification.close();
				return false;
			}
		});

		innerCard.append(imageContainer, contentContainer, closeButton);
		card.append(innerCard);

		return card.hide();
	}

	function pushNotification(data) {
		var notification = createNotificationCard(data);
		customStreamDiv.prepend(notification);
		notification.slideDown();
		return notification;
	}

	function toggleStreams() {
		if ($(this).hasClass("text-link")) {
			var thisStream = $(this).data("extension-stream");
			streamContainer.find("ul[data-extension-stream][data-extension-stream != '" + thisStream + "']").fadeOut();
			streamContainer.find("ul[data-extension-stream][data-extension-stream = '" + thisStream + "']").fadeIn();
			buttonContainer.find(">span[data-extension-stream]").addClass("text-link");
			$(this).removeClass("text-link");
		}
	}

	function init() {
		customStreamDiv = $("<ul class=\"rplus-stream-list notification-stream-list\">").attr("data-extension-stream", ext.id).hide();
		var robloxStreamDiv = $(".notification-stream-list").attr("data-extension-stream", "roblox");
		var robloxNotificationsButton = $(".notification-stream-header > span").attr("data-extension-stream", "roblox");
		var customNotificationsButton = $("<span class=\"text-label small text-link\">").attr("data-extension-stream", ext.id).text(ext.manifest.name);
		streamContainer = robloxStreamDiv.parent();
		buttonContainer = robloxNotificationsButton.parent();

		buttonContainer.on("click", "span[data-extension-stream]", toggleStreams);

		robloxStreamDiv.after(customStreamDiv);
		robloxNotificationsButton.after(customNotificationsButton);

		$.notification.on("notification", function (notification) {
			var card = pushNotification(notification);

			card.click(function () {
				notification.click();
			});

			notification.close(function () {
				card.slideUp(function () {
					card.remove();
				});
			});
		});

		$.notification.init();

		ipc.on("rplus:showNotifications", function (data, callBack) {
			customNotificationsButton.click();
			if (!streamContainer.is(":visible")) {
				$("#nav-ns-icon")[0].click();
			}
		});
	}

	$(init);

	return {
		push: pushNotification
	};
})();


// WebGL3D
