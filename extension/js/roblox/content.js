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

	getDependentAssetIds(assetId) {
		return new Promise((resolve, reject) => {
			let contentRegexes = [
				/"TextureI?d?".*=\s*(\d+)/gi,
				/"TextureI?d?".*rbxassetid:\/\/(\d+)/gi,
				/"MeshId".*=\s*(\d+)/gi,
				/MeshId.*rbxassetid:\/\/(\d+)/gi,
				/asset\/?\?\s*id\s*=\s*(\d+)/gi,
				/rbxassetid:\/\/(\d+)/gi,
				/:LoadAsset\((\d+)\)/gi,
				/require\((\d+)\)/gi
			];

			this.getAssetContents(assetId).then((r) => {
				let assetIds = [];

				contentRegexes.forEach(regex => {
					let match = r.match(regex) || [];
					match.forEach((m) => {
						let id = Number((m.match(/(\d+)/) || [])[1]);
						if (id && !isNaN(id) && !assetIds.includes(id)) {
							assetIds.push(id);
						}
					});
				});

				resolve(assetIds);
			}).catch(reject);
		});
	}

	getDependentAssets(assetId) {
		return new Promise((resolve, reject) => {
			this.getDependentAssetIds(assetId).then(assetIds => {
				let assets = [];
				let loaded = 0;

				if (assetIds.length <= 0) {
					resolve(assets);
					return;
				}

				assetIds.forEach(id => {
					Roblox.catalog.getAssetInfo(id).then((asset) => {
						assets.push(asset);

						if (++loaded === assetIds.length) {
							resolve(assets);
						}
					}).catch((err) => {
						console.warn(`Roblox.content.getDependentAssets(${assetId}) - ${id}`, err);

						if (++loaded === assetIds.length) {
							resolve(assets);
						}
					});
				});
			}).catch(reject);
		});
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
