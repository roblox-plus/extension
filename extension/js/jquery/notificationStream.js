/*
	content/notificationStream.js [07/28/2017]
*/
var RPlus = RPlus || {};
RPlus.notificationStream = RPlus.notificationStream || (function () {
	let elements = {
		robloxVisible: true,
		notificationStream: null,
		robloxNotificationStreamContainer: null,
		customNotificationStreamContainer: $("<div>").hide()
	};

	const toggleStreams = function() {
		elements.robloxVisible = !elements.robloxVisible;

		if (!elements.notificationStream || !elements.notificationStream.is(":visible")) {
			$("#nav-ns-icon")[0].click();
		}
	};

	const setStreamVisibility = function(streamContainer, visible) {
		if (!streamContainer.is(":visible") && visible) {
			streamContainer.fadeIn();
		} else if (streamContainer.is(":visible") && !visible) {
			streamContainer.fadeOut();
		}
	};

	const init = function() {
		let notificationStreamWidget = React.createElement(NotificationStreamWidget, {});
		ReactDOM.render(notificationStreamWidget, elements.customNotificationStreamContainer[0]);
	};

	let showNotificationsMessenger = new Extension.Messaging(Extension.Singleton, `notificationStream.showNotifications`, messageData => {
		toggleStreams();
		return Promise.resolve({});
	});

	setInterval(() => {
		let notificationStream = $(".notification-content-view:not(.ng-hide) .notification-stream-body .notification-stream-data");
		if (notificationStream.length > 0) {
			elements.notificationStream = notificationStream;
		} else {
			elements.notificationStream = null;
			return;
		}

		let robloxNotificationStreamContainer = notificationStream.find(".notification-stream-list:not(.rplus-notification-stream)");
		if (robloxNotificationStreamContainer.length > 0) {
			elements.robloxNotificationStreamContainer = robloxNotificationStreamContainer;
		} else {
			elements.robloxNotificationStreamContainer = null;
			return;
		}

		if (!robloxNotificationStreamContainer.parent()[0].contains(elements.customNotificationStreamContainer[0])) {
			robloxNotificationStreamContainer.after(elements.customNotificationStreamContainer);
		}

		setStreamVisibility(elements.customNotificationStreamContainer, !elements.robloxVisible);
		setStreamVisibility(robloxNotificationStreamContainer, elements.robloxVisible);
	}, 250);

	$(init);

	return {
		elements: elements,
		messenger: showNotificationsMessenger,
		toggleStreams: toggleStreams
	};
})();


// WebGL3D
