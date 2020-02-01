class TimedCache {
	constructor(expirationInMilliseconds) {
		this.expirationInMilliseconds = expirationInMilliseconds;
		this.cache = {};
		this.cacheExpirations = {};
	}

	contains(key) {
		let expiration = this.cacheExpirations[key];
		if (!expiration) {
			return false;
		}

		return expiration > (+new Date);
	}

	get(key) {
		let item = this.cache[key];

		return {
			exists: this.contains(key),
			item: item
		};
	}

	set(key, value) {
		this.cache[key] = value;
		this.cacheExpirations[key] = (+new Date) + this.expirationInMilliseconds;

		setTimeout(() => {
			let expiration = this.cacheExpirations[key];
			if (!expiration || expiration > (+new Date)) {
				return;
			}

			delete this.cacheExpirations[key];
			delete this.cache[key];
		}, this.expirationInMilliseconds);
	}
}
