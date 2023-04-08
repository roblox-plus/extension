Extension.Storage = class extends Extension.BackgroundService {
	constructor() {
		super("Extension.Storage");

		this.register([
			this.get,
			this.set,
			this.remove
		]);
	}

	get(key) {
		return new Promise((resolve, reject) => {
			let value = null;
			try {
				const proposedValue = this.getSync(key);
				if (proposedValue !== undefined) {
					value = proposedValue;
				}
			} catch (e) {
				reject(e);
				return;
			}
			
			resolve(value);
		});
	}

	getSync(key) {
		if (Extension.Singleton.executionContextType !== Extension.ExecutionContextTypes.background) {
			throw new Error("Extension.Storage.getSync only available in the background page");
		}

		let rawValue = localStorage.getItem(key);
		if (typeof(rawValue) === "string") {
			let valueArray = JSON.parse(rawValue);
			if (Array.isArray(valueArray) && valueArray.length > 0) {
				return valueArray[0];
			}
		}
	}

	set(key, value) {
		return new Promise((resolve, reject) => {
			try {
				let serializedValue = JSON.stringify([value]);
				localStorage.setItem(key, serializedValue);
			} catch (e) {
				reject(e);
				return;
			}
			
			resolve({});
		});
	}

	remove(key) {
		return new Promise((resolve, reject) => {
			try {
				localStorage.removeItem(key);
			} catch (e) {
				reject(e);
				return;
			}
			
			resolve({});
		});
	}

	blindSet(key, value) {
		this.set(key, value).then(() => {
			// set successful yay
		}).catch(err => {
			console.warn(`Failed to set value (Extension.Storage) for key (${key}):`, err);
		});
	}
};

Extension.Storage.Singleton = new Extension.Storage();
