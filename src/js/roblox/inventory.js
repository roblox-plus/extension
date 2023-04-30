/*
	roblox/inventory.js [03/12/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Inventory = class extends Extension.BackgroundService {
  constructor() {
    super('Roblox.inventory');

    this.register([this.getCollectibles, this.getAssetOwners]);
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

  getAssetOwners(assetId, cursor, sortOrder) {
    return CachedPromise(
      `${this.serviceId}.getAssetOwners`,
      (resolve, reject) => {
        // TODO: Audit Api for error codes
        if (typeof assetId != 'number' || assetId <= 0) {
          reject([
            {
              code: 0,
              message: 'Invalid assetId',
            },
          ]);
          return;
        }

        $.get(`https://inventory.roblox.com/v2/assets/${assetId}/owners`, {
          cursor: cursor || '',
          sortOrder: sortOrder || 'Asc',
          limit: 100,
        })
          .done((data) => {
            var dcb = -1;
            const fcb = () => {
              if (++dcb === data.data.length) {
                resolve(data);
              }
            };

            data.data.forEach((record, index) => {
              var translatedRecord = {
                userAssetId: record.id,
                serialNumber: record.serialNumber,
                owner: null,
                created: record.created,
                updated: record.updated,
              };

              if (record.owner) {
                Roblox.users
                  .getByUserId(record.owner.id)
                  .then((user) => {
                    translatedRecord.owner = {
                      userId: user.id,
                      username: user.username,
                    };

                    data.data[index] = translatedRecord;
                    fcb();
                  })
                  .catch(fcb);
              } else {
                data.data[index] = translatedRecord;
                fcb();
              }
            });

            fcb();
          })
          .fail(Roblox.api.$reject(reject));
      },
      [assetId, cursor, sortOrder],
      {
        queued: true,
        resolveExpiry: 30 * 1000,
        rejectExpiry: 10 * 1000,
      }
    );
  }
};

Roblox.inventory = new Roblox.Services.Inventory();

// WebGL3D
