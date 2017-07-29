/*
	jquery.notifications.js [10/08/2016]
	
	details: {
		title: "Notification title" || ext.manifest.name,
		message: "Hard text message" || "",
		context: "Lite text message" || "",
		icon: "url to icon" || ext.manifest.icons['48'],
		items: {
			"Title": "message"
		} || undefined,
		image: "image url" || undefined,
		progress: 50 || undefined,
		buttons: [
			"Button with text",
			{ "text": "Button with text and icon", "icon": "icon url" }
		],
		clickable: false,
		tag: "unique id"
	}
	
	creationDetails: {
		"title": details.title,
		"message": details.message,
		"context": details.contextMessage,
		"iconUrl": details.icon,
		"items": [
			{
				"title": "item index",
				"message": "item value"
			}
		],
		"imageUrl": details.image,
		"progress": details.progress,
		"buttons": [
			{
				"title": "Text",
				"iconUrl": "Icon"
			}
		],
		isClickable: details.clickable
	}
	
	notification: {
		details: details, // User specified details
		creationDetails: creationDetails, // Actual creation details
		click: function(),
		buttonClick: function(int buttonId),
		close: function(),
		on: function(event, callBack(args)),
		trigger: function(event, args)
	}
	
	Example:
	// For onCreated, and all events 'this' refers to notification model specified above.
	$.notification(string title || details, onCreated()).click(function(){
	}).buttonClick(function(buttonId){
	}).close(function(){
		
	}).on("click", function(){
		// Same as .click
	});
*/
$.notificationV2 = (function () {
	var generateTagId = 0;
	var initData = ["tag", "title", "message", "context", "icon", "clickable", "items", "buttons", "metadata"];
	var namespace = "$.notificationV2.";
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
			data.tag = (++generateTagId).toString();
		}

		var creationJson = {
			title: data.hasOwnProperty("title") ? data.title : ext.manifest.name,
			iconUrl: data.hasOwnProperty("icon") ? data.icon : ext.getUrl(ext.manifest.icons['48']),
			message: data.hasOwnProperty("message") ? data.message : "",
			contextMessage: data.hasOwnProperty("context") ? data.context : "",
			isClickable: !!data.clickable
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
			creationJson.type = "list";
			creationJson.items = [];
			for (var n in data.items) {
				creationJson.items.push({
					title: n,
					message: data.items[n]
				});
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
			notifications[data.tag].trigger("close");
			self.trigger("close", notifications[data.tag]);
			delete notifications[data.tag];
		}
	}).on(namespace + "clicked", function (data, callBack) {
		if (notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag].trigger("click");
			self.trigger("click", notifications[data.tag]);
		}
	}).on(namespace + "buttonClicked", function (data, callBack) {
		if (notifications.hasOwnProperty(data.tag)) {
			notifications[data.tag].trigger("buttonClick", data.index);
			self.trigger("buttonClick", notifications[data.tag], data.index);
		}
	});


	if (ext.isBackground) {
		function onClosed(tag, explicit) {
			if (notifications.hasOwnProperty(tag) && explicit) {
				broadcast(namespace + "closed", { tag: tag });
			}
		}

		function onClicked(tag) {
			if (notifications.hasOwnProperty(tag)) {
				broadcast(namespace + "clicked", { tag: tag });
			}
		}

		function onButtonClicked(tag, index) {
			if (notifications.hasOwnProperty(tag) && notifications[tag].buttons[index]) {
				broadcast(namespace + "buttonClicked", { tag: tag, index: index });
			}
		}

		chrome.notifications.onClosed.addListener(onClosed);
		chrome.notifications.onClicked.addListener(onClicked);
		chrome.notifications.onButtonClicked.addListener(onButtonClicked);

		ipc.on(namespace + "internalClose", function (data) {
			onClosed(data.tag, true);
		}).on(namespace + "internalClick", function (data) {
			onClicked(data.tag);
		}).on(namespace + "internalButtonClick", function (data) {
			onButtonClicked(data.tag, data.index);
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

		var responseNotification = createResponseNotification();

		ipc.send(namespace + "create", noteData, function (note) {
			responseNotification.setData(note);
			notifications[note.tag] = responseNotification;
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

	return self;
})();

(function(){
	var generateTagId = 0;
	var updateFields = {
		"title": "title",
		"message": "message",
		"context": "contextMessage",
		"icon": "iconUrl",
		"clickable": "isClickable",
		"image": "imageUrl",
		"items": "list",
		"progress": "progress",
		"buttons": "buttons"
	};
	
	var parsedNotifications = {};
	var rawNotifications = {};
	
	var internalBroadcaster = $.addTrigger({}, "$.notification.internal");
	
	
	
	function parseNotification(note){
		var details = note.details;
		
		note = $.addTrigger(note);
		note.details = details;
		(["click", "close", "buttonClick"]).forEach(function(event){
			note[event] = function(arg){
				if(typeof(arg) == "function"){
					return note.on(event, arg);
				}else{
					$.notification.broadcast(event, note, arg);
					return note;
				}
			};
		});
		
		for(var n in updateFields){
			(function(detailField, creationField){
				note[detailField] = function(arg){
					if(typeof(arg) == "function"){
						arg.apply(note, note.creationDetails[creationField]);
						return note.creationDetails[creationField];
					}else{
					}
				};
			})(n, updateFields[n]);
		}
		Object.keys(updateFields).forEach(function(property){
			note[property] = function(arg){
				if(typeof(arg) == "function"){
					arg(note.creationDetails[property]);
				}else{
					var update = {};
					update[property] = arg;
					internalBroadcaster.broadcast("$.notification.update", details.tag, update);
				}
			};
		});
		
		return parsedNotifications[details.tag] = note;
	}
	
	
	$.notification = $.addTrigger(function(details, callBack){
		callBack = typeof(callBack) == "function" ? callBack : function(){};
		
		if(typeof(details) == "string"){
			return $.notification({
				title: details
			}, callBack);
		}else if(typeof(details) != "object"){
			callBack.apply(undefined);
			return;
		}
		
		if(!details.hasOwnProperty("tag")){
			details.tag = +new Date + "_" + ++generateTagId;
		}
		
		
		var creationDetails = {};
		var notification = parseNotification({ details: details, creationDetails: creationDetails }, true);

		ipc.send("$.notification.create", { details: details }, function (data) {
			if (data) {
				notification.details = data.details;
				for (var n in data.creationDetails) {
					creationDetails[n] = data.creationDetails[n];
				}
				callBack.apply(notification);
			} else {
				notification.trigger.disconnect();
			}
		});
		
		return notification;
	}, "$.notification");
	
	$.notification.trigger.useFirstArgumentAsThisEnabled = true;
	
	
	$.notification.get = function(tag, callBack){
		callBack = callBack || function(){};
		if(parsedNotifications[tag]){
			callBack.apply(parsedNotifications[tag]);
			return parsedNotifications[tag];
		}
		
		var creationDetails = {};
		var details = {};
		var notification = parseNotification({ details: details, creationDetails: creationDetails });

		ipc.send("$.notification.get", { tag: tag }, function (data) {
			if (tag) {
				for (var n in data.details) {
					details[n] = data.details[n];
				}
				for (var n in data.creationDetails) {
					creationDetails[n] = data.creationDetails[n];
				}
				callBack.apply(notification);
			} else {
				notification.trigger.disconnect();
			}
		});

		return notification;
	};
	
	$.notification.clear = ipc.backgroundFunction("$.notification.clear", function(){
		for(var n in rawNotifications){
			if(browser.name == "Chrome"){
				chrome.notifications.clear(n, function(){});
			}
			$.notification.broadcast("close", rawNotifications[n]);
		}
	});
	
	
	
	$.notification.trigger.before("click", function(notificationData){
		return [ parsedNotifications[notificationData.details.tag] || parseNotification(notificationData) ];
	});
	
	$.notification.trigger.before("close", function(notificationData){
		return [ parsedNotifications[notificationData.details.tag] || parseNotification(notificationData) ];
	});
	
	$.notification.trigger.before("buttonClick", function(notificationData, buttonId){
		return [ parsedNotifications[notificationData.details.tag] || parseNotification(notificationData), buttonId ];
	});
	
	(["click", "close", "buttonClick"]).forEach(function(event){
		$.notification.on(event, function(){
			if(parsedNotifications[this.details.tag]){
				parsedNotifications[this.details.tag].trigger.apply(this, global.parseArguments(arguments, 0, [ event ]));
			}
		});
	});
	
	$.notification.on("close", function(){
		delete parsedNotifications[this.details.tag];
	});
	
	
	if (ext.isBackground) {
		ipc.on("$.notification.create", function (data, callBack) {
			var details = data.details;
			var note = {
				title: details.hasOwnProperty("title") ? details.title : ext.manifest.name,
				iconUrl: details.hasOwnProperty("icon") ? details.icon : ext.manifest.icons['48'],
				message: details.hasOwnProperty("message") ? details.message : "",
				contextMessage: details.hasOwnProperty("context") ? details.context : "",
				//appIconMaskUrl: ext.getUrl("/images/icons/appIcon.png"),
				isClickable: !!details.clickable
			};
			
			if(details.hasOwnProperty("image")){
				note.type = "image";
				note.imageUrl = details.image;
			}else if(details.hasOwnProperty("progress")){
				note.type = "progress";
				note.progress = Math.min(100, Math.max(0, Math.floor(details.progress + .5)));
			}else if(details.hasOwnProperty("items")){
				note.type = "list";
				note.items = [];
				for(var n in details.items){
					note.items.push({
						title: n,
						message: details.items[n]
					});
				}
			}else{
				note.type = "basic";
			}
			
			if(details.requireInteraction && (
				brower.name == "Chrome" && browser.wholeVersion >= 50
			)){
				note.requireInteraction = true;
			}
			
			if(details.hasOwnProperty("buttons") && details.buttons.length > 0){
				note.buttons = [];
				for(var n = 0; n < 2; n++){
					var button = details.buttons[n];
					if(!button){
						break;
					}else if(typeof(button) == "string"){
						note.buttons.push({
							title: button
						});
					}else{
						note.buttons.push({
							title: button.text,
							iconUrl: button.icon
						});
					}
				}
			}
			
			data = { creationDetails: note, details: details };
			$.notification.trigger("beforeCreate", data);
			
			function tryCreate(){
				try{
					if(browser.name == "Chrome"){
						chrome.notifications.create(details.tag, note, function(id){
							rawNotifications[id] = data;
							$.notification.trigger("afterCreate", data);
							callBack(data);
						});
					}else{
						callBack();
					}
				}catch(e){
					callBack();
				}
			}
			
			if(rawNotifications[details.tag]){
				if(browser.name == "Chrome"){
					chrome.notifications.clear(details.tag, tryCreate);
				}else{
					tryCreate();
				}
			}else{
				tryCreate();
			}
		});
		
		
		if(browser.name == "Chrome"){
			chrome.notifications.onClicked.addListener(function (id) {
				if (!rawNotifications.hasOwnProperty(id)) {
					return;
				}
				$.notification.broadcast("click", rawNotifications[id]);
			});
			
			chrome.notifications.onButtonClicked.addListener(function (id, buttonId) {
				if (!rawNotifications.hasOwnProperty(id)) {
					return;
				}
				$.notification.broadcast("buttonClick", rawNotifications[id], buttonId + 1);
			});
			
			chrome.notifications.onClosed.addListener(function (id, userClosed) {
				if (!rawNotifications.hasOwnProperty(id)) {
					return;
				}
				if(userClosed){
					$.notification.broadcast("close", rawNotifications[id]);
				}
			});
		}
		
		
		$.notification.on("close", function(){
			if(browser.name == "Chrome"){
				chrome.notifications.clear(this.details.tag, function(){});
			}
			delete rawNotifications[this.details.tag];
		});
	}else{
		$(window).on("unload", function(){
			for(var n in parsedNotifications){
				parsedNotifications[n].close();
			}
		});
	}
	
	
	internalBroadcaster.on("$.notification.update", function(tag, data){
		var rawNote = rawNotifications[tag = (tag || "")];
		if(!rawNote){
			return;
		}
			
		var updateDetails = {};
		var detailUpdates = {};
		for(var n in updateFields){
			if(data.hasOwnProperty(n)){
				updateDetails[updateFields[n]] = data[n];
				detailUpdates[n] = data[n];
				
				if(parsedNotifications[tag]){
					parsedNotifications[tag].creationDetails[updateFields[n]] = data[n];
					parsedNotifications[tag].details[n] = data[n];
				}
			}
		}
		
		if(Object.keys(updateDetails).length && ext.isBackground){
			if(browser.name == "Chrome"){
				chrome.notifications.update(tag, updateDetails, function(){});
			}
		}
	});
})();






// WebGL3D
