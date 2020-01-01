var RPlus = RPlus || {};
RPlus.bucketedSales = (function(){
	const addDays = function(date, days) {
		if (days === 0) {
			return date;
		}

		var copyDate = new Date(date);
		return new Date(copyDate.setDate(copyDate.getDate() + days));
	};

	const roundDownDate = function(date) {
		var copyDate = new Date(date);
		return new Date(copyDate.setHours(0, 0, 0, 0));
	};

	const getDateKey = function(date) {
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	};

	const createEmptySalesArray = function() {
		var sales = [];
		for (var h = 0; h < 24; h++) {
			sales.push(0);
		}

		return sales;
	};

	const createResultBuckets = function(oldestDate, upToDate) {
		var result = {};
		var days = Math.floor((upToDate.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000));

		for (let day = 0; day < days; day++) {
			let date = addDays(oldestDate, day);
			let dateKey = getDateKey(date);
			result[dateKey] = createEmptySalesArray();
		}

		return result;
	}

	const translateTransactionsToSales = function(transactions, oldestDate, upToDate) {
		var result = createResultBuckets(oldestDate, upToDate);

		transactions.forEach(function(transaction) {
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

	const translateTransactionsToRevenue = function(transactions, oldestDate, upToDate) {
		var result = createResultBuckets(oldestDate, upToDate);

		transactions.forEach(function(transaction) {
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

	const tryScanCreator = function(creator) {
		switch (creator.type) {
			case "User":
				console.log("Kicking off user transaction scan...", creator.id);

				Roblox.economyTransactions.scanUserTransactions(creator.id).then(function(userTransactionCount) {
					console.log(`Scanned all user (${creator.id}) transactions (count: ${userTransactionCount})`);
				}).catch(console.error);
				break;
			case "Group":
				console.log("Kicking off group transaction scan...", creator.id);

				Roblox.economyTransactions.scanGroupTransactions(creator.id).then(function(groupTransactionCount) {
					console.log(`Scanned all group (${creator.id}) transactions (count: ${groupTransactionCount})`);
				}).catch(console.error);
				break;
			default:
				console.warn("Unrecognized creator type:", creator.type);
		}
	};

	const getAssetTransactions = function(assetId, oldestDate) {
		return new Promise(function(resolve, reject) {
			Roblox.catalog.getAssetInfo(assetId).then(function(asset) {
				tryScanCreator(asset.creator);
				Roblox.economyTransactions.getItemTransactions("Asset", assetId, oldestDate.getTime()).then(resolve).catch(reject);
			}).catch(reject);
		});
	};

	const getGamePassTransactions = function(gamePassId, oldestDate) {
		return new Promise(function(resolve, reject) {
			Roblox.catalog.getGamePassInfo(gamePassId).then(function(gamePass) {
				tryScanCreator(asset.creator);
				Roblox.economyTransactions.getItemTransactions("GamePass", gamePassId, oldestDate.getTime()).then(resolve).catch(reject);
			}).catch(reject);
		});
	};

	const getTransactionsByItem = function(itemType, itemId, transactionsLoaded, oldestDate, reject) {
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

	return {
		getBucketedItemSales: $.promise.cache(function (resolve, reject, itemType, itemId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsByItem(itemType, itemId, function(transactions) {
				resolve(translateTransactionsToSales(transactions, oldestDate, currentDate));
			}, oldestDate, reject);
		}, {
			queued: true,
			resolveExpiry: 5 * 60 * 1000,
			rejectExpiry: 30 * 1000
		}),

		getBucketedItemRevenue: $.promise.cache(function (resolve, reject, itemType, itemId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			getTransactionsByItem(itemType, itemId, function(transactions) {
				resolve(translateTransactionsToRevenue(transactions, oldestDate, currentDate));
			}, oldestDate, reject);
		})
	};
})();

RPlus.bucketedSales = $.addTrigger($.promise.background("RPlus.bucketedSales", RPlus.bucketedSales));
