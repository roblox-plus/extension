(window.RPlus || (RPlus = {})).sponsoredItems = (function () {
	return {
		getSponsoredItems: $.promise.cache(function (resolve, reject, category, subcategory) {
			console.log("Load sponsored items for category:", category, "(subcategory " + subcategory + ")");

			RPlus.settings.get().then(function (settings) {
				if (!settings.sponsoredCatalogItemsEnabled) {
					resolve([]);
					return;
				}
				
				$.get("https://api.roblox.plus/v1/catalog/sponsored-items", {
					category: category,
					subcategory: subcategory
				}).done(function(r) {
					resolve(r.data);
				}).fail(function() {
					reject([{
						code: 0,
						message: "HTTP request failed"
					}]);
				});
			}).catch(console.error);
		}, {
			resolveExpiry: 2 * 60 * 1000,
			rejectExpiry: 30 * 1000,
			queued: true
		})
	};
})();

RPlus.sponsoredItems = $.addTrigger($.promise.background("RPlus.sponsoredItems", RPlus.sponsoredItems));
