/*
	rplus/settings.js [05/23/2017]
*/
(window.RPlus || (RPlus = {})).settings = (function () {
	var defaultSettings = {

	};

	return {
		getAll: $.promise.cache(function (resolve, reject) {

		}, {
			resolveExpiry: 1,
			rejectExpiry: 1,
			queued: true
		}),
		set: $.promise.cache(function (resolve, reject, key, value) {
		}, {
			resolveExpiry: 1,
			rejectExpiry: 1,
			queued: true
		}),
		get: $.promise.cache(function (resolve, reject, key) {
			this.getAll().then(function (settings) {
				if (settings.hasOwnProperty(key)) {
					resolve(settings[key]);
				} else {
					reject([{
						code: 1,
						message: "Setting doesn't exist."
					}]);
				}
			}).catch(reject);
		}, {
			resolveExpiry: 1,
			rejectExpiry: 1,
			queued: true
		})
	};
})();


// WebGL3D
