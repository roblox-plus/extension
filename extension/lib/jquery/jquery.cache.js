/*
	jquery.cache.js [10/15/2016]
*/
$.cache = (function () {
	var cache = {};
	var expiries = {};
	var cacheId = 0;


	var jcache = $.addTrigger(function (wrapper, expiry) {
		if (typeof (wrapper) == "function") {
			var name = wrapper.name || wrapper.functionPath;
			var id = ++cacheId;
			var inProgress = {};
			var completed = {};

			return function () {
				var cacheKey = {};
				var callBack;
				var args = [];
				for (var n = 0; n < arguments.length; n++) {
					if (typeof (arguments[n]) != "function") {
						args.push(cacheKey[n] = arguments[n]);
					} else {
						callBack = arguments[n];
						args.push(function () {
							completed[cacheKey] = global.parseArguments(arguments);
							while (inProgress[cacheKey] && inProgress[cacheKey].length) {
								inProgress[cacheKey].shift().apply(this, completed[cacheKey]);
							}
							delete inProgress[cacheKey];
							if (expiry > 0) {
								setTimeout(function () {
									delete completed[cacheKey];
								}, expiry);
							}
						});
					}
				}
				cacheKey = JSON.stringify(cacheKey).toLowerCase();

				if (callBack) {
					if (completed.hasOwnProperty(cacheKey)) {
						callBack.apply(this, completed[cacheKey]);
					} else {
						if (inProgress.hasOwnProperty(cacheKey)) {
							inProgress[cacheKey].push(callBack);
							return;
						} else {
							inProgress[cacheKey] = [callBack];
						}
						wrapper.apply(this, args);
					}
				} else {
					wrapper.apply(this, args);
				}
			};
		}

		if (typeof (wrapper) == "string") {
			var cacheObject = $.addTrigger(function (key, value, expiry) {
				if (typeof (value) == "function") {
					return ipc.send("$.cache.get", { key: key, namespace: wrapper }, value);
				}

				return ipc.send("$.cache.set", {
					key: key,
					value: value,
					expiry: Number(expiry) || 0,
					namespace: wrapper
				});
			});

			cacheObject.delete = function (key) {
				ipc.send("$.cache.delete", { key: key, namespace: wrapper });
			};

			return cacheObject;
		}
	}, "$.cache");



	if (ext.isBackground) {
		function cache_get(key, namespace) {
			cache_validate(namespace);
			return cache[namespace][key];
		}

		function cache_set(key, value, expiry, namespace) {
			cache_validate(namespace);
			cache[namespace][key] = value;
			if (expiries[namespace].hasOwnProperty(key)) {
				clearTimeout(expiries[namespace][key]);
			}
			if (expiry > 0) {
				expiries[namespace][key] = setTimeout(cache_delete, expiry, key);
			}
		}

		function cache_delete(key, namespace) {
			cache_validate(namespace);
			delete expiries[namespace][key];
			delete cache[namespace][key];
		}

		function cache_validate(namespace) {
			if (!cache.hasOwnProperty(namespace)) {
				cache[namespace] = {};
			}
			if (!expiries.hasOwnProperty(namespace)) {
				expiries[namespace] = {};
			}
		}


		ipc.on("$.cache.get", function (data, callBack) {
			if (Array.isArray(data.key)) {
				var values = {};
				data.key.forEach(function (key) {
					values[key] = cache_get(key, data.namespace);
				});
				callBack(values);
			} else if (typeof (data.key) == "string") {
				callBack(cache_get(data.key, data.namespace));
			} else {
				callBack();
			}
		});

		ipc.on("$.cache.set", function (data, callBack) {
			if (typeof (data.key) == "string") {
				cache_set(data.key, data.value, data.expiry, data.namespace);
			} else if (typeof (data.key) == "object") {
				for (var n in data.key) {
					cache_set(n, data.key[n], data.expiry, data.namespace);
				}
			}
		});

		ipc.on("$.cache.delete", function (data, callBack) {
			if (typeof (data.key) == "string") {
				cache_delete(data.key, data.namespace);
			} else if (Array.isArray(data.key)) {
				data.key.forEach(function (key) {
					cache_delete(key, data.namespace);
				});
			}
		});
	}



	return jcache;
})();



// WebGL3D
