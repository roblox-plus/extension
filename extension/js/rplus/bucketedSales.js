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

	var loadSalesInRange = function(assetId, oldestDate, upToDate) {
		return new Promise(function(resolve, reject) {
			var loadAfter = roundDownDate(oldestDate);
			var result = {};
			var days = Math.floor((upToDate.getTime() - oldestDate.getTime()) / (24 * 60 * 60 * 1000));
	
			for (let day = 0; day < days; day++) {
				let date = addDays(oldestDate, day);
				let dateKey = getDateKey(date);
				result[dateKey] = createEmptySalesArray();
			}

			loadSalesUntilDate(assetId, loadAfter, null).then(function(sales) {
				console.log(sales);

				sales.forEach(function(saleDate) {
					var dateKey = getDateKey(saleDate);
					var saleArray = result[dateKey];
					if (!saleArray) {
						saleArray = createEmptySalesArray();
						result[dateKey] = saleArray;
					}

					saleArray[saleDate.getHours()]++;
				});

				resolve(result);
			}).catch(reject);
		});
	};

	return {
		getBucketedAssetSales: $.promise.cache(function (resolve, reject, assetId, days) {
			var currentDate = new Date();
			var oldestDate = roundDownDate(addDays(currentDate, -days));

			loadSalesInRange(assetId, oldestDate, currentDate).then(resolve).catch(reject);
		}, {
			queued: true,
			resolveExpiry: 5 * 60 * 1000,
			rejectExpiry: 30 * 1000
		})
	};
})();

RPlus.bucketedSales = $.addTrigger($.promise.background("RPlus.bucketedSales", RPlus.bucketedSales));
