/*
	roblox/catalog.js [11/26/2016]
*/
(window.Roblox || (Roblox = {})).catalog = $.addTrigger({
	assetTypeIds: {
		1: "Image",
		2: "T-Shirt",
		3: "Audio",
		4: "Mesh",
		5: "Lua",
		6: "HTML",
		7: "Text",
		8: "Hat",
		9: "Place",
		10: "Model",
		11: "Shirt",
		12: "Pants",
		13: "Decal",
		16: "Avatar",
		17: "Head",
		18: "Face",
		19: "Gear",
		21: "Badge",
		22: "Group Emblem",
		24: "Animation",
		25: "Arms",
		26: "Legs",
		27: "Torso",
		28: "Right Arm",
		29: "Left Arm",
		30: "Left Leg",
		31: "Right Leg",
		32: "Package",
		33: "YoutubeVideo",
		34: "Game Pass",
		35: "App",
		37: "Code",
		38: "Plugin",
		39: "SolidModel",
		40: "MeshPart",
		41: "Hair Accessory",
		42: "Face Accessory",
		43: "Neck Accessory",
		44: "Shoulder Accessory",
		45: "Front Accessory",
		46: "Back Accessory",
		47: "Waist Accessory"
	},
	libraryAssetTypeIds: [1, 3, 4, 10, 13, 38, 40],
	
	getIdFromUrl: function(url){
		return Number((url.match(/\/catalog\/(\d+)\//i) || url.match(/\/library\/(\d+)\//i) || url.match(/item\.aspx.*id=(\d+)/i) || url.match(/item\?.*id=(\d+)/i) || ["", 0])[1]) || 0;
	},
	
	getAssetUrl: function(assetId){
		return "https://www.roblox.com/catalog/" + assetId + "/Asset?rbxp=48103520";
	},
	
	
	getAssetInfo: $.cache(request.backgroundFunction("Roblox.catalog.getAssetInfo", function(id, callBack){
		var template = {
			"id": 0,
			"productId": 0,
			"name": "",
			"description": "",
			"assetTypeId": 0,
			"creator": { "id": 0, "name": "", "creatorType": "", "agentId": 0 },
			"created": 0,
			"updated": 0,
			"price": 0,
			"sales": 0,
			"isNew": false,
			"isForSale": false,
			"isFree": false,
			"isLimited": false,
			"isLimitedUnique": false,
			"remaining": 0,
			"minimumMembershipLevel": 0,
			"isThirteenPlus": false,
			"rap": 0,
			"resellers": [],
			"thumbnail": "",
			"absoluteUrl": ""
		};
		
		if(typeof(id) != "number" || id <= 0){
			callBack(template);
			return;
		}
		
		$.get("https://api.roblox.com/marketplace/productinfo?assetId=" + id).done(function(r){
			template.id = r.AssetId;
			template.productId = r.ProductId || 0;
			template.name = r.Name;
			template.description = r.Description;
			template.assetTypeId = r.AssetTypeId;
			template.creator.id = r.Creator.CreatorTargetId;
			template.creator.name = r.Creator.Name;
			template.creator.creatorType = r.Creator.CreatorType;
			template.creator.agentId = r.Creator.Id;
			template.created = new Date(r.Created).getTime();
			template.updated = new Date(r.Updated).getTime();
			template.price = Number(r.PriceInRobux) || 0;
			template.sales = r.Sales;
			template.isNew = r.IsNew || ((+ new Date) - template.created < 3 * 24 * 60 * 60 * 1000);
			template.isFree = r.IsPublicDomain;
			template.isForSale = template.isFree || template.price > 0;
			template.isLimitedUnique = r.IsLimitedUnique;
			template.isLimited = r.IsLimited || template.isLimitedUnique;
			template.remaining = Number(r.Remaining) || 0;
			template.minimumMembershipLevel = (["NBC", "BC", "TBC", "OBC"])[r.MinimumMembershipLevel];
			template.isThirteenPlus = r.ContentRatingTypeId > 0;
			template.thumbnail = Roblox.thumbnails.getAssetThumbnailUrl(template.id, 9);
			template.absoluteUrl = "https://www.roblox.com/" + (Roblox.catalog.libraryAssetTypeIds.indexOf(template.assetTypeId) >= 0 ? "library" : "catalog") + "/" + template.id + "/" + (template.name.replace(/\W+/g, "-").replace(/^\W+/, "").replace(/\W$/g, ""));
			if(template.isLimited){
				$.get("https://www.roblox.com/asset/" + template.id + "/sales-data").done(function(r){
					if(r.isValid && r.data){
						template.rap = Number(r.data.AveragePrice) || 0;
					}
					$.get("https://www.roblox.com/asset/resellers", { productId: template.productId, startIndex: 0, maxRows: 10 }).done(function(r){
						(r.data && r.data.Resellers || []).forEach(function(reseller){
							template.resellers.push({
								userAssetId: reseller.UserAssetId,
								seller: { id: reseller.SellerId, username: reseller.SellerName },
								price: reseller.Price,
								serialNumber: reseller.SerialNumber,
								thumbnail: reseller.Thumbnail.Final ? reseller.Thumbnail.Url : Roblox.thumbnails.getUserHeadshotUrl(reseller.SellerId, 4)
							});
						});
					}).always(function(){
						callBack(template);
					});
				}).fail(function(){
					callBack(template);
				});
			}else{
				callBack(template);
			}
		}).fail(function(){
			callBack(template);
		});
	}), 5 * 1000),
	
	getAssetContents: $.cache(request.backgroundFunction("Roblox.catalog.getAssetContents", function(assetId, callBack){
		var data = [];
		$.get("https://assetgame.roblox.com/asset", { id: assetId }).success(function(r){
			if(r.match(/^\d+;?/)){
				r.split(";").forEach(function(assetId){
					assetId = Number(assetId);
					if(assetId){
						data.push({ id: assetId });
					}
				});
			}else{
				(r.match(/"TextureI?d?".*=\s*\d+/gi) || r.match(/"TextureI?d?".*rbxassetid:\/\/\d+/gi) || []).forEach(function(tex){
					tex = Number(tex.match(/(\d+)$/)[1]);
					if(tex){
						data.push({ id: tex, assetTypeId: 1 });
					}
				});
				(r.match(/"MeshId".*=\s*\d+/gi) || r.match(/MeshId.*rbxassetid:\/\/\d+/gi) || []).forEach(function(mesh){
					mesh = Number(mesh.match(/(\d+)$/)[1]);
					if(mesh){
						data.push({ id: mesh, assetTypeId: 4 });
					}
				});
				(r.match(/asset\/?\?\s*id\s*=\s*\d+/gi) || r.match(/rbxassetid:\/\/\d+/gi) || []).forEach(function(assetId){
					assetId = Number(assetId.match(/(\d+)$/)[1]);
					if(assetId && data.indexOf(assetId) < 0){
						data.push(assetId);
					}
				});
			}
		}).always(function(){
			callBack(data);
		});
	}), 60 * 1000),
	
	userHasAsset: $.cache(request.backgroundFunction("Roblox.catalog.userHasAsset", function(userId, assetId, callBack){
		if(typeof(userId) != "number" || userId < 1 || typeof(assetId) != "number" || assetId < 1){
			callBack(false);
			return;
		}
		$.get("https://api.roblox.com/ownership/hasasset", { userId: userId, assetId: assetId }).done(function(r){
			callBack(r);
		}).fail(function(){
			callBack(false);
		});
	}), 5 * 60 * 1000)
});



// WebGL3D
