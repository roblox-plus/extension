/*
	roblox/catalog.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Catalog = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.catalog");

		this.assetTypes = {
			"1": "Image",
			"2": "T-Shirt",
			"3": "Audio",
			"4": "Mesh",
			"5": "Lua",
			"6": "HTML",
			"7": "Text",
			"8": "Hat",
			"9": "Place",
			"10": "Model",
			"11": "Shirt",
			"12": "Pants",
			"13": "Decal",
			"16": "Avatar",
			"17": "Head",
			"18": "Face",
			"19": "Gear",
			"21": "Badge",
			"22": "Group Emblem",
			"24": "Animation",
			"25": "Arms",
			"26": "Legs",
			"27": "Torso",
			"28": "Right Arm",
			"29": "Left Arm",
			"30": "Left Leg",
			"31": "Right Leg",
			"32": "Package",
			"33": "YoutubeVideo",
			"34": "Game Pass",
			"35": "App",
			"37": "Code",
			"38": "Plugin",
			"39": "SolidModel",
			"40": "MeshPart",
			"41": "Hair Accessory",
			"42": "Face Accessory",
			"43": "Neck Accessory",
			"44": "Shoulder Accessory",
			"45": "Front Accessory",
			"46": "Back Accessory",
			"47": "Waist Accessory",
			"48": "Climb Animation",
			"49": "Death Animation",
			"50": "Fall Animation",
			"51": "Idle Animation",
			"52": "Jump Animation",
			"53": "Run Animation",
			"54": "Swim Animation",
			"55": "Walk Animation",
			"56": "Pose Animation"
		};

		this.register([
			this.getAssetBundles,
			this.getAssetInfo,
			this.getProductInfo,
			this.getGamePassInfo
		]);
	}

	getIdFromUrl(url) {
		return Number((url.match(/\/catalog\/(\d+)\//i) || url.match(/\/library\/(\d+)\//i) || url.match(/item\.aspx.*id=(\d+)/i) || url.match(/item\?.*id=(\d+)/i) || ["", 0])[1]) || 0;
	}

	getAssetUrl(assetId, assetName) {
		if (typeof (assetName) != "string" || !assetName) {
			assetName = "redirect";
		} else {
			assetName = assetName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
		}

		return `https://www.roblox.com/catalog/${assetId}/${assetName}`;
	}

	getBundleUrl(bundleId, bundleName) {
		if (typeof (bundleName) != "string" || !bundleName) {
			bundleName = "redirect";
		} else {
			bundleName = bundleName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
		}

		return `https://www.roblox.com/bundles/${bundleId}/${bundleName}`;
	}

	calculateAveragePriceAfterSale(currentAveragePrice, priceToSellFor) {
		if (typeof (currentAveragePrice) != "number" || typeof (priceToSellFor) != "number" || priceToSellFor <= 0) {
			return 0;
		}

		if (currentAveragePrice == priceToSellFor) {
			return currentAveragePrice;
		}

		if (currentAveragePrice <= 0) {
			return priceToSellFor;
		}

		return (currentAveragePrice > priceToSellFor ? Math.floor : Math.ceil)((currentAveragePrice * .9) + (priceToSellFor * .1));
	}

	getAssetBundles(assetId) {
		return CachedPromise(`${this.serviceId}.getAssetBundles`, (resolve, reject) => {
			$.get(`https://catalog.roblox.com/v1/assets/${assetId}/bundles`).done((r) => {
				resolve(r.data.map((bundle) => {
					let outfitId = NaN;
					bundle.items.forEach((item) => {
						if (item.type === "UserOutfit") {
							outfitId = item.id;
						}
					});

					return {
						id: bundle.id,
						name: bundle.name,
						outfitId: outfitId
					};
				}));
			}).fail(Roblox.api.$reject(reject));
		}, [assetId], {
			queued: true,
			resolveExpiry: 5 * 60 * 1000,
			rejectExpiry: 5 * 1000
		});
	}

	getAssetInfo(assetId) {
		return CachedPromise(`${this.serviceId}.getAssetInfo`, (resolve, reject) => {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/marketplace/productinfo", {
				assetId: assetId
			}).done((r) => {
				var remaining = Number(r.Remaining) || 0;
				var sales = Number(r.Sales) || 0;
				resolve({
					id: r.AssetId,
					name: r.Name,
					assetTypeId: r.AssetTypeId,
					assetType: Roblox.catalog.assetTypes[r.AssetTypeId],
					productId: r.ProductId,
					description: r.Description,
					creator: {
						id: r.Creator.CreatorTargetId,
						name: r.Creator.Name,
						type: r.Creator.CreatorType,
						agentId: r.Creator.Id
					},
					robuxPrice: Number(r.PriceInRobux) || 0,
					sales: sales,
					isForSale: r.IsForSale,
					isFree: r.IsPublicDomain,
					isLimited: r.IsLimited || r.IsLimitedUnique,
					isLimitedUnique: r.IsLimitedUnique,
					remaining: remaining,
					stock: r.IsLimitedUnique ? remaining + sales : null,
					buildersClubMembershipType: r.MinimumMembershipLevel
				});
			}).fail(Roblox.api.$reject(reject));
		}, [assetId], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		});
	}

	getProductInfo(productId) {
		return CachedPromise(`${this.serviceId}.getProductInfo`, (resolve, reject) => {
			if (typeof (productId) != "number" || productId <= 0) {
				reject([{
					code: 0,
					message: "Invalid productId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/marketplace/productdetails", {
				productId: productId
			}).done((r) => {
				var remaining = Number(r.Remaining) || 0;
				resolve({
					id: r.ProductId,
					assetId: r.AssetId,
					name: r.Name,
					description: r.Description,
					creator: {
						id: r.Creator.CreatorTargetId,
						name: r.Creator.Name,
						type: r.Creator.CreatorType,
						agentId: r.Creator.Id
					},
					robuxPrice: Number(r.PriceInRobux) || 0,
					isForSale: r.IsForSale,
					isFree: r.IsPublicDomain,
					isLimited: r.IsLimited || r.IsLimitedUnique,
					isLimitedUnique: r.IsLimitedUnique,
					remaining: remaining,
					buildersClubMembershipType: r.MinimumMembershipLevel
				});
			}).fail(Roblox.api.$reject(reject));
		}, [productId], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		});
	}

	getGamePassInfo(gamePassId) {
		return CachedPromise(`${this.serviceId}.getGamePassInfo`, (resolve, reject) => {
			if (typeof (gamePassId) != "number" || gamePassId <= 0) {
				reject([{
					code: 0,
					message: "Invalid gamePassId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/marketplace/game-pass-product-info", {
				gamePassId: gamePassId
			}).done((r) => {
				resolve({
					id: gamePassId,
					name: r.Name,
					description: r.Description,
					creator: {
						id: r.Creator.CreatorTargetId,
						name: r.Creator.Name,
						type: r.Creator.CreatorType,
						agentId: r.Creator.Id
					},
					robuxPrice: Number(r.PriceInRobux) || 0,
					isForSale: r.IsForSale,
					isFree: r.IsPublicDomain
				});
			}).fail(Roblox.api.$reject(reject));
		}, [gamePassId], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		});
	}

	getAssetSalesCount(assetId) {
		return new Promise((resolve, reject) => {
			this.getAssetInfo(assetId).then((asset) => {
				resolve(asset.sales);
			}).catch(reject);
		});
	}
};

Roblox.catalog = new Roblox.Services.Catalog();

// WebGL3D
