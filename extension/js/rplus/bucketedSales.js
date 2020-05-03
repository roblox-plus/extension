var RPlus = RPlus || {};
RPlus.Services = RPlus.Services || {};
RPlus.Services.BucketedSales = class extends Extension.BackgroundService {
	constructor() {
		super("RPlus.bucketedSales");

		this.knownCreators = {};

		this.register([
			this.getItemScanStatus,
			this.getBucketedItemSales,
			this.getBucketedItemRevenue,
			this.getBucketedSellerSales,
			this.getBucketedSellerRevenue,
			this.getBucketedGroupSalesByGame,
			this.getBucketedGroupRevenueByGame
		]);
	}

	addDays(date, days) {
		if (days === 0) {
			return date;
		}

		let copyDate = new Date(date);
		return new Date(copyDate.setDate(copyDate.getDate() + days));
	}

	roundDownDate(date) {
		let copyDate = new Date(date);
		return new Date(copyDate.setHours(0, 0, 0, 0));
	}

	getDateKey(date) {
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	}

	createEmptySalesArray() {
		let sales = [];
		for (let h = 0; h < 24; h++) {
			sales.push(0);
		}

		return sales;
	}

	createResultBuckets(oldestDate, upToDate) {
		let result = {};
		let days = Math.floor((upToDate.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000));

		for (let day = 0; day < days; day++) {
			let date = this.addDays(oldestDate, day);
			let dateKey = this.getDateKey(date);
			result[dateKey] = this.createEmptySalesArray();
		}

		return result;
	}

	translateTransactionsToSales(transactions, oldestDate, upToDate) {
		let result = this.createResultBuckets(oldestDate, upToDate);

		transactions.forEach((transaction) => {
			let saleDate = new Date(transaction.created);
			let dateKey = this.getDateKey(saleDate);
			let saleArray = result[dateKey];

			if (!saleArray) {
				saleArray = this.createEmptySalesArray();
				result[dateKey] = saleArray;
			}

			saleArray[saleDate.getHours()]++;
		});

		return result;
	}

	translateTransactionsToRevenue(transactions, oldestDate, upToDate) {
		let result = this.createResultBuckets(oldestDate, upToDate);

		transactions.forEach((transaction) => {
			let saleDate = new Date(transaction.created);
			let dateKey = this.getDateKey(saleDate);
			let saleArray = result[dateKey];

			if (!saleArray) {
				saleArray = this.createEmptySalesArray();
				result[dateKey] = saleArray;
			}

			saleArray[saleDate.getHours()] += transaction.robuxReceived;
		});

		return result;
	}

	tryScanCreator(creator) {
		switch (creator.type) {
			case "User":
				console.log("Kicking off user transaction scan...", creator.id);

				Roblox.economyTransactions.scanUserTransactions(creator.id).then((userTransactionCount) => {
					console.log(`Scanned all user (${creator.id}) transactions (count: ${userTransactionCount})`);
				}).catch(console.error);
				break;
			case "Group":
				console.log("Kicking off group transaction scan...", creator.id);

				Roblox.economyTransactions.scanGroupTransactions(creator.id).then((groupTransactionCount) => {
					console.log(`Scanned all group (${creator.id}) transactions (count: ${groupTransactionCount})`);
				}).catch(console.error);
				break;
			default:
				console.warn("Unrecognized creator type:", creator.type);
		}
	}

	getCreatorByItem(itemType, itemId) {
		return new Promise((resolve, reject) => {
			var cacheKey = `${itemType}:${itemId}`;
			if (this.knownCreators[cacheKey]) {
				resolve(Object.assign({}, this.knownCreators[cacheKey]));
				return;
			}

			var gotCreator = (creator) => {
				this.knownCreators[cacheKey] = creator;
				resolve(Object.assign({}, creator));
			};

			switch (itemType) {
				case "Asset":
					Roblox.catalog.getAssetInfo(itemId).then((asset) => {
						gotCreator(asset.creator);
					}).catch(reject);

					return;
				case "GamePass":
					Roblox.catalog.getGamePassInfo(itemId).then((gamePass) => {
						gotCreator(gamePass.creator);
					}).catch(reject);

					return;
				default:
					reject("Unsupported itemType: " + itemType);
					return;
			}
		});
	}

	getAssetTransactions(assetId, oldestDate) {
		return new Promise((resolve, reject) => {
			this.getCreatorByItem("Asset", assetId).then((creator) => {
				this.tryScanCreator(creator);
				Roblox.economyTransactions.getItemTransactions("Asset", assetId, oldestDate.getTime()).then(resolve).catch(reject);
			}).catch(reject);
		});
	}

	getGamePassTransactions(gamePassId, oldestDate) {
		return new Promise((resolve, reject) => {
			this.getCreatorByItem("GamePass", gamePassId).then((creator) => {
				this.tryScanCreator(creator);
				Roblox.economyTransactions.getItemTransactions("GamePass", gamePassId, oldestDate.getTime()).then(resolve).catch(reject);
			}).catch(reject);
		});
	}

	getTransactionsByItem(itemType, itemId, oldestDate) {
		switch (itemType) {
			case "Asset":
				return this.getAssetTransactions(itemId, oldestDate);
			case "GamePass":
				return this.getGamePassTransactions(itemId, oldestDate);
			default:
				return Promise.reject("Unsupported itemType: " + itemType);
		}
	}

	getTransactionsBySeller(sellerType, sellerId, oldestDate) {
		return new Promise((resolve, reject) => {
			switch (sellerType) {
				case "User":
					Roblox.economyTransactions.getUserTransactions(sellerId, oldestDate.getTime()).then(resolve).catch(reject);
					break;
				case "Group":
					Roblox.economyTransactions.getGroupTransactions(sellerId, oldestDate.getTime()).then(resolve).catch(reject);
					break;
				default:
					reject("Unsupported sllerType: " + sellerType);
					return;
			}

			this.tryScanCreator({ type: sellerType, id: sellerId });
		});
	}

	getItemScanStatus(itemType, itemId) {
		return new Promise((resolve, reject) => {
			this.getCreatorByItem(itemType, itemId).then((creator) => {
				switch (creator.type) {
					case "User":
						Roblox.economyTransactions.getUserScanStatus(creator.id).then(resolve).catch(reject);
						return;
					case "Group":
						Roblox.economyTransactions.getGroupScanStatus(creator.id).then(resolve).catch(reject);
						return;
					default:
						reject("Unsupported creator type: " + creator.type);
						return;
				}
			}).catch(reject);
		});
	}

	getBucketedItemSales(itemType, itemId, days) {
		return CachedPromise(`${this.serviceId}.getBucketedItemSales`, (resolve, reject) => {
			let currentDate = new Date();
			let oldestDate = this.roundDownDate(this.addDays(currentDate, -days));

			this.getTransactionsByItem(itemType, itemId, oldestDate).then((transactions) => {
				resolve(this.translateTransactionsToSales(transactions, oldestDate, currentDate));
			}).catch(reject);
		}, [itemType, itemId, days], {});
	}

	getBucketedItemRevenue(itemType, itemId, days) {
		return CachedPromise(`${this.serviceId}.getBucketedItemRevenue`, (resolve, reject) => {
			let currentDate = new Date();
			let oldestDate = this.roundDownDate(this.addDays(currentDate, -days));

			this.getTransactionsByItem(itemType, itemId, oldestDate).then((transactions) => {
				resolve(this.translateTransactionsToRevenue(transactions, oldestDate, currentDate));
			}).catch(reject);
		}, [itemType, itemId, days], {});
	}

	getBucketedSellerSales(sellerType, sellerId, days) {
		return CachedPromise(`${this.serviceId}.getBucketedSellerSales`, (resolve, reject) => {
			let currentDate = new Date();
			let oldestDate = this.roundDownDate(this.addDays(currentDate, -days));

			this.getTransactionsBySeller(sellerType, sellerId, oldestDate).then((transactions) => {
				resolve(this.translateTransactionsToSales(transactions, oldestDate, currentDate));
			}).catch(reject);
		}, [sellerType, sellerId, days], {});
	}

	getBucketedSellerRevenue(sellerType, sellerId, days) {
		return CachedPromise(`${this.serviceId}.getBucketedSellerRevenue`, (resolve, reject) => {
			let currentDate = new Date();
			let oldestDate = this.roundDownDate(this.addDays(currentDate, -days));

			this.getTransactionsBySeller(sellerType, sellerId, oldestDate).then((transactions) => {
				resolve(this.translateTransactionsToRevenue(transactions, oldestDate, currentDate));
			}).catch(reject);
		}, [sellerType, sellerId, days], {});
	}

	getBucketedGroupSalesByGame(groupId, days) {
		return CachedPromise(`${this.serviceId}.getBucketedGroupSalesByGame`, (resolve, reject) => {
			let currentDate = new Date();
			let oldestDate = this.roundDownDate(this.addDays(currentDate, -days));

			this.getTransactionsBySeller("Group", groupId, oldestDate).then((transactions) => {
				let filteredTransactions = {};
				let result = {};

				transactions.forEach((transaction) => {
					if (!transaction.gameId) {
						return;
					}

					if (!filteredTransactions[transaction.gameId]) {
						filteredTransactions[transaction.gameId] = [];
					}

					filteredTransactions[transaction.gameId].push(transaction);
				});

				for (let gameId in filteredTransactions) {
					result[gameId] = this.translateTransactionsToSales(filteredTransactions[gameId], oldestDate, currentDate);
				}

				// Add missing games that haven't made any money recently (better user experience).
				Roblox.games.getGroupGames(groupId).then((games) => {
					games.forEach((game) => {
						if (!result[game.id]) {
							result[game.id] = this.createResultBuckets(oldestDate, currentDate);
						}
					});

					resolve(result);
				}).catch((err) => {
					// Nice to have. Not critical.
					console.error(err);
					resolve(result);
				});
			}).catch(reject);
		}, [groupId, days], {});
	}

	getBucketedGroupRevenueByGame(groupId, days) {
		return CachedPromise(`${this.serviceId}.getBucketedGroupRevenueByGame`, (resolve, reject) => {
			let currentDate = new Date();
			let oldestDate = this.roundDownDate(this.addDays(currentDate, -days));

			this.getTransactionsBySeller("Group", groupId, oldestDate).then((transactions) => {
				let filteredTransactions = {};
				let result = {};

				transactions.forEach((transaction) => {
					if (!transaction.gameId) {
						return;
					}

					if (!filteredTransactions[transaction.gameId]) {
						filteredTransactions[transaction.gameId] = [];
					}

					filteredTransactions[transaction.gameId].push(transaction);
				});

				for (let gameId in filteredTransactions) {
					result[gameId] = this.translateTransactionsToRevenue(filteredTransactions[gameId], oldestDate, currentDate);
				}

				// Add missing games that haven't made any money recently (better user experience).
				Roblox.games.getGroupGames(groupId).then((games) => {
					games.forEach((game) => {
						if (!result[game.id]) {
							result[game.id] = this.createResultBuckets(oldestDate, currentDate);
						}
					});

					resolve(result);
				}).catch((err) => {
					// Nice to have. Not critical.
					console.error(err);
					resolve(result);
				});
			}).catch(reject);
		}, [groupId, days], {});
	}
};

RPlus.bucketedSales = new RPlus.Services.BucketedSales();
