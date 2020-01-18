/*
	roblox/catalog.js [03/18/2017]
*/
var Roblox = Roblox || {};

Roblox.catalog = (function () {
	return {
		assetTypes: {
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
		},
		wearableAssetTypeIds: [2, 8, 11, 12, 17, 18, 19, 25, 26, 27, 28, 29, 30, 31, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
		collectibleAssetTypeIds: [8, 18, 19, 41, 42, 43, 44, 45, 46, 47],
		
		getIdFromUrl: function (url) {
			return Number((url.match(/\/catalog\/(\d+)\//i) || url.match(/\/library\/(\d+)\//i) || url.match(/item\.aspx.*id=(\d+)/i) || url.match(/item\?.*id=(\d+)/i) || ["", 0])[1]) || 0;
		},

		getAssetUrl: function (assetId, assetName) {
			if (typeof (assetName) != "string" || !assetName) {
				assetName = "redirect";
			} else {
				assetName = assetName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
			}
			return "https://www.roblox.com/catalog/" + assetId + "/" + assetName;
		},

		getBundleUrl: function(bundleId, bundleName) {
			if (typeof (bundleName) != "string" || !bundleName) {
				bundleName = "redirect";
			} else {
				bundleName = bundleName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
			}
			return "https://www.roblox.com/bundles/" + bundleId + "/" + bundleName;
		},

		calculateAveragePriceAfterSale: function (currentAveragePrice, priceToSellFor) {
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
		},

		getAssetBundles: $.promise.cache(function (resolve, reject, assetId) {
			$.get("https://catalog.roblox.com/v1/assets/" + assetId + "/bundles").done(function(r) {
				resolve(r.data.map(function(bundle) {
					var outfitId = NaN;
					bundle.items.forEach(function(item) {
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
			}).fail(function(jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 5 * 60 * 1000,
			rejectExpiry: 5 * 1000
		}),

		getAssetInfo: $.promise.cache(function (resolve, reject, assetId) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}
			
			$.get("https://api.roblox.com/marketplace/productinfo", { assetId: assetId }).done(function (r) {
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
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		}),
		
		getProductInfo: $.promise.cache(function (resolve, reject, productId) {
			if (typeof (productId) != "number" || productId <= 0) {
				reject([{
					code: 0,
					message: "Invalid productId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/marketplace/productdetails", { productId: productId }).done(function (r) {
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
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		}),
		
		getGamePassInfo: $.promise.cache(function (resolve, reject, gamePassId) {
			if (typeof (gamePassId) != "number" || gamePassId <= 0) {
				reject([{
					code: 0,
					message: "Invalid gamePassId"
				}]);
				return;
			}

			$.get("https://api.roblox.com/marketplace/game-pass-product-info", { gamePassId: gamePassId }).done(function (r) {
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
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		}),

		getAssetSalesCount: $.promise.cache(function (resolve, reject, assetId) {
			Roblox.catalog.getAssetInfo(assetId).then(function(asset) {
				resolve(asset.sales);
			}).catch(reject);
		}, {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 5 * 1000
		}),

		configureAsset: $.promise.cache(function (resolve, reject, assetId, configuration) {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}
			if (typeof (configuration) !== "object") {
				reject([{
					code: 0,
					message: "Invalid configuration (expected object)"
				}]);
				return;
			}
			
			$.get("https://www.roblox.com/My/Item.aspx?ID=" + assetId).done(function (r) {
				r = $._(r);
				if (r.find("#EditItem").length) {
					configuration.robux = round(typeof (configuration.robux) == "number" ? configuration.robux : r.find("#ctl00_cphRoblox_RobuxPrice").val()) || 0;
					configuration.genre = typeof (configuration.genre) == "number" ? configuration.genre : r.find("#ctl00_cphRoblox_actualGenreSelection").val();
					var data = {
						"ctl00$cphRoblox$NameTextBox": typeof (configuration.name) === "string" && configuration.name ? configuration.name : r.find("#ctl00_cphRoblox_NameTextBox").val(),
						"ctl00$cphRoblox$DescriptionTextBox": typeof (configuration.description) === "string" ? configuration.description : r.find("#ctl00_cphRoblox_DescriptionTextBox").val(),
						"ctl00$cphRoblox$SellThisItemCheckBox": (configuration.hasOwnProperty("free") && configuration.free) || configuration.robux > 0 ? "on" : "",
						"ctl00$cphRoblox$SellForRobux": configuration.robux > 0 ? "on" : "",
						"ctl00$cphRoblox$RobuxPrice": configuration.robux,
						"ctl00$cphRoblox$PublicDomainCheckBox": configuration.hasOwnProperty("free") ? (configuration.free ? "on" : "") : (r.find("#ctl00_cphRoblox_PublicDomainCheckBox").prop("checked") ? "on" : ""),
						"GenreButtons2": configuration.genre,
						"ctl00$cphRoblox$actualGenreSelection": configuration.genre,
						"ctl00$cphRoblox$EnableCommentsCheckBox": configuration.hasOwnProperty("comments") ? (configuration.comments ? "on" : "") : (r.find("#ctl00_cphRoblox_EnableCommentsCheckBox").prop("checked") ? "on" : ""),
						__EVENTTARGET: "ctl00$cphRoblox$SubmitButtonBottom",
						__PREVIOUSPAGE: r.find("#__PREVIOUSPAGE").val(),
						__EVENTVALIDATION: r.find("#__EVENTVALIDATION").val(),
						__VIEWSTATEGENERATOR: r.find("#__VIEWSTATEGENERATOR").val(),
						__VIEWSTATE: r.find("#__VIEWSTATE").val()
					};
					for (var n in data) {
						if (!r.find("*[name='" + n + "']").length) {
							delete data[n];
						}
					};
					$.post("https://www.roblox.com/My/Item.aspx?ID=" + assetId, data).done(function() {
						resolve();
					}).fail(function () {
						reject([{
							code: 0,
							message: "HTTP request failed"
						}]);
					});
				} else {
					reject([{
						code: 1,
						message: "You can't configure this asset!"
					}]);
				}
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true,
			resolveExpiry: 100,
			rejectExpiry: 1000
		})
	};
})();

Roblox.catalog = $.addTrigger($.promise.background("Roblox.catalog", Roblox.catalog));

// WebGL3D
