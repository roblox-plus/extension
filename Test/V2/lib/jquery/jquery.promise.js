/* jquery.promise.js [03/12/2017] */
$.promise = (function (defaultProperties) {
	function promiseBase(callBack) {
		return new Promise(callBack);
	}

	promiseBase.cache = function (callBack, properties) {
		if (typeof (properties) != "object") {
			properties = {};
		}
		if (typeof (properties.rejectExpiry) != "number") {
			properties.rejectExpiry = defaultProperties.defaultCacheRejectExpiry;
		}
		if (typeof (properties.resolveExpiry) != "number") {
			properties.resolveExpiry = defaultProperties.defaultCacheResolveExpiry;
		}

		var cachedPromises = {};
		var queue = [];
		var busy = false;

		function processQueue() {
			if (properties.queued && busy) {
				return;
			}
			var ticket = queue.shift();
			if (ticket) {
				busy = true;
				ticket.callBack.apply(ticket.scope, ticket.arguments);
			}
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
					if (properties.rejectExpiry > 0) {
						setTimeout(function () {
							delete cachedPromises[cacheKey];
						}, properties.rejectExpiry);
					}
					busy = false;
					setTimeout(processQueue, 0);
					reject.apply(this, arguments);
				});
				// resolve
				args.unshift(function () {
					if (properties.resolveExpiry > 0) {
						setTimeout(function () {
							delete cachedPromises[cacheKey];
						}, properties.resolveExpiry);
					}
					busy = false;
					setTimeout(processQueue, 0);
					resolve.apply(this, arguments);
				});
				queue.push({
					callBack: callBack,
					arguments: args,
					scope: scope
				});
				processQueue();
			});
		};

		wrapper.jpromiseProperties = properties;

		return wrapper;
	};

	promiseBase.background = function (path, cachedPromise) {
		if (typeof (cachedPromise) == "object") {
			for (var n in cachedPromise) {
				if (typeof (cachedPromise[n]) == "function" && cachedPromise[n].hasOwnProperty("jpromiseProperties")) {
					cachedPromise[n] = promiseBase.background(path + "." + n, cachedPromise[n]);
				}
			}
			return cachedPromise;
		}

		var cachedBackgroundPromises = {};
		
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
					if (cachedPromise.jpromiseProperties.resolveExpiry > 0) {
						setTimeout(function () {
							delete cachedBackgroundPromises[cacheKey];
						}, cachedPromise.jpromiseProperties.resolveExpiry);
					}
					resolve.apply(this, arguments);
				};
			}

			function customReject(reject) {
				return function () {
					if (cachedPromise.jpromiseProperties.rejectExpiry > 0) {
						setTimeout(function () {
							delete cachedBackgroundPromises[cacheKey];
						}, cachedPromise.jpromiseProperties.rejectExpiry);
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
