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
		if (!elements.robloxNotificationStreamContainer) {
			return;
		}

		let hideStream = elements.customNotificationStreamContainer;
		let showStream = elements.robloxNotificationStreamContainer;
		if (elements.robloxVisible) {
			let newShowStream = hideStream;
			hideStream = showStream;
			showStream = newShowStream;
		}

		elements.robloxVisible = !elements.robloxVisible;
		hideStream.fadeOut();
		showStream.fadeIn();

		if (!elements.notificationStream.is(":visible")) {
			$("#nav-ns-icon")[0].click();
		}
	};

	const init = function() {
		elements.notificationStream = $(".notification-content-view:not(.ng-hide) .notification-stream-body .notification-stream-data");
		elements.robloxNotificationStreamContainer = elements.notificationStream.find(".notification-stream-list");
		elements.robloxNotificationStreamContainer.after(elements.customNotificationStreamContainer);
		
		let notificationStreamWidget = React.createElement(NotificationStreamWidget, {});
		ReactDOM.render(notificationStreamWidget, elements.customNotificationStreamContainer[0]);
	};

	let showNotificationsMessenger = new Extension.Messaging(Extension.Singleton, `notificationStream.showNotifications`, messageData => {
		toggleStreams();
		return Promise.resolve({});
	});

	$(init);

	return {
		messenger: showNotificationsMessenger,
		toggleStreams: toggleStreams
	};
})();


// WebGL3D
