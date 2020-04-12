function CachedPromise(id, func, args, configuration) {
	if (typeof(configuration) !== "object") {
		configuration = {};
	}

	if (typeof(configuration.resolveExpiry) !== "number") {
		configuration.resolveExpiry = 5000;
	}

	if (typeof(configuration.rejectExpiry) !== "number") {
		configuration.rejectExpiry = 2000;
	}

	let cache = CachedPromise.Caches[id];
	if (!cache) {
		cache = {
			queue: {},
			resolve: new TimedCache(configuration.resolveExpiry),
			reject: new TimedCache(configuration.rejectExpiry)
		};

		CachedPromise.Caches[id] = cache;
	}

	return new Promise(function(resolve, reject) {
		let cacheKey = JSON.stringify(args);
		if (cache.queue[cacheKey]) {
			cache.queue[cacheKey].push({
				resolve: resolve,
				reject: reject
			});

			return;
		}

		let resolveCachedItem = cache.resolve.get(cacheKey);
		if (resolveCachedItem.exists) {
			resolve(resolveCachedItem.item);
			return;
		}

		let rejectCachedItem = cache.reject.get(cacheKey);
		if (rejectCachedItem.exists) {
			reject(rejectCachedItem.item);
			return;
		}

		let queue = cache.queue[cacheKey] = [{
			resolve: resolve,
			reject: reject
		}];

		func((result) => {
			cache.resolve.set(cacheKey, result);

			while (queue.length > 0) {
				let p = queue.shift();
				try {
					p.resolve(result);
				} catch (e) {
					try {
						p.reject(e);
					} catch (e2) {
						// couldn't even reject...
						console.error("cached promise failed to reject", e2);
					}
				}
			}

			delete cache.queue[cacheKey];
		}, (err) => {
			cache.reject.set(cacheKey, err);

			while (queue.length > 0) {
				let p = queue.shift();

				try {
					p.reject(err);
				} catch (e) {
					// couldn't even reject...
					console.error("cached promise failed to reject", e);
				}
			}

			delete cache.queue[cacheKey];
		});
	});
}

CachedPromise.Caches = {};
