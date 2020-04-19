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
				let rawValue = localStorage.getItem(key);
				if (typeof(rawValue) === "string") {
					let valueArray = JSON.parse(rawValue);
					if (Array.isArray(valueArray) && valueArray.length > 0) {
						value = valueArray[0];
					}
				}
			} catch (e) {
				reject(e);
				return;
			}
			
			resolve(value);
		});
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
