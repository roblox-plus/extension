/*
	roblox/inventory.js [11/26/2016]
*/
(window.Roblox || (Roblox = {})).inventory = (function(){
	var maxItemsPerPage = 25;
	var getBlankPage = function(userId){
		return {
			agentID: userId || 0,
			totalNumber: 0,
			InventoryItems: []
		};
	};
	var getCollectiblePage = $.cache(request.backgroundFunction("Roblox.inventory.getCollectiblePage", function(userId, assetTypeId, pageNumber, callBack){
		$.get("https://www.roblox.com/Trade/InventoryHandler.ashx", {
			userId: userId,
			assetTypeId: assetTypeId,
			page: pageNumber,
			itemsPerPage: 25
		}).done(function(r){
			callBack(r.data || getBlankPage(userId));
		}).fail(function(){
			callBack(getBlankPage(userId));
		});
	}), 5 * 60 * 1000);
	getCollectiblePage.delayedCacheGet = function(userId, assetTypeId, pageNumber, callBack){
		setTimeout(getCollectiblePage, 10, userId, assetTypeId, pageNumber, callBack);
	};
	getCollectiblePage.getBlankPage = getBlankPage;
	
	
	return $.addTrigger({
		getCollectiblePage: getCollectiblePage,
		
		getCollectibles: function(userId){
			var inventory = $.addTrigger({
				ready: false,
				assets: {},
				value: 0
			});
			var donePages = {};
			var assetTypePages = {};
			var done = 0;
			var totalPages = 0;
			
			function load(assetTypeId, pageNumber){
				totalPages++;
				assetTypePages[assetTypeId]++;
				getCollectiblePage.delayedCacheGet(userId, assetTypeId, pageNumber, function(data){
					data.InventoryItems.forEach(function(userAsset){
						var assetId = Roblox.catalog.getIdFromUrl(userAsset.ItemLink);
						inventory.assets[assetId] = inventory.assets[assetId] || {
							id: assetId,
							name: userAsset.Name,
							assetTypeId: assetTypeId,
							thumbnail: userAsset.ImageLink,
							recentAveragePrice: Number(userAsset.AveragePrice) || 0,
							stock: Number(userAsset.SerialNumberTotal) || 0,
							url: userAsset.ItemLink,
							userAssets: {}
						};
						inventory.assets[assetId].userAssets[Number(userAsset.UserAssetID)] = Number(userAsset.SerialNumber) || 0;
						inventory.value += inventory.assets[assetId].recentAveragePrice;
					});
					if(pageNumber == 1 && data.totalNumber > maxItemsPerPage){
						for(var page = 2; page <= Math.ceil(data.totalNumber / maxItemsPerPage); page++){
							load(assetTypeId, page);
						}
					}
					if(++donePages[assetTypeId] == assetTypePages[assetTypeId]){
						inventory.trigger("loadedAssetType", assetTypeId, data.totalNumber);
					}else{
						inventory.trigger("loadingAssetType", assetTypeId, (donePages[assetTypeId] / assetTypePages[assetTypeId]) * 100);
					}
					if(++done == totalPages){
						inventory.ready = true;
						inventory.trigger("ready");
					}else{
						inventory.trigger("loading", (done / totalPages) * 100);
					}
				});
			}
			
			[
				8, // Hat
				18, // Face
				19, // Gear
				41, // Hair Accessory
				42, // Face Accessory
				43, // Neck Accessory
				44, // Shoulder Accessory
				45, // Front Accessory
				46, // Back Accessory
				47 // Waist Accessory
			].forEach(function(assetTypeId){
				donePages[assetTypeId] = 0;
				assetTypePages[assetTypeId] = 0;
				load(assetTypeId, 1);
			});
			return inventory;
		}
	});
})();



// WebGL3D
