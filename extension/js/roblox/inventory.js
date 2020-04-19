/*
	roblox/inventory.js [03/12/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Inventory = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.inventory");

		this.register([
			this.getCollectibles,
			this.delete,
			this.getAssetOwners,
			this.getPlayerBadges
		]);
	}

	loadUserCollectibleAssets(userId, cursor) {
		return new Promise((resolve, reject) => {
			$.get(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles`, {
				cursor: cursor || "",
				sortOrder: "Asc",
				limit: 100
			}).done((r) => {
				if (r.nextPageCursor) {
					this.loadUserCollectibleAssets(userId, r.nextPageCursor).then((extraData) => {
						resolve(r.data.concat(extraData));
					}).catch(reject);
				} else {
					resolve(r.data);
				}
			}).fail(Roblox.api.$reject(reject));
		});
	}

	getCollectibles(userId) {
		return CachedPromise(`${this.serviceId}.getCollectibles`, (resolve, reject) => {
			// TODO: Audit Api for error codes
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			let collectibles = [];
			let combinedValue = 0;

			this.loadUserCollectibleAssets(userId).then(function (data) {
				data.forEach(function (userAsset) {
					combinedValue += userAsset.recentAveragePrice || 0;
				});
				collectibles = collectibles.concat(data);

				collectibles.sort(function (a, b) {
					if (a.assetId === b.assetId) {
						return a.userAssetId - b.userAssetId;
					}

					return a.assetId - b.assetId;
				});

				resolve({
					combinedValue: combinedValue,
					collectibles: collectibles
				});
			}).catch(reject);
		}, [userId], {
			rejectExpiry: 10 * 1000,
			resolveExpiry: 5 * 60 * 1000,
			queued: true
		});
	}

	delete(assetId) {
		return new Promise((resolve, reject) => {
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.post("https://assetgame.roblox.com/asset/delete-from-inventory", {
				assetId: assetId
			}).done(function () {
				resolve();
			}).fail(Roblox.api.$reject(reject));
		});
	}

	getAssetOwners(assetId, cursor, sortOrder) {
		return CachedPromise(`${this.serviceId}`, (resolve, reject) => {
			// TODO: Audit Api for error codes
			if (typeof (assetId) != "number" || assetId <= 0) {
				reject([{
					code: 0,
					message: "Invalid assetId"
				}]);
				return;
			}

			$.get(`https://inventory.roblox.com/v2/assets/${assetId}/owners`, {
				cursor: cursor || "",
				sortOrder: sortOrder || "Asc",
				limit: 100
			}).done((data) => {
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
						updated: record.updated
					};

					if (record.owner) {
						Roblox.users.getByUserId(record.owner.id).then((user) => {
							translatedRecord.owner = {
								userId: user.id,
								username: user.username
							};

							data.data[index] = translatedRecord;
							fcb();
						}).catch(fcb);
					} else {
						data.data[index] = translatedRecord;
						fcb();
					}
				});

				fcb();
			}).fail(Roblox.api.$reject(reject));
		}, [assetId, cursor, sortOrder], {
			queued: true,
			resolveExpiry: 30 * 1000,
			rejectExpiry: 10 * 1000
		});
	}

	getPlayerBadges(userId, cursor) {
		return CachedPromise(`${this.serviceId}.getPlayerBadges`, (resolve, reject) => {
			// TODO: Audit Api for error codes
			if (typeof (userId) != "number" || userId <= 0) {
				reject([{
					code: 0,
					message: "Invalid userId"
				}]);
				return;
			}

			$.get(`https://badges.roblox.com/v1/users/${userId}/badges`, {
				limit: 100,
				sortOrder: "Desc",
				cursor: cursor || ""
			}).done(function (r) {
				let response = {
					previousPageCursor: r.previousPageCursor,
					nextPageCursor: r.nextPageCursor,
					data: r.data.map(badge => {
						return {
							id: badge.id,
							name: badge.name
						};
					})
				};

				resolve(response);
			}).fail(Roblox.api.$reject(reject));
		}, [userId, cursor], {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 15 * 1000,
			queued: true
		});
	}
};

Roblox.inventory = new Roblox.Services.Inventory();

// WebGL3D
