var RPlus = RPlus || {};
RPlus.Services = RPlus.Services || {};
RPlus.Services.RobuxHistory = class extends Extension.BackgroundService {
	constructor(extension) {
		super("RPlus.robuxHistory");

		this.robuxHistoryMaxAge = 32; // Measured in days - 30 days is up to 43,200 data points
		this.currencyHolderTypes = {
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
				server: "currencyBalances",
				version: 1,
				schema: {
					robuxHistory: {
						key: {
							keyPath: ["currencyHolderType", "currencyHolderId", "robuxDate"]
						},
						indexes: {
							currencyHolderType: {},
							currencyHolderId: {},
							robuxDate: {}
						}
					}
				}
			}).then((database) => {
				console.log("Database connection (for robuxHistory) opened.");
				this.databaseInit.database = database;

				this.databaseInit.queue.forEach((p) => {
					p[0](database);
				});
			}).catch((err) => {
				console.error("Failed to connect to robuxHistory database.", err);
				this.databaseInit.connectionError = err;
	
				this.databaseInit.queue.forEach((p) => {
					p[1](err);
				});
			});
		} else {
			this.databaseInit.connectionError = "Database connection (for robuxHistory) can only be made in the background script.";
		}

		this.register([
			this.getRobuxHistory,
			this.recordRobuxHistory,
			this.recordAuthenticatedUserRobux
		]);
	}
	
	getPurgeDate() {
		let date = new Date();
		return new Date(date.setDate(date.getDate() - this.robuxHistoryMaxAge));
	}

	getDatabase() {
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

	isEnabled() {
		return new Promise((resolve, reject) => {
			Extension.Storage.Singleton.get("robuxHistoryEnabled").then((robuxHistoryEnabled) => {
				if (robuxHistoryEnabled) {
					Roblox.users.getAuthenticatedUser().then((user) => {
						RPlus.premium.isPremium(user.id).then(resolve).catch(reject);
					}).catch(reject);
				} else {
					resolve(false);
				}
			}).catch(reject);
		});
	}

	getRobuxHistory(currencyHolderType, currencyHolderId, startDateTime, endDateTime) {
		return new Promise((resolve, reject) => {
			this.getDatabase().then((currencyBalancesDatabase) => {
				currencyBalancesDatabase.robuxHistory.query("robuxDate")
					.range({
						gte: startDateTime,
						lte: endDateTime
					})
					.filter(row => row.currencyHolderType == currencyHolderType && row.currencyHolderId == currencyHolderId)
					.execute()
					.then(resolve).catch(reject);
			}).catch(reject);
		});
	}

	recordAuthenticatedUserRobux(robux) {
		return new Promise((resolve, reject) => {
			this.isEnabled().then((enabled) => {
				if (!enabled) {
					resolve(false);
					return;
				}
	
				Roblox.users.getAuthenticatedUser().then((user) => {
					this.recordRobuxHistory(this.currencyHolderTypes.User, user.id, robux).then(() => {
						resolve(true);
					}).catch(reject);
				}).catch(reject);
			}).catch(reject);
		});
	}

	recordRobuxHistory(currencyHolderType, currencyHolderId, robux) {
		return new Promise((resolve, reject) => {
			if (!this.currencyHolderTypes[currencyHolderType]) {
				reject(`Invalid currencyHolderType: ${currencyHolderType}`);
				return;
			}

			let robuxDateTime = math.floor(+new Date, 60 * 1000);
			this.getDatabase().then((currencyBalancesDatabase) => {
				currencyBalancesDatabase.robuxHistory.update({
					currencyHolderType: currencyHolderType,
					currencyHolderId: currencyHolderId,
					robux: robux,
					robuxDate: robuxDateTime
				}).then(() => {
					resolve({});
				}).catch(reject);
			}).catch(reject);
		});
	}

	purgeRobuxHistory() {
		return new Promise((resolve, reject) => {
			let purgeDate = this.getPurgeDate();
			this.getDatabase().then((currencyBalancesDatabase) => {
				currencyBalancesDatabase.robuxHistory.query("robuxDate")
					.range({lte: purgeDate.getTime()})
					.execute()
					.then((robuxHistory) => {
						if (robuxHistory.length <= 0) {
							resolve();
							return;
						}

						var removePromises = robuxHistory.map((robuxHistoryRecord) => {
							return currencyBalancesDatabase.robuxHistory.remove({
								"eq": [robuxHistoryRecord.currencyHolderType, robuxHistoryRecord.currencyHolderId, robuxHistoryRecord.robuxDate]
							});
						});

						Promise.all(removePromises).then(resolve).catch(reject);
					}).catch(reject);
			}).catch(reject);
		});
	}
};

RPlus.robuxHistory = new RPlus.Services.RobuxHistory(Extension.Singleton);

switch (Extension.Singleton.executionContextType) {
	case Extension.ExecutionContextTypes.background:
		setInterval(() => {
			RPlus.robuxHistory.purgeRobuxHistory().then(() => {
				// successfully purged history
			}).catch(console.warn);
		}, 60 * 60 * 1000); // Purge old Robux history once per hour.
		break;
}
