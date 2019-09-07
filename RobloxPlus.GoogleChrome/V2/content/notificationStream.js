/*
	content/notificationStream.js [07/28/2017]
*/
var RPlus = RPlus || {};
RPlus.notificationStream = RPlus.notificationStream || (function () {
	var selectedNotificationStream = "";

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

	function pushNotification(customStreamDiv, data) {
		var notification = createNotificationCard(data);
		customStreamDiv.prepend(notification);
		notification.slideDown();
		return notification;
	}

	function toggleStreams() {
		selectedNotificationStream = selectedNotificationStream === ext.id ? "roblox" : ext.id;
		$("ul[data-extension-stream][data-extension-stream != '" + selectedNotificationStream + "']").fadeOut();
		$("ul[data-extension-stream][data-extension-stream = '" + selectedNotificationStream + "']").fadeIn();
	}

	function init() {
		var notificationView = $(".notification-content-view").each(function () {
			var customStreamDiv = $("<ul class=\"rplus-stream-list notification-stream-list\">").attr("data-extension-stream", ext.id).hide();
			var robloxStreamDiv = $(this).find(".notification-stream-list").attr("data-extension-stream", "roblox");
			
			robloxStreamDiv.after(customStreamDiv);

			$.notification.on("notification", function (notification) {
				var card = pushNotification(customStreamDiv, notification);

				card.click(function () {
					notification.click();
				});

				notification.close(function () {
					card.slideUp(function () {
						card.remove();
					});
				});
			});
			
		});

		ipc.on("rplus:showNotifications", function (data, callBack) {
			toggleStreams();
			if (!notificationView.is(":visible")) {
				$("#nav-ns-icon")[0].click();
			}
		});

		$.notification.init();
	}

	$(init);

	return {};
})();


// WebGL3D
