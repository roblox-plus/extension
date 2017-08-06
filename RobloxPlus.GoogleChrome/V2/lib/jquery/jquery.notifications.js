/*
	jquery.notifications.js [7/29/2017]
	
	creationDetails: {
		tag: "unique id",
		title: "Notification title" || ext.manifest.name,
		message: "Hard text message" || "",
		context: "Lite text message" || "",
		icon: "url to icon" || ext.manifest.icons['48'],
		items: {
			"Title": "message"
		} || {},
		"buttons": [
			"Button with text"
		] || [],
		clickable: false,
		metadata: {} // custom data
	}
	
	notification: {
		tag: creationData.tag || "generated",
		title: creationData.title || ext.manifest.manifest,
		message: creationData.message || "",
		context: creationData.context || "",
		icon: creationData.icon || ext.manifest.icons['48'],
		clickable: creationData.clickable,
		items: creationData.items || {},
		buttons: creationData.buttons || [],
		metadata: creationData.metadata || {},
		created: +new Date,

		click: function(),
		buttonClick: function(int buttonId),
		close: function(),
		on: function(event, callBack(args)),
		trigger: function(event, args)
	}
	
	Example:
	// For onCreated, and all events 'this' refers to notification model specified above.
	$.notification(string title || details, onCreated()).click(function(){
	}).buttonClick(function(index, tabId){
		
	}).close(function(tabId){
		
	}).on("click", function(tabId){
		// Same as .click
	});
*/
$.notification = (function () {
	var generateTagId = 0;
	var initData = ["tag", "title", "message", "context", "icon", "clickable", "items", "buttons", "metadata"];
	var namespace = "$.notification.";
	var notifications = {};
	var self;


	function createResponseNotification(data) {
		var notification = $.addTrigger({
			tag: "",
			title: "",
			message: "",
			context: "",
			icon: "",
			clickable: false,
			items: {},
			buttons: [],
			metadata: {},
			raw: {},

			setData: function (data) {
				this.raw = data;
				var note = this;
				initData.forEach(function (field) {
					if (data.hasOwnProperty(field)) {
						note[field] = data[field];
					}
				});
			},

			click: function (callBack) {
				if (callBack) {
					this.on("click", callBack);
				} else {
					ipc.send(namespace + "internalClick", { tag: this.tag });
				}
				return this;
			},
			buttonClick: function (index) {
				if (typeof(index) === "function") {
					this.on("buttonClick", index);
				} else {
					ipc.send(namespace + "internalButtonClick", { tag: this.tag, index: index });
				}
				return this;
			},
			close: function (callBack) {
				if (callBack) {
					this.on("close", callBack);
				} else {
					ipc.send(namespace + "internalClose", { tag: this.tag });
				}
				return this;
			}
		});

		if (typeof (data) === "string") {
			notification.tag = data;
		} else if (data) {
			notification.setData(data);
		}

		return notification;
	}

	function broadcast(event, data) {
		ipc.send(event, data, function () { }, 0);
		for (var tabId in ext.tabs) {
			ipc.send(event, data, function () { }, tabId);
		}
	}


	ipc.on(namespace + "create", function (data, callBack, senderTabId) {
		if (typeof (data.tag) !== "string") {
			data.tag = namespace + (++generateTagId);
		}

		var creationJson = {
			title: data.hasOwnProperty("title") ? data.title : ext.manifest.name,
			iconUrl: data.hasOwnProperty("icon") ? data.icon : ext.getUrl(ext.manifest.icons['48']),
			message: data.hasOwnProperty("message") ? data.message : "",
			contextMessage: data.hasOwnProperty("context") ? data.context : "",
			isClickable: !!data.clickable,
			priority: 2
		};
		var responseJson = {
			tag: data.tag,
			title: creationJson.title,
			message: creationJson.message,
			context: creationJson.contextMessage,
			icon: creationJson.iconUrl,
			clickable: creationJson.isClickable,
			items: {},
			buttons: [],
			metadata: typeof (data.metadata) === "object" ? data.metadata : {},
			created: +new Date
		};

		if (data.hasOwnProperty("items")) {
			responseJson.items = data.items;
			creationJson.items = [];
			for (var n in data.items) {
				creationJson.items.push({
					title: n,
					message: data.items[n]
				});
			}
			if (creationJson.items.length) {
				creationJson.type = "list";
			} else {
				creationJson.type = "basic";
			}
		} else {
			creationJson.type = "basic";
		}

		if (data.requireInteraction && (
			brower.name == "Chrome" && browser.wholeVersion >= 50
		)) {
			creationJson.requireInteraction = true;
		}

		if (data.hasOwnProperty("buttons") && data.buttons.length > 0) {
			creationJson.buttons = [];
			for (var n = 0; n < 2; n++) {
				var button = data.buttons[n];
				if (!button) {
					break;
				} else if (typeof (button) === "string") {
					creationJson.buttons.push({
						title: button
					});
					responseJson.buttons.push(button);
				} else {
					creationJson.buttons.push({
						title: button.text,
						iconUrl: button.icon
					});
					responseJson.buttons.push(button.text);
				}
			}
		}

		chrome.notifications.create(data.tag, creationJson, function (id) {
			callBack(responseJson);
			broadcast(namespace + "created", responseJson);
		});
	}).on(namespace + "created", function (data, callBack) {
		if (!notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag] = createResponseNotification(data);
		}
		self.trigger("notification", notifications[data.tag], false);
	}).on(namespace + "closed", function (data, callBack) {
		if (notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag].trigger("close", data.tabId);
			self.trigger("close", notifications[data.tag]);
			delete notifications[data.tag];
		}
	}).on(namespace + "clicked", function (data, callBack) {
		if (notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag].trigger("click", data.tabId);
			self.trigger("click", notifications[data.tag]);
		}
	}).on(namespace + "buttonClicked", function (data, callBack) {
		if (notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag].trigger("buttonClick", data.index, data.tabId);
			self.trigger("buttonClick", notifications[data.tag], data.index);
		}
	});


	if (ext.isBackground) {
		function onClosed(tag, explicit, tabId) {
			if (notifications.hasOwnProperty(tag) && explicit) {
				broadcast(namespace + "closed", { tag: tag, tabId: tabId });
			}
		}

		function onClicked(tag, tabId) {
			if (notifications.hasOwnProperty(tag)) {
				broadcast(namespace + "clicked", { tag: tag, tabId: tabId });
			}
		}

		function onButtonClicked(tag, index, tabId) {
			if (notifications.hasOwnProperty(tag) && notifications[tag].buttons[index]) {
				broadcast(namespace + "buttonClicked", { tag: tag, index: index, tabId: tabId });
			}
		}

		chrome.notifications.onClosed.addListener(function (tag, explicit) {
			onClosed(tag, explicit, 0);
		});
		chrome.notifications.onClicked.addListener(function (tag) {
			onClicked(tag, 0);
		});
		chrome.notifications.onButtonClicked.addListener(function (tag, index) {
			onButtonClicked(tag, index, 0);
		});

		ipc.on(namespace + "internalClose", function (data, callBack, tabId) {
			onClosed(data.tag, true, tabId);
			chrome.notifications.clear(data.tag);
		}).on(namespace + "internalClick", function (data, callBack, tabId) {
			onClicked(data.tag, tabId);
		}).on(namespace + "internalButtonClick", function (data, callBack, tabId) {
			onButtonClicked(data.tag, data.index, tabId);
		}).on(namespace + "getNotifications", function (data, callBack) {
			var response = [];
			for (var n in notifications) {
				response.push(notifications[n].raw);
			}
			response.sort(function (a, b) {
				return a.created - b.created;
			});
			callBack(response);
		}).on(namespace + "clear", function (data, callBack) {
			for (var n in notifications) {
				notifications[n].close();
			}
		});
	}


	self = $.addTrigger(function (data, callBack) {
		var noteData = {};
		if (typeof (data) === "string") {
			noteData = {
				title: data
			};
		} else {
			noteData = {};
			initData.forEach(function (field) {
				if (data.hasOwnProperty(field)) {
					noteData[field] = data[field];
				}
			});
		}

		if (data.tag && notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag].close();
		}

		var responseNotification = createResponseNotification();

		ipc.send(namespace + "create", noteData, function (note) {
			responseNotification.setData(note);
			notifications[note.tag] = responseNotification;
			if (callBack) {
				callBack(responseNotification);
			}
		});

		return responseNotification;
	});

	self.init = function () {
		if (!ext.isBackground) {
			ipc.send(namespace + "getNotifications", {}, function (notes) {
				notes.forEach(function (data) {
					notifications[data.tag] = createResponseNotification(data);
					self.trigger("notification", notifications[data.tag], true);
				});
			});
		}
	};

	self.clear = function () {
		ipc.send(namespace + "clear", {}, function () { });
	};

	self.getNotifications = function () {
		return notifications;
	};

	return self;
})();


// WebGL3D
