var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.GameBadges = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.gameBadges");

		this.badgeAwardDateProcessor = new BatchItemProcessor({
			processDelay: 100
		}, this.processBadgeAwardDates.bind(this), console.error.bind(console, "Roblox.gameBadges"), this.getBadgeAwardItems.bind(this));
		
		this.register([
			this.getBadgeAwardedDate
		]);
	}

	getIdFromUrl(url) {
		return Number((url.match(/\/badges\/(\d+)\//i) || ["", 0])[1]) || 0;
	}

	getBadgeAwardedDate(userId, badgeId) {
		return CachedPromise("Roblox.gameBadges.getBadgeAwardedDate", (resolve, reject) => {
			this.badgeAwardDateProcessor.push({
				userId: userId,
				badgeId: badgeId
			}).then(resolve).catch(reject);
		}, [userId, badgeId], {
			rejectExpiry: 5 * 1000,
			resolveExpiry: 60 * 1000
		});
	}

	getBadgeAwardItems(queue, batchSize) {
		let userId = 0;
		let batch = [];

		for (let i in queue) {
			let item = queue[i];

			if (userId) {
				if (item.item.userId === userId) {
					batch.push(item);
				}
			} else {
				userId = item.item.userId;
				batch.push(item);
			}

			if (batch.length >= batchSize) {
				break;
			}
		}

		return batch;
	}

	processBadgeAwardDates(batchItems) {
		return new Promise((resolve, reject) => {
			let userId = batchItems[0].userId;
			let batchMap = {};

			batchItems.forEach(batchItem => {
				batchMap[batchItem.badgeId] = batchItem;
			});

			$.get(`https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates`, {
				badgeIds: Object.keys(batchMap).join(",")
			}).done((awardedDates) => {
				let result = [];
				let dateMap = {};

				awardedDates.data.forEach(award => {
					dateMap[award.badgeId] = award.awardedDate;
				});

				for (let badgeId in batchMap) {
					result.push({
						item: batchMap[badgeId],
						value: dateMap[badgeId],
						success: true
					});
				}

				resolve(result);
			}).fail((jxhr, errors) => { 
				reject(errors);
			});
		});
	}
}

Roblox.gameBadges = new Roblox.Services.GameBadges();

// WebGL3D
