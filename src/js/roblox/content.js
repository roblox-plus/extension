/*
	roblox/content.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.AssetContent = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.content");

		this.assetContentUrlProcessor = new BatchItemProcessor({}, this.processAssetContentUrls.bind(this), console.error.bind(console, "Roblox.content.getAssetContentUrl"));
		
		this.register([
			this.getAssetContentUrl,
			this.getAssetContents
		]);
	}

	getAssetContentUrl(assetId) {
		return CachedPromise("Roblox.content.getAssetContentUrl", (resolve, reject) => {
			this.assetContentUrlProcessor.push(assetId).then(resolve).catch(reject);
		}, [assetId], {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000
		});
	}

	getAssetContents(assetId) {
		return CachedPromise("Roblox.content.getAssetContents", (resolve, reject) => {
			this.getAssetContentUrl(assetId).then(contentUrl => {
				$.get(contentUrl).done((r) => {
					resolve(r);
				}).fail(() => {
					reject([
						{
							code: 0,
							message: "HTTP request failed"
						}
					]);
				});
			}).catch(reject);
		}, [assetId], {});
	}

	processAssetContentUrls(assetIds) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: "https://assetdelivery.roblox.com/v1/assets/batch",
				type: "POST",
				data: assetIds.map(assetId => {
					return {
						"assetId": assetId,
						"requestId": `${assetId}`
					};
				}),
				headers: {
					"Roblox-Browser-Asset-Request": "Roblox+"
				}
			}).done((r) => {
				let result = [];
				let assetMap = {};

				r.forEach((asset) => {
					assetMap[asset.requestId] = asset;
				});

				assetIds.forEach((assetId) => {
					let item = {
						item: assetId,
						success: true
					};

					let asset = assetMap[assetId.toString()];
					if (asset.errors) {
						item.reject = asset.errors;
					} else {
						item.value = asset.location;
					}

					result.push(item);
				});

				resolve(result);
			}).fail((jxhr, errors) => {
				reject(errors);
			});
		});
	}
};

Roblox.content = new Roblox.Services.AssetContent();

// WebGL3D
