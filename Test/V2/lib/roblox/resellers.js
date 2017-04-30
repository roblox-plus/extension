/*
	roblox/resellers.js [04/29/2017]
*/
var Roblox = Roblox || {};

Roblox.resellers = (function () {
	return {
		getResellers: $.promise.cache(function (resolve, reject, assetId, cursor) {
			Roblox.catalog.getAssetInfo(assetId).then(function (asset) {
				if (!asset.isLimited) {
					reject([{
						code: 0,
						message: "Asset is not resellable"
					}]);
					return;
				}
				if (!asset.productId) {
					reject([{
						code: 0,
						message: "Asset does not have a product"
					}]);
					return;
				}

				cursor = typeof (cursor) == "number" ? cursor : 1;
				$.get("https://www.roblox.com/asset/resellers", { maxRows: 100, startIndex: (cursor - 1) * 100, productId: asset.productId }).done(function (data) {
					if (typeof (data.data) != "object") {
						reject([{
							code: 0,
							message: "Resellers request failed."
						}]);
						return;
					}

					var resellers = [];
					data.data.Resellers.forEach(function (sale) {
						resellers.push({
							userAssetId: sale.UserAssetId,
							seller: {
								id: sale.SellerId,
								name: sale.SellerName,
								type: "User"
							},
							serialNumber: sale.SerialNumber,
							price: sale.Price
						});
					});

					resolve({
						previousPageCursor: cursor > 1 ? cursor - 1 : null,
						nextPageCursor: data.data.AreMoreAvailable ? cursor + 1 : null,
						data: resellers
					});
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 5 * 1000,
			queued: true
		}),

		getResaleData: $.promise.cache(function (resolve, reject, assetId) {
			Roblox.catalog.getAssetInfo(assetId).then(function (asset) {
				if (!asset.isLimited) {
					reject([{
						code: 0,
						message: "Asset is not resellable"
					}]);
					return;
				}

				$.get("https://www.roblox.com/asset/" + asset.id + "/sales-data").done(function (data) {
					if (typeof (data.data) != "object") {
						reject([{
							code: 0,
							message: data.error || "Resale data request failed"
						}]);
						return;
					}

					var salesChartData = data.data.HundredEightyDaySalesChart.split("|");
					var volumeChartData = data.data.HundredEightyDayVolumeChart.split("|");
					var salesChart = [];

					for (var n = 0; n < Math.min(salesChartData.length, volumeChartData.length); n++) {
						var sale = salesChartData[n].split(",");
						var volume = volumeChartData[n].split(",");
						var date = Number(sale[0]) || 0;
						if (date > 0) {
							salesChart.unshift({
								date: date,
								volume: Number(volume[1]) || 0,
								averagePrice: Number(sale[1]) || 0
							});
						}
					}

					resolve({
						averagePrice: Number(data.data.AveragePrice) || 0,
						salesChart: salesChart
					});
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 5 * 1000,
			queued: true
		}),

		getOwnedResaleItems: $.promise.cache(function (resolve, reject, assetId) {
			Roblox.catalog.getAssetInfo(assetId).then(function (asset) {
				if (!asset.isLimited) {
					reject([{
						code: 0,
						message: "Asset is not resellable"
					}]);
					return;
				}

				$.get(Roblox.catalog.getAssetUrl(asset.id, asset.name)).done(function (r) {
					var items = [];
					r = $._(r);

					r.find("#sell-modal-content .serial-dropdown>option").each(function () {
						items.push({
							userAssetId: Number($(this).val()),
							serialNumber: Number($(this).text().trim().split(/\s+/)[0].replace(/\D+/g, "")) || null,
							isForSale: false
						});
					});

					r.find("#take-off-sale-modal-content .serial-dropdown>option").each(function () {
						items.push({
							userAssetId: Number($(this).val()),
							serialNumber: Number($(this).text().trim().split(/\s+/)[0].replace(/\D+/g, "")) || null,
							isForSale: true
						});
					});

					resolve(items);
				}, function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			queued: true
		})
	};
})();

Roblox.resellers = $.addTrigger($.promise.background("Roblox.resellers", Roblox.resellers));

// WebGL3D
