var RPlus = RPlus || {};
RPlus.bucketedSales = (function () {
	var knownCreators = {};

	const addDays = function (date, days) {
		if (days === 0) {
			return date;
		}

		var copyDate = new Date(date);
		return new Date(copyDate.setDate(copyDate.getDate() + days));
	};

	const roundDownDate = function (date) {
		var copyDate = new Date(date);
		return new Date(copyDate.setHours(0, 0, 0, 0));
	};

	const getDateKey = function (date) {
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	};

	const createEmptySalesArray = function () {
		var sales = [];
		for (var h = 0; h < 24; h++) {
			sales.push(0);
		}

		return sales;
	};

	const createResultBuckets = function (oldestDate, upToDate) {
		var result = {};
		var days = Math.floor((upToDate.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000));

		for (let day = 0; day < days; day++) {
			let date = addDays(oldestDate, day);
			let dateKey = getDateKey(date);
			result[dateKey] = createEmptySalesArray();
		}

		return result;
	}

	const translateTransactionsToSales = function (transactions, oldestDate, upToDate) {
		var result = createResultBuckets(oldestDate, upToDate);

		transactions.forEach(function (transaction) {
			var saleDate = new Date(transaction.created);
			var dateKey = getDateKey(saleDate);
			var saleArray = result[dateKey];

			if (!saleArray) {
				saleArray = createEmptySalesArray();
				result[dateKey] = saleArray;
			}

			saleArray[saleDate.getHours()]++;
		});

		return result;
	};

	const translateTransactionsToRevenue = function (transactions, oldestDate, upToDate) {
		var result = createResultBuckets(oldestDate, upToDate);

		transactions.forEach(function (transaction) {
			var saleDate = new Date(transaction.created);
			var dateKey = getDateKey(saleDate);
			var saleArray = result[dateKey];

			if (!saleArray) {
				saleArray = createEmptySalesArray();
				result[dateKey] = saleArray;
			}

			saleArray[saleDate.getHours()] += transaction.robuxReceived;
		});

		return result;
	};

	const tryScanCreator = function (creator) {
		switch (creator.type) {
			case "User":
				console.log("Kicking off user transaction scan...", creator.id);

				Roblox.economyTransactions.scanUserTransactions(creator.id).then(function (userTransactionCount) {
					console.log(`Scanned all user (${creator.id}) transactions (count: ${userTransactionCount})`);
				}).catch(console.error);
				break;
			case "Group":
				console.log("Kicking off group transaction scan...", creator.id);

				Roblox.economyTransactions.scanGroupTransactions(creator.id).then(function (groupTransactionCount) {
					console.log(`Scanned all group (${creator.id}) transactions (count: ${groupTransactionCount})`);
				}).catch(console.error);
				break;
			default:
				console.warn("Unrecognized creator type:", creator.type);
		}
	};

	const getCreatorByItem = function (itemType, itemId) {
		return new Promise(function (resolve, reject) {
			var cacheKey = `${itemType}:${itemId}`;
			if (knownCreators[cacheKey]) {
				resolve(Object.assign({}, knownCreators[cacheKey]));
				return;
			}

			var gotCreator = function(creator) {
				knownCreators[cacheKey] = creator;
				resolve(Object.assign({}, creator));
			};

			switch (itemType) {
				case "Asset":
					Roblox.catalog.getAssetInfo(itemId).then(function (asset) {
						gotCreator(asset.creator);
					}).catch(reject);
					
					return;
				case "GamePass":
					Roblox.catalog.getGamePassInfo(itemId).then(function (gamePass) {
						gotCreator(gamePass.creator);
					}).catch(reject);
					
					return;
				default:
					reject("Unsupported itemType: " + itemType);
					return;
			}
		});
	};

	const getAssetTransactions = function (assetId, oldestDate) {
		return new Promise(function (resolve, reject) {
			getCreatorByItem("Asset", assetId).then(function(creator) {
				tryScanCreator(creator);
				Roblox.economyTransactions.getItemTransactions("Asset", assetId, oldestDate.getTime()).then(resolve).catch(reject);
			}).catch(reject);
		});
	};

	const getGamePassTransactions = function (gamePassId, oldestDate) {
		return new Promise(function (resolve, reject) {
			getCreatorByItem("GamePass", gamePassId).then(function(creator) {
				tryScanCreator(creator);
				Roblox.economyTransactions.getItemTransactions("GamePass", gamePassId, oldestDate.getTime()).then(resolve).catch(reject);
			}).catch(reject);
		});
	};

	const getTransactionsByItem = function (itemType, itemId, transactionsLoaded, oldestDate, reject) {
		switch (itemType) {
			case "Asset":
				getAssetTransactions(itemId, oldestDate).then(transactionsLoaded).catch(reject);
				return;
			case "GamePass":
				getGamePassTransactions(itemId, oldestDate).then(transactionsLoaded).catch(reject);
				return;
			default:
				reject("Unsupported itemType: " + itemType);
				return;
		}
	};

	const getTransactionsBySeller = function (sellerType, sellerId, oldestDate) {
		return new Promise(function(resolve, reject) {
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

			tryScanCreator({ type: sellerType, id: sellerId });
		});
	};

	return {
		getItemScanStatus: $.promise.cache(function (resolve, reject, itemType, itemId) {
			getCreatorByItem(itemType, itemId).then(function(creator) {
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
		}, {
			rejectExpiry: 100,
			resolveExpiry: 100
		}),

		getBucketedItemSales: $.promise.cache(function (resolve, reject, itemType, itemId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsByItem(itemType, itemId, function (transactions) {
				resolve(translateTransactionsToSales(transactions, oldestDate, currentDate));
			}, oldestDate, reject);
		}),

		getBucketedItemRevenue: $.promise.cache(function (resolve, reject, itemType, itemId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsByItem(itemType, itemId, function (transactions) {
				resolve(translateTransactionsToRevenue(transactions, oldestDate, currentDate));
			}, oldestDate, reject);
		}),

		getBucketedSellerSales: $.promise.cache(function (resolve, reject, sellerType, sellerId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsBySeller(sellerType, sellerId, oldestDate).then(function (transactions) {
				resolve(translateTransactionsToSales(transactions, oldestDate, currentDate));
			}).catch(reject);
		}),

		getBucketedSellerRevenue: $.promise.cache(function (resolve, reject, sellerType, sellerId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsBySeller(sellerType, sellerId, oldestDate).then(function (transactions) {
				resolve(translateTransactionsToRevenue(transactions, oldestDate, currentDate));
			}).catch(reject);
		}),

		getBucketedGroupSalesByGame: $.promise.cache(function (resolve, reject, groupId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsBySeller("Group", groupId, oldestDate).then(function (transactions) {
				var filteredTransactions = {};
				var result = {};

				transactions.forEach(function(transaction) {
					if (!transaction.gameId) {
						return;
					}

					if (!filteredTransactions[transaction.gameId]) {
						filteredTransactions[transaction.gameId] = [];
					}

					filteredTransactions[transaction.gameId].push(transaction);
				});

				for (let gameId in filteredTransactions) {
					result[gameId] = translateTransactionsToSales(filteredTransactions[gameId], oldestDate, currentDate);
				}

				// Add missing games that haven't made any money recently (better user experience).
				Roblox.games.getGroupGames(groupId).then(function(games) {
					games.forEach(function(game) {
						if (!result[game.id]) {
							result[game.id] = createResultBuckets(oldestDate, currentDate);
						}
					});

					resolve(result);
				}).catch(function(err) {
					// Nice to have. Not critical.
					console.error(err);
					resolve(result);
				});
			}).catch(reject);
		}),

		getBucketedGroupRevenueByGame: $.promise.cache(function (resolve, reject, groupId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsBySeller("Group", groupId, oldestDate).then(function (transactions) {
				var filteredTransactions = {};
				var result = {};

				transactions.forEach(function(transaction) {
					if (!transaction.gameId) {
						return;
					}

					if (!filteredTransactions[transaction.gameId]) {
						filteredTransactions[transaction.gameId] = [];
					}

					filteredTransactions[transaction.gameId].push(transaction);
				});

				for (let gameId in filteredTransactions) {
					result[gameId] = translateTransactionsToRevenue(filteredTransactions[gameId], oldestDate, currentDate);
				}

				// Add missing games that haven't made any money recently (better user experience).
				Roblox.games.getGroupGames(groupId).then(function(games) {
					games.forEach(function(game) {
						if (!result[game.id]) {
							result[game.id] = createResultBuckets(oldestDate, currentDate);
						}
					});

					resolve(result);
				}).catch(function(err) {
					// Nice to have. Not critical.
					console.error(err);
					resolve(result);
				});
			}).catch(reject);
		})
	};
})();

RPlus.bucketedSales = $.addTrigger($.promise.background("RPlus.bucketedSales", RPlus.bucketedSales));
