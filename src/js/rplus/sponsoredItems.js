var RPlus = RPlus || {};
RPlus.Services = RPlus.Services || {};
RPlus.Services.SponsoredItems = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.sponsoredItems");

		this.register([
			this.getSponsoredItems
		]);
	}

	getSponsoredItems(category, subcategory) {
		return CachedPromise(`${this.serviceId}.getSponsoredItems`, (resolve, reject) => {
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
					reject([
						{
							code: 0,
							message: "HTTP request failed"
						}
					]);
				});
			}).catch(console.error);
		}, [category, subcategory], {
			queued: true,
			resolveExpiry: 2 * 60 * 1000,
			rejectExpiry: 30 * 1000
		});
	}
};

RPlus.sponsoredItems = new RPlus.Services.SponsoredItems();
