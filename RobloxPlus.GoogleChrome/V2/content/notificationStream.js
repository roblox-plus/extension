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

	function createNotificationContentContainer(title, context) {
		var container = $("<div class=\"notificaiton-item-content\">");
		var innerContainer = $("<div class=\"notification-data-container\">");

		var titleContainer = $("<div class=\"small notification-display-text\">").text(title);
		var contextContainer = $("<div class=\"text-date-hint\">").text(context);

		container.append(innerContainer.append(titleContainer, contextContainer));
		return container;
	}

	function createNotificationCard(icon, title, context, link) {
		var card = $("<li class=\"notification-stream-item clickable unInteracted\">");
		var innerCard = $("<a class=\"notification-item\">").attr("href", link || "javascript:/* Roblox+ */");
		var imageContainer = createNotificationImageContainer(icon, "", link);
		var contentContainer = createNotificationContentContainer(title, context);

		innerCard.append(imageContainer, contentContainer);
		card.append(innerCard);

		return card.hide();
	}

	function pushNotification(icon, title, context, link) {
		var notification = createNotificationCard(icon, title, context, link);
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

		$.notificationV2.on("notification", function (notification) {
			var card = pushNotification(notification.icon, notification.title, notification.context, notification.metadata.url);

			card.click(function () {
				notification.click();
			});

			notification.close(function () {
				card.slideUp(function () {
					card.remove();
				});
			});
		});

		$.notificationV2.init();
	}

	$(init);

	return {
		push: pushNotification
	};
})();


// WebGL3D
