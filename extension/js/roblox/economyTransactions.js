var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.EconomyTransactions = class extends Extension.BackgroundService {
	constructor(extension) {
		super("Roblox.economyTransactions");

		this.scanStatuses = {};
		this.transactionsMaxAge = 220; // 7 monthsish (measured in days)
		this.scanPurgeOffset = 5; // How many days to scan up to before the purge date.
		
		this.itemTypes = {
			"Asset": "Asset",
			"PrivateServer": "PrivateServer",
			"DeveloperProduct": "DeveloperProduct",
			"GamePass": "GamePass"
		};

		this.sellerTypes = {
			"User": "User",
			"Group": "Group"
		};

		this.databaseInit = {
			database: null,
			connectionError: null,
			queue: []
		};

		if (extension.executionContextType === Extension.ExecutionContextTypes.background) {
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
			}).then((database) => {
				console.log("Database connection (for economyTransactions) opened.");
				this.databaseInit.database = database;
	
				this.databaseInit.queue.forEach((p) => {
					p[0](database);
				});
			}).catch((err) => {
				console.error("Failed to connect to economyTransactions database.", err);
				this.databaseInit.connectionError = err;
	
				this.databaseInit.queue.forEach((p) => {
					p[1](err);
				});
			});
		} else {
			this.databaseInit.connectionError = "Database connection (for economyTransactions) can only be made in the background script.";
		}

		this.register([
			this.scanUserTransactions,
			this.scanGroupTransactions,
			this.getUserScanStatus,
			this.getGroupScanStatus,
			this.getItemTransactions,
			this.getUserTransactions,
			this.getGroupTransactions
		]);
	}

	getTransactionsDatabase() {
		return new Promise((resolve, reject) => {
			if (this.databaseInit.database) {
				resolve(this.databaseInit.database);
			} else if (this.databaseInit.connectionError) {
				reject(this.databaseInit.connectionError);
			} else {
				this.databaseInit.queue.push([resolve, reject]);
			}
		});
	}

	buildGroupSeller(groupId) {
		return {
			id: groupId,
			type: "Group"
		};
	}

	buildUserSeller(userId) {
		return {
			id: userId,
			type: "User"
		};
	}

	buildTransactionKey(transaction) {
		// Not using auto-increment because this is used to PUT (we don't know whether or not the transaction is already logged).
		let buyerId = transaction.buyerId.toString();
		return Number(transaction.created.toString().substring(2) + buyerId.substring(buyerId.length - 4));
	}

	getPurgeDate() {
		let date = new Date();
		return new Date(date.setDate(date.getDate() - this.transactionsMaxAge));
	}

	getMaxScanDate() {
		let date = new Date();
		return new Date(date.setDate(date.getDate() - (this.transactionsMaxAge - this.scanPurgeOffset)));
	}

	getMarketplaceFee(itemType, itemId) {
		// If the marketplace fees ever change we'll have to start taking payment date into account...
		// Currently assumes seller always has Roblox premium.

		let communityCreationAssetTypeIds = [8, 41, 42, 43, 44, 45, 46, 47];
		return new Promise((resolve, reject) => {
			if (itemType === this.itemTypes.Asset) {
				Roblox.inventory.getCollectibles(1).then((allLimiteds) => {
					let limitedAssetIds = allLimiteds.collectibles.map((limited) => {
						return limited.assetId;
					});

					if (limitedAssetIds.includes(itemId)) {
						resolve(0.3); // The user sold it because it is resellable... and they couldn't have created it... right?
						return;
					}

					// If it's an asset some asset types have different marketplace fees than others. Figure out what type of asset it is.
					Roblox.catalog.getAssetInfo(itemId).then((asset) => {
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
	}
	
	translateToTransactions(apiTransaction, seller) {
		return new Promise((resolve, reject) => {
			let transactions = [];
			let createdDate = new Date(apiTransaction.created);
			let mainTransaction = {
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
	
			if (mainTransaction.itemType === this.itemTypes.PrivateServer) {
				mainTransaction.itemId = apiTransaction.details.place.placeId;
			}

			if (apiTransaction.details.place) {
				mainTransaction.gameId = apiTransaction.details.place.universeId;
			}
	
			if (apiTransaction.currency.type !== "Robux") {
				mainTransaction.robuxSpent = 0;
			}

			const marketplaceFeeLoaded = (marketplaceFee) => {
				mainTransaction.robuxReceived = Math.floor(mainTransaction.robuxSpent * (1 - marketplaceFee));

				if (apiTransaction.details.payments) {
					apiTransaction.details.payments.forEach((payment) => {
						let paymentDate = new Date(payment.created);
						let adjustedTransaction = {
							robuxSpent: payment.currency.type === "Robux" ? payment.currency.amount : 0,
							created: paymentDate.getTime()
						};

						adjustedTransaction.robuxReceived = Math.floor(adjustedTransaction.robuxSpent * (1 - marketplaceFee));
		
						transactions.push(Object.assign({}, mainTransaction, adjustedTransaction));
					});
				} else {
					transactions.push(mainTransaction);
				}
		
				transactions.forEach((transaction) => {
					transaction.id = this.buildTransactionKey(transaction);
				});

				resolve(transactions);
			};

			if (mainTransaction.robuxSpent > 0) {
				this.getMarketplaceFee(mainTransaction.itemType, mainTransaction.itemId).then(marketplaceFeeLoaded).catch(reject);
			} else {
				marketplaceFeeLoaded(0);
			}
		});
	}

	loadTransactions(seller, transactionType, cursor) {
		return new Promise((resolve, reject) => {
			let url;
			switch (seller.type) {
				case this.sellerTypes.User:
					url = `https://economy.roblox.com/v2/users/${seller.id}/transactions`;
					break;
				case this.sellerTypes.Group:
					url = `https://economy.roblox.com/v1/groups/${seller.id}/transactions`;
					break;
				default:
					reject(`Unknown transaction seller type: ${seller.type}`);
					return;
			}

			$.get(url, {
				transactionType: transactionType,
				limit: 100,
				cursor: cursor
			}).done((data) => {
				let transactions = {
					nextPageCursor: data.nextPageCursor,
					data: []
				};

				let loadedCount = 0;
				const tryResolve = () => {
					if (++loadedCount === data.data.length) {
						resolve(transactions);
					}
				};

				if (data.data.length > 0) {
					data.data.forEach((apiTransaction) => {
						this.translateToTransactions(apiTransaction, seller).then((translatedTransactions) => {
							translatedTransactions.forEach((transaction) => {
								transactions.data.push(transaction);
							});

							tryResolve();
						}).catch(reject);
					});
				} else {
					resolve(transactions);
				}
			}).fail(Roblox.api.$reject(reject));
		});
	}
	
	loadSalesIntoDatabase(seller, cursor) {
		return new Promise((resolve, reject) => {
			this.getTransactionsDatabase().then((transactionsDatabase) => {
				this.loadTransactions(seller, "Sale", cursor).then((data) => {
					let maxSaveDate = this.getMaxScanDate();
					let filteredData = data.data.filter((transaction) => {
						return transaction.created > maxSaveDate.getTime();
					});

					if (filteredData.length > 0) {
						transactionsDatabase.economyTransactions.update(filteredData.map((transaction) => {
							return {
								item: transaction
							};
						})).then(() => {
							resolve(data);
						}).catch(reject);
					} else {
						resolve(data);
					}
				}).catch(reject);
			}).catch(reject);
		});
	}
	
	scanSeller(seller, cursor, transactionsParsed, attempts) {
		return new Promise((resolve, reject) => {
			let scanKey = seller.type + ":" + seller.id;
			this.scanStatuses[scanKey] = {
				cursor: cursor,
				count: transactionsParsed
			};

			this.loadSalesIntoDatabase(seller, cursor).then((transactions) => {
				let finalCount = transactionsParsed + transactions.data.length;

				if (transactions.nextPageCursor) {
					this.scanSeller(seller, transactions.nextPageCursor, finalCount, 1).then(resolve).catch(reject);
				} else {
					delete this.scanStatuses[scanKey];
					resolve(finalCount);
				}
			}).catch((err) => {
				console.error(err);

				if (attempts > 12) {
					delete this.scanStatuses[scanKey];
					reject(err);
				} else {
					setTimeout(() => {
						this.scanSeller(seller, cursor, transactionsParsed, attempts + 1).then(resolve).catch(reject);
					}, 10 * 1000);
				}
			});
		});
	}
	
	purgeTransactions() {
		let p = new Promise((resolve, reject) => {
			let purgeDate = this.getPurgeDate();
			this.getTransactionsDatabase().then((transactionsDatabase) => {
				transactionsDatabase.economyTransactions.query("created")
					.range({lte: purgeDate.getTime()})
					.execute()
					.then((transactions) => {
						if (transactions.length <= 0) {
							resolve();
							return;
						}

						var removePromises = transactions.map((transaction) => {
							return transactionsDatabase.economyTransactions.remove(transaction.id);
						});

						Promise.all(removePromises).then(resolve).catch(reject);
					}).catch(reject);
			}).catch(reject);
		});

		p.then((a) => {
			if (a) {
				console.log("Purged economy transactions database", a);
			}
		}).catch((e) => {
			console.error("economy transactions purge failure:", e);
		});
	}

	startDateFilter(startDateTime) {
		return (row) => {
			 if (startDateTime) { 
				 return row.created >= startDateTime;
			 }

			 return true; 
		};
	}

	scanUserTransactions(userId) {
		return CachedPromise(`${this.serviceId}.scanUserTransactions`, (resolve, reject) => {
			this.scanSeller(this.buildUserSeller(userId), null, 0, 1).then(resolve).catch(reject);
		}, [userId], {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000,
			queued: true
		});
	}

	scanGroupTransactions(groupId) {
		return CachedPromise(`${this.serviceId}.scanGroupTransactions`, (resolve, reject) => {
			this.scanSeller(this.buildGroupSeller(groupId), null, 0, 1).then(resolve).catch(reject);
		}, [groupId], {
			rejectExpiry: 60 * 1000,
			resolveExpiry: 15 * 60 * 1000,
			queued: true
		});
	}
	
	getUserScanStatus(userId) {
		return CachedPromise(`${this.serviceId}.getUserScanStatus`, (resolve, reject) => {
			resolve(this.scanStatuses[`User:${userId}`]);
		}, [userId], {
			rejectExpiry: 500,
			resolveExpiry: 500
		});
	}

	getGroupScanStatus(groupId) {
		return CachedPromise(`${this.serviceId}.getGroupScanStatus`, (resolve, reject) => {
			resolve(this.scanStatuses[`Group:${groupId}`]);
		}, [groupId], {
			rejectExpiry: 500,
			resolveExpiry: 500
		});
	}

	getItemTransactions(itemType, itemId, startDateTime) {
		return CachedPromise(`${this.serviceId}.getItemTransactions`, (resolve, reject) => {
			this.getTransactionsDatabase().then((transactionsDatabase) => {
				transactionsDatabase.economyTransactions.query("itemId")
					.only(itemId)
					.filter("itemType", itemType)
					.filter(this.startDateFilter(startDateTime))
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		}, [itemType, itemId, startDateTime], {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000
		});
	}

	getUserTransactions(userId, startDateTime) {
		return CachedPromise(`${this.serviceId}.getUserTransactions`, (resolve, reject) => {
			this.getTransactionsDatabase().then((transactionsDatabase) => {
				transactionsDatabase.economyTransactions.query("sellerId")
					.only(userId)
					.filter("sellerType", "User")
					.filter(this.startDateFilter(startDateTime))
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		}, [userId, startDateTime], {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000
		});
	}

	getGroupTransactions(groupId, startDateTime) {
		return CachedPromise(`${this.serviceId}.getGroupTransactions`, (resolve, reject) => {
			this.getTransactionsDatabase().then((transactionsDatabase) => {
				transactionsDatabase.economyTransactions.query("sellerId")
					.only(groupId)
					.filter("sellerType", "Group")
					.filter(this.startDateFilter(startDateTime))
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		}, [groupId, startDateTime], {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 10 * 1000
		});
	}
}

Roblox.economyTransactions = new Roblox.Services.EconomyTransactions(Extension.Singleton);

switch (Extension.Singleton.executionContextType) {
	case Extension.ExecutionContextTypes.background:
		setInterval(() => Roblox.economyTransactions.purgeTransactions(), 60 * 60 * 1000); // Purge old transactions once per hour.
		break;
}
