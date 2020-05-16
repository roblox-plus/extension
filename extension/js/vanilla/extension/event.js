Extension.Event = class {
	constructor(eventName, extension) {
		this.name = eventName;
		this.extension = extension || Extension.Singleton;
		this.eventMessenger = new Extension.Messaging(this.extension, `Extension.Event.${eventName}`, this.handleEvent.bind(this));
		this._callbacks = [];
	}

	handleEvent(message) {
		this._callbacks.forEach(callback => {
			try {
				callback(message.data);
			} catch (e) {
				console.error(e);
			}
		});

		return Promise.resolve({
			tabId: this.eventMessenger.tabId,
			callbacks: this._callbacks.length
		});
	}

	addEventListener(callback) {
		if (!this._callbacks.includes(callback)) {
			this._callbacks.push(callback);
		}
	}

	removeEventListener(callback) {
		let callbackIndex = this._callbacks.indexOf(callback);
		if (callbackIndex >= 0) {
			this._callbacks.splice(callbackIndex, 1);
		}
	}

	dispatchEvent(eventData) {
		if (this.extension.executionContextType === Extension.ExecutionContextTypes.background) {
			return new Promise((resolve, reject) => {
				let promises = [
					this.eventMessenger.sendMessage(eventData)
				];
		
				this.eventMessenger.getAllTabIds().then(tabIds => {
					tabIds.forEach(tabId => {
						promises.push(this.eventMessenger.sendMessage(eventData, tabId));
					});

					Promise.all(promises).then(resolve).catch(reject);
				}).catch(reject);
			});
		} else {
			return Promise.reject("Extension.Event can only be dispatched from a background script.");
		}
	}
}
