Extension.Messaging = class {
	constructor(extension, id, messageHandler) {
		this.id = `Extension.Messaging_${extension.id}_${id}`;
		this.messageHandler = messageHandler;
		this.extension = extension;
		this.tabId = null;
		this.ready = id === Extension.Messaging.Constants.RegistrarId || extension.executionContextType === Extension.ExecutionContextTypes.background;
		this.disconnected = false;
		this.queue = [];
		
		Extension.Messaging.Registry[this.id] = this;

		if (extension.executionContextType !== Extension.ExecutionContextTypes.background) {
			let getTabId = this.sendMessage.bind(this);
			if (id !== Extension.Messaging.Constants.RegistrarId) {
				getTabId = Extension.Messaging.Registrar.sendMessage.bind(Extension.Messaging.Registrar);
			}

			getTabId({}).then(this._tabIdLoaded.bind(this)).catch(this._tabIdLoadError.bind(this));
		}
	}

	handleMessage(messageData) {
		return this.messageHandler(messageData);
	}

	handleResponse(resolve, reject, response) {
		if (typeof(response) !== "object") {
			reject([
				Extension.Messaging.Constants.Errors.invalidResponseFormat
			]);
			return;
		}

		if (response.hasOwnProperty("resolve")) {
			resolve(response.resolve);
		} else if (response.hasOwnProperty("reject")) {
			reject(response.reject);
		} else {
			reject([
				Extension.Messaging.Constants.Errors.invalidResponseData
			]);
		}
	}

	sendMessage(messageData, tabId) {
		return new Promise((resolve, reject) => {
			if (this.disconnected) {
				this.handleResponse(resolve, reject, {
					reject: [
						Extension.Messaging.Constants.Errors.disconnected
					]
				});

				return;
			}

			if (!this.ready) {
				this.queue.push({
					messageData: messageData,
					tabId: tabId,
					resolve: resolve,
					reject: reject
				});

				return;
			}
			
			if (tabId === this.tabId || (this.extension.executionContextType === Extension.ExecutionContextTypes.background && !tabId)) {
				// Message data is stringified and parsed to avoid handlers corrupting the original object
				// if it was passed from background <-> tab it wouldn't be the same object, so don't treat it as the same object if it's within the same context for consistency
				this.handleMessage({
					data: JSON.parse(JSON.stringify(messageData)),
					tab: {
						id: this.tabId
					}
				}).then(response => {
					this.handleResponse(resolve, reject, {
						resolve: JSON.parse(JSON.stringify(response))
					});
				}).catch(response => {
					this.handleResponse(resolve, reject, {
						reject: JSON.parse(JSON.stringify(response))
					});
				});
			} else if (tabId) {
				chrome.tabs.sendMessage(tabId, {
					messagingId: this.id,
					data: messageData
				}, this.handleResponse.bind(this, resolve, reject));
			} else {
				try {
					chrome.runtime.sendMessage({
						messagingId: this.id,
						data: messageData
					}, this.handleResponse.bind(this, resolve, reject));
				} catch (e) {
					this.handleResponse(resolve, reject, {
						reject: [
							Extension.Messaging.Constants.Errors.disconnected
						]
					});
				}
			}
		});
	}

	_tabIdLoaded(tabId) {
		this.tabId = tabId;
		this.ready = true;

		while (this.queue.length > 0) {
			let queuedMessage = this.queue.shift();
			this.sendMessage(queuedMessage.messageData, queuedMessage.tabId).then(queuedMessage.resolve).catch(queuedMessage.reject);
		}
	}

	_tabIdLoadError(err) {
		this.disconnected = true;
		
		console.warn(`Failed to load tab id for Extension.Messaging (${this.id})\n${err}`);
		while (this.queue.length > 0) {
			let queuedMessage = this.queue.shift();
			this.handleResponse(queuedMessage.resolve, queuedMessage.reject, {
				reject: [
					Extension.Messaging.Constants.Errors.disconnected
				]
			});
		}
	}
};

Extension.Messaging.Registry = {};
Extension.Messaging.Constants = {
	RegistrarId: "Extension.Messaging.Registrar",
	Errors: {
		disconnected: {
			code: -1001,
			message: `Tab has been disconnected from (${Extension.Singleton.name}) background page.\n\tRefresh the tab to reconnect.`
		},
		invalidResponseData: {
			code: -1002,
			message: `Response format was invalid (no expected promise properties)`
		},
		invalidResponseFormat: {
			code: -1003,
			message: `Response format was invalid (expected object)`
		},
		unregisteredReceiver: {
			code: -1004,
			message: "Message receiver not registered."
		}
	}
};

Extension.Messaging.Registrar = new Extension.Messaging(Extension.Singleton, Extension.Messaging.Constants.RegistrarId, function(messageData) {
	return new Promise((resolve, reject) => {
		resolve(messageData.tab.id);
	});
});

chrome.runtime.onMessage.addListener((data, sender, callBack) => {
	if (sender.id !== Extension.Singleton.id || typeof(data) !== "object" || !data.messagingId) {
		return;
	}

	let messagingInstance = Extension.Messaging.Registry[data.messagingId];
	if (!messagingInstance) {
		console.warn(`Received message for unregistered id: ${data.messagingId}`);

		callBack({
			reject: [
				Extension.Messaging.Constants.Errors.unregisteredReceiver
			]
		});

		return;
	}

	messagingInstance.handleMessage({
		data: data.data,
		tab: sender.tab
	}).then((result) => {
		callBack({
			resolve: result
		});
	}).catch((err) => {
		callBack({
			reject: err
		});
	});

	// Required for asynchronous callbacks
	// https://stackoverflow.com/a/20077854/1663648
	return true;
});
