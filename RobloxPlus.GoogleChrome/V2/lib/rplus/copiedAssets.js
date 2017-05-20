/*
	roblox/content.js [03/18/2017]
*/
(window.RPlus || (RPlus = {})).copiedAssets = (function () {
	return {
		getOriginalAssetIds: $.promise.cache(function (resolve, reject, assetIds) {
			$.get("http://copiedclothing.roblox.plus:48103/copiedassets/original?assetId=" + assetIds.join("&assetId=")).done(function (r) {
				resolve(r);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 30 * 1000,
			queued: true
		})
	};
})();

RPlus.copiedAssets = $.addTrigger($.promise.background("RPlus.copiedAssets", RPlus.copiedAssets));
