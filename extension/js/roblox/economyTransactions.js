var Roblox = Roblox || {};
Roblox.economyTransactions = Roblox.economyTransactions || (function() {
	var scanStatuses = {};
	var transactionsMaxAge = 220; // 7 monthsish (measured in days)
	var scanPurgeOffset = 5; // How many days to scan up to before the purge date.

	const getTransactionsDatabase = (function() {
		var transactionsDatabase;
		var connectionError;
		var waitingForDatabase = [];

		if (ext.isBackground) {
			db.open({
				server: "economyTransactions",
				version: 1,
				schema: {
					economyTransactions: {
						key: {
							// TODO: Use keyPath: ["created", "buyerId", "itemId"]
							// First: Figure out how to delete rows with a multi-primary key.
							keyPath: "id"
						},
						indexes: {
							gameId: {},
							itemId: {},
							sellerId: {},
							created: {}
						}
					}
				}
			}).then(function(database) {
				console.log("Database connection (for economyTransactions) opened.");
				transactionsDatabase = database;
	
				waitingForDatabase.forEach(function(p) {
					p[0](database);
				});
			}).catch(function(err) {
				console.error("Failed to connect to economyTransactions database.", err);
				connectionError = err;
	
				waitingForDatabase.forEach(function(p) {
					p[1](err);
				});
			});
		} else {
			connectionError = "Database connection (for economyTransactions) can only be made in the background script.";
		}

		return function() {
			return new Promise(function(resolve, reject) {
				if (transactionsDatabase) {
					resolve(transactionsDatabase);
				} else if (connectionError) {
					reject(connectionError);
				} else {
					waitingForDatabase.push([resolve, reject]);
				}
			});
		};
	})();

	const buildGroupSeller = function(groupId) {
		return {
			id: groupId,
			type: "Group"
		};
	};

	const buildUserSeller = function(userId) {
		return {
			id: userId,
			type: "User"
		};
	};

	const buildTransactionKey = function(transaction) {
		// Not using auto-increment because this is used to PUT (we don't know whether or not the transaction is already logged).
		var buyerId = transaction.buyerId.toString();
		return Number(transaction.created.toString().substring(2) + buyerId.substring(buyerId.length - 4));
	};

	const getPurgeDate = function() {
		var date = new Date();
		return new Date(date.setDate(date.getDate() - transactionsMaxAge));
	};

	const getMaxScanDate = function() {
		var date = new Date();
		return new Date(date.setDate(date.getDate() - (transactionsMaxAge - scanPurgeOffset)));
	};

	const getMarketplaceFee = function(itemType, itemId) {
		// If the marketplace fees ever change we'll have to start taking payment date into account...
		// Currently assumes seller always has Roblox premium.

		var communityCreationAssetTypeIds = [8, 41, 42, 43, 44, 45, 46, 47];
		return new Promise(function(resolve, reject) {
			if (itemType === "Asset") {
				Roblox.inventory.getCollectibles(1).then(function(allLimiteds) {
					var limitedAssetIds = allLimiteds.collectibles.map(function(limited) {
						return limited.assetId;
					});

					if (limitedAssetIds.includes(itemId)) {
						resolve(0.3); // The user sold it because it is resellable... and they couldn't have created it... right?
						return;
					}

					// If it's an asset some asset types have different marketplace fees than others. Figure out what type of asset it is.
					Roblox.catalog.getAssetInfo(itemId).then(function(asset) {
						if (asset.isLimited && asset.creator.id === 1) {
							// This check is here in case Roblox is missing the limited.
							resolve(0.3);
							return;
						}

						if (communityCreationAssetTypeIds.includes(asset.assetTypeId)) {
							resolve(0.7); // :(
						} else {
							resolve(0.3);
						}
					}).catch(reject);
				}).catch(reject);
				
			} else { 
				// Right now everything _should_ have a 30% marketplace fee.
				resolve(0.3);
			}
		});
	};

	const translateToTransactions = function(apiTransaction, seller) {
		return new Promise(function(resolve, reject) {
			var transactions = [];
			var createdDate = new Date(apiTransaction.created);
			var mainTransaction = {
				// Currency
				robuxSpent: apiTransaction.currency.amount,
				robuxReceived: 0, // Calculated below.
	
				// Item
				itemId: apiTransaction.details.id,
				itemType: apiTransaction.details.type,
	
				// Buyer
				buyerId: apiTransaction.agent.id,
				buyerType: apiTransaction.agent.type,
	
				// Seller
				sellerId: seller.id,
				sellerType: seller.type,

				// Location
				gameId: null,
				
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
				// getTime() always uses UTC for time representation.
				// No need to worry about timezones here.
				created: createdDate.getTime()
			};
	
			if (mainTransaction.itemType === "PrivateServer") {
				mainTransaction.itemId = apiTransaction.details.place.placeId;
			}

			if (apiTransaction.details.place) {
				mainTransaction.gameId = apiTransaction.details.place.universeId;
			}
	
			if (apiTransaction.currency.type !== "Robux") {
				mainTransaction.robuxSpent = 0;
			}

			var marketplaceFeeLoaded = function(marketplaceFee) {
				mainTransaction.robuxReceived = Math.floor(mainTransaction.robuxSpent * (1 - marketplaceFee));

				if (apiTransaction.details.payments) {
					apiTransaction.details.payments.forEach(function(payment) {
						var paymentDate = new Date(payment.created);
						var adjustedTransaction = {
							robuxSpent: payment.currency.type === "Robux" ? payment.currency.amount : 0,
							created: paymentDate.getTime()
						};

						adjustedTransaction.robuxReceived = Math.floor(adjustedTransaction.robuxSpent * (1 - marketplaceFee));
		
						transactions.push(Object.assign({}, mainTransaction, adjustedTransaction));
					});
				} else {
					transactions.push(mainTransaction);
				}
		
				transactions.forEach(function(transaction) {
					transaction.id = buildTransactionKey(transaction);
				});

				resolve(transactions);
			};

			if (mainTransaction.robuxSpent > 0) {
				getMarketplaceFee(mainTransaction.itemType, mainTransaction.itemId).then(marketplaceFeeLoaded).catch(reject);
			} else {
				marketplaceFeeLoaded(0);
			}
		});
	};

	var loadTransactions = function(seller, transactionType, cursor) {
		return new Promise(function(resolve, reject) {
			var url;
			switch (seller.type) {
				case "User":
					url = `https://economy.roblox.com/v1/users/${seller.id}/transactions`;
					break;
				case "Group":
					url = `https://economy.roblox.com/v1/groups/${seller.id}/transactions`;
					break;
				default:
					reject(`Unknown transaction seller type: ${seller.type}`)
					return;
			}

			$.get(url, {
				transactionType: transactionType,
				limit: 100,
				cursor: cursor
			}).done(function(data) {
				var transactions = {
					nextPageCursor: data.nextPageCursor,
					data: []
				};

				var loadedCount = 0;
				var tryResolve = function() {
					if (++loadedCount === data.data.length) {
						resolve(transactions);
					}
				};

				if (data.data.length > 0) {
					data.data.forEach(function(apiTransaction) {
						translateToTransactions(apiTransaction, seller).then(function(translatedTransactions) {
							translatedTransactions.forEach(function(transaction) {
								transactions.data.push(transaction);
							});

							tryResolve();
						}).catch(reject);
					});
				} else {
					resolve(transactions);
				}
			}).fail(function(jxhr, errors) {
				reject(errors);
			});
		});
	};

	var loadSalesIntoDatabase = function(seller, cursor) {
		return new Promise(function(resolve, reject) {
			getTransactionsDatabase().then(function(transactionsDatabase) {
				loadTransactions(seller, "Sale", cursor).then(function(data) {
					var maxSaveDate = getMaxScanDate();
					var filteredData = data.data.filter(function(transaction) {
						return transaction.created > maxSaveDate.getTime();
					});

					if (filteredData.length > 0) {
						transactionsDatabase.economyTransactions.update(filteredData.map(function(transaction) {
							return {
								item: transaction
							};
						})).then(function() {
							resolve(data);
						}).catch(reject);
					} else {
						resolve(data);
					}
				}).catch(reject);
			}).catch(reject);
		});
	};

	var scanSeller = function(seller, cursor, transactionsParsed, attempts) {
		return new Promise(function(resolve, reject) {
			var scanKey = seller.type + ":" + seller.id;
			scanStatuses[scanKey] = {
				cursor: cursor,
				count: transactionsParsed
			};

			loadSalesIntoDatabase(seller, cursor).then(function(transactions) {
				var finalCount = transactionsParsed + transactions.data.length;

				if (transactions.nextPageCursor) {
					scanSeller(seller, transactions.nextPageCursor, finalCount, 1).then(resolve).catch(reject);
				} else {
					delete scanStatuses[scanKey];
					resolve(finalCount);
				}
			}).catch(function(err) {
				console.error(err);

				if (attempts > 12) {
					delete scanStatuses[scanKey];
					reject(err);
				} else {
					setTimeout(function() {
						scanSeller(seller, cursor, transactionsParsed, attempts + 1).then(resolve).catch(reject);
					}, 10 * 1000);
				}
			});
		});
	};

	const purgeTransactions = function() {
		var p = new Promise(function(resolve, reject) {
			var purgeDate = getPurgeDate();
			getTransactionsDatabase().then(function(transactionsDatabase) {
				transactionsDatabase.economyTransactions.query("created")
					.range({lte: purgeDate.getTime()})
					.execute()
					.then(function(transactions){
						if (transactions.length <= 0) {
							resolve();
							return;
						}

						var removePromises = transactions.map(function(transaction) {
							return transactionsDatabase.economyTransactions.remove(transaction.id);
						});

						Promise.all(removePromises).then(resolve).catch(reject);
					}).catch(reject);
			}).catch(reject);
		});

		p.then(function(a) {
			if (a) {
				console.log("Purged economy transactions database", a);
			}
		}).catch(function(e) {
			console.error("economy transactions purge failure:", e);
		});
	};

	const startDateFilter = function(startDateTime) {
		return function(row) {
			 if (startDateTime) { 
				 return row.created >= startDateTime;
			 }

			 return true; 
		};
	};

	setInterval(purgeTransactions, 60 * 60 * 1000); // Purge old transactions once per hour.

	return {
		itemTypes: {
			"Asset": "Asset",
			"PrivateServer": "PrivateServer",
			"DeveloperProduct": "DeveloperProduct",
			"GamePass": "GamePass"
		},

		sellerTypes: {
			"User": "User",
			"Group": "Group"
		},

		scanUserTransactions: $.promise.cache(function (resolve, reject, userId) {
			scanSeller(buildUserSeller(userId), null, 0, 1).then(resolve).catch(reject);
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000,
			queued: true
		}),

		scanGroupTransactions: $.promise.cache(function (resolve, reject, groupId) {
			scanSeller(buildGroupSeller(groupId), null, 0, 1).then(resolve).catch(reject);
		}, {
			rejectExpiry: 60 * 1000,
			resolveExpiry: 15 * 60 * 1000,
			queued: true
		}),

		getUserScanStatus: $.promise.cache(function (resolve, reject, userId) {
			resolve(scanStatuses["User:" + userId]);
		}, {
			rejectExpiry: 500,
			resolveExpiry: 500
		}),

		getGroupScanStatus: $.promise.cache(function (resolve, reject, groupId) {
			resolve(scanStatuses["Group:" + groupId]);
		}, {
			rejectExpiry: 500,
			resolveExpiry: 500
		}),

		getItemTransactions: $.promise.cache(function (resolve, reject, itemType, itemId, startDateTime) {
			getTransactionsDatabase().then(function(transactionsDatabase) {
				transactionsDatabase.economyTransactions.query("itemId")
					.only(itemId)
					.filter("itemType", itemType)
					.filter(startDateFilter(startDateTime))
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000
		}),

		getUserTransactions: $.promise.cache(function(resolve, reject, userId, startDateTime) {
			getTransactionsDatabase().then(function(transactionsDatabase) {
				transactionsDatabase.economyTransactions.query("sellerId")
					.only(userId)
					.filter("sellerType", "User")
					.filter(startDateFilter(startDateTime))
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000
		}),

		getGroupTransactions: $.promise.cache(function(resolve, reject, groupId, startDateTime) {
			getTransactionsDatabase().then(function(transactionsDatabase) {
				transactionsDatabase.economyTransactions.query("sellerId")
					.only(groupId)
					.filter("sellerType", "Group")
					.filter(startDateFilter(startDateTime))
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		}, {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000
		})
	};
})();

Roblox.economyTransactions = $.addTrigger($.promise.background("Roblox.economyTransactions", Roblox.economyTransactions));
