var RPlus = RPlus || {};
RPlus.bucketedSales = (function(){
	var addDays = function(date, days) {
		if (days === 0) {
			return date;
		}

		var copyDate = new Date(date);
		return new Date(copyDate.setDate(copyDate.getDate() + days));
	};

	var roundDownDate = function(date) {
		var copyDate = new Date(date);
		return new Date(copyDate.setHours(0, 0, 0, 0));
	};

	var loadSales = function(assetId, cursor, attempts) {
		return new Promise(function(resolve, reject) {
			$.get("https://inventory.roblox.com/v2/assets/" + assetId + "/owners", {
				cursor: cursor,
				limit: 100,
				sortOrder: "Desc"
			}).done(function(r) {
				resolve({
					nextPageCursor: r.nextPageCursor,
					data: r.data.map(function(o) {
						return new Date(o.created);
					})
				});
			}).fail(function (jxhr, errors) {
				if (attempts <= 12) {
					setTimeout(function() {
						loadSales(assetId, cursor, (attempts || 0) + 1).then(resolve).catch(reject);
					}, 10 * 1000);
				} else {
					reject(errors);
				}
			});
		});
	};

	var loadSalesUntilDate = function(assetId, stopDate, cursor) {
		return new Promise(function(resolve, reject) {
			loadSales(assetId, cursor).then(function(sales) {
				var filteredSales = sales.data.filter(function(saleDate) {
					return saleDate.getTime() >= stopDate.getTime()
				}).reverse();

				if (filteredSales.length !== sales.data.length) {
					// We found the stop date because we filtered out at least one sale.
					resolve(filteredSales);
				} else {
					if (sales.nextPageCursor) {
						loadSalesUntilDate(assetId, stopDate, sales.nextPageCursor).then(function(moreSales) {
							resolve(moreSales.concat(filteredSales));
						}).catch(reject);
					} else {
						filteredSales.shift(); // If we're on the last page: since we're loading in descending order assume the first owner is the creator and is not counted.
						resolve(filteredSales);
					}
				}
			}).catch(reject);
		});
	};

	var getDateKey = function(date) {
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	};

	var createEmptySalesArray = function() {
		var sales = [];
		for (var h = 0; h < 24; h++) {
			sales.push(0);
		}

		return sales;
	};

	var loadSalesInRange = function(assetId, assetSalesBucket, oldestDate, upToDate) {
		return new Promise(function(resolve, reject) {
			var days = Math.floor((upToDate.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000));
			var upToDateKey = getDateKey(upToDate);
			var loadAfter = roundDownDate(oldestDate);
			var result = {};
	
			for (let day = 0; day < days; day++) {
				let date = addDays(oldestDate, day);
				let dateKey = getDateKey(date);
				let sales = assetSalesBucket.sales[dateKey];

				if (sales) {
					loadAfter = roundDownDate(addDays(date, 1));
					result[dateKey] = sales;
				} else {
					result[dateKey] = createEmptySalesArray();
				}
			}

			console.log(`Load remaining sales after ${loadAfter}`);
			loadSalesUntilDate(assetId, loadAfter, null).then(function(sales) {
				console.log(sales);

				sales.forEach(function(saleDate) {
					var dateKey = getDateKey(saleDate);
					var saleArray = result[dateKey];
					if (!saleArray) {
						console.warn(`Missing saleArray: ${dateKey} (${assetId})`);
						saleArray = createEmptySalesArray();
						result[dateKey] = saleArray;
					}

					saleArray[saleDate.getHours()]++;

					if (dateKey !== upToDateKey) {
						// Don't save sales for the current day. It's not finished.
						assetSalesBucket.sales[dateKey] = saleArray;
					}
				});

				resolve(result);
			}).catch(reject);
		});
	};

	return {
		getBucketedAssetSales: $.promise.cache(function (resolve, reject, assetId, days) {
			storage.get("bucketedAssetSales", function(buckets) {
				buckets = buckets || {};

				var currentDate = new Date();
				var oldestDate = roundDownDate(addDays(currentDate, -days));
				var assetSalesBucket = buckets[assetId] || {
					sales: {}
				};

				loadSalesInRange(assetId, assetSalesBucket, oldestDate, currentDate).then(function(result) {
					if (Object.keys(assetSalesBucket.sales).length > 0) {
						buckets[assetId] = assetSalesBucket;

						storage.set("bucketedAssetSales", buckets, function() {
							resolve(result);
						});
					} else {
						resolve(result);
					}
				}).catch(reject);
			});
		}, {
			queued: true
		})
	};
})();

RPlus.bucketedSales = $.addTrigger($.promise.background("RPlus.bucketedSales", RPlus.bucketedSales));
