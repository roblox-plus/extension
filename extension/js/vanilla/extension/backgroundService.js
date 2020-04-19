Extension.BackgroundService = class {
	constructor(serviceId) {
		this.extension = Extension.Singleton;
		this.serviceId = serviceId;
		this.promiseMessenger = new Extension.Messaging(this.extension, `Extension.BackgroundService.${serviceId}`, this.handlePromise.bind(this));
		this._registry = {};
	}

	handlePromise(messageData) {
		return new Promise((resolve, reject) => {
			this._registry[messageData.data.method].apply(this, messageData.data.arguments).then(resolve).catch(reject);
		});
	}
	
	register(methods) {
		methods.forEach((method) => {
			let service = this;
			this._registry[method.name] = method;

			if (this.extension.executionContextType === Extension.ExecutionContextTypes.background) {
				return;
			}

			this[method.name] = function() {
				let args = [];
				for (let i = 0; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				
				try {
					return service.promiseMessenger.sendMessage({
						method: method.name,
						arguments: args
					});
				} catch (e) {
					console.error(`${this.serviceId}.${method}`, e);
				}
			};
		});
	}
};
