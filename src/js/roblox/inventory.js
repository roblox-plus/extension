/*
	roblox/inventory.js [03/12/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Inventory = class extends Extension.BackgroundService {
  constructor() {
    super('Roblox.inventory');

    this.register([this.getCollectibles]);
  }

  getCollectibles(userId) {
    return new Promise((resolve, reject) => {
      inventoryService
        .getLimitedInventory(userId)
        .then((limitedInventory) => {
          const data = limitedInventory.map((item) => {
            return {
              userAssetId: item.userAssetId,
              serialNumber: item.serialNumber,
              assetId: item.id,
              name: item.name,
              recentAveragePrice: item.recentAveragePrice,
              assetStock: item.stock === 0 ? 0 : item.stock || null,
            };
          });

          let combinedValue = 0;

          data.forEach(function (userAsset) {
            combinedValue += userAsset.recentAveragePrice || 0;
          });

          const collectibles = data.sort(function (a, b) {
            if (a.assetId === b.assetId) {
              return a.userAssetId - b.userAssetId;
            }

            return a.assetId - b.assetId;
          });

          resolve({
            combinedValue: combinedValue,
            collectibles: collectibles,
          });
        })
        .catch(reject);
    });
  }
};

Roblox.inventory = new Roblox.Services.Inventory();

// WebGL3D
