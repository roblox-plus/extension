/* jquery.promise.js [03/12/2017] */
$.promise = (function (properties) {
	function promiseBase(callBack) {
		return new Promise(callBack);
	}

	var cachedPromises = {};
	promiseBase.cache = function (callBack, expiration) {
		if (typeof (expiration) != "object") {
			expiration = {};
		}
		if (typeof (expiration.reject) != "number") {
			expiration.reject = properties.defaultCacheRejectExpiry;
		}
		if (typeof (expiration.resolve) != "number") {
			expiration.resolve = properties.defaultCacheResolveExpiry;
		}

		var wrapper = function () {
			var scope = this;
			var cacheKey = {};
			var args = [];
			for (var n = 0; n < arguments.length; n++) {
				args.push(cacheKey[n] = arguments[n]);
			}
			cacheKey = JSON.stringify(cacheKey).toLowerCase();

			if (cachedPromises[cacheKey]) {
				return cachedPromises[cacheKey];
			}

			return cachedPromises[cacheKey] = new Promise(function (resolve, reject) {
				// reject
				args.unshift(function () {
					if (expiration.reject > 0) {
						setTimeout(function () {
							delete cachedPromises[cacheKey];
						}, expiration.reject);
					}
					reject.apply(this, arguments);
				});
				// resolve
				args.unshift(function () {
					if (expiration.resolve > 0) {
						setTimeout(function () {
							delete cachedPromises[cacheKey];
						}, expiration.resolve);
					}
					resolve.apply(this, arguments);
				});
				callBack.apply(scope, args);
			});
		};

		wrapper.jpromiseExpiration = expiration;

		return wrapper;
	};

	var cachedBackgroundPromises = {};
	promiseBase.background = function (path, cachedPromise) {
		if (typeof (cachedPromise) == "object") {
			for (var n in cachedPromise) {
				if (typeof (cachedPromise[n]) == "function" && cachedPromise[n].hasOwnProperty("jpromiseExpiration")) {
					cachedPromise[n] = promiseBase.background(path + "." + n, cachedPromise[n]);
				}
			}
			return cachedPromise;
		}
		
		return function () {
			var scope = this;
			var cacheKey = {};
			var args = [];
			for (var n = 0; n < arguments.length; n++) {
				args.push(cacheKey[n] = arguments[n]);
			}
			cacheKey = JSON.stringify(cacheKey).toLowerCase();

			// Double caching so we don't create a new promise, and go to the background process every time.
			if (cachedBackgroundPromises[cacheKey]) {
				return cachedBackgroundPromises[cacheKey];
			}

			function customResolve(resolve) {
				return function () {
					if (cachedPromise.jpromiseExpiration.resolve > 0) {
						setTimeout(function () {
							delete cachedBackgroundPromises[cacheKey];
						}, cachedPromise.jpromiseExpiration.resolve);
					}
					resolve.apply(this, arguments);
				};
			}

			function customReject(reject) {
				return function () {
					if (cachedPromise.jpromiseExpiration.reject > 0) {
						setTimeout(function () {
							delete cachedBackgroundPromises[cacheKey];
						}, cachedPromise.jpromiseExpiration.reject);
					}
					reject.apply(this, arguments);
				};
			}
			
			return cachedBackgroundPromises[cacheKey] = new Promise(function (resolve, reject) {
				if (ext.isBackground) {
					cachedPromise.apply(scope, args).then(customResolve(resolve), customReject(reject));
				} else {
					ipc.send("$.promise.background", { path: path, arguments: args }, function (result) {
						if (result.hasOwnProperty("errors")) {
							customReject(reject)(result.errors);
						} else {
							customResolve(resolve)(result.data);
						}
					});
				}
			});
		};
	};

	if (ext.isBackground) {
		ipc.on("$.promise.background", function (request, callBack) {
			var path = request.path.split(".");
			var func = window;
			var namespace = this;
			while (path.length) {
				func = func[path.shift()];
				if (path.length == 1) {
					namespace = func;
				}
			}
			func.apply(namespace, request.arguments).then(function (data) {
				callBack({
					data: data
				});
			}, function (errors) {
				callBack({
					errors: errors
				});
			});
		});
	}

	return promiseBase;
})({
	defaultCacheRejectExpiry: 2000,
	defaultCacheResolveExpiry: 5000
});


// WebGL3D
