var RPlus = RPlus || {};
RPlus.Services = RPlus.Services || {};
RPlus.Services.Settings = class extends Extension.BackgroundService {
	constructor() {
		super("RPlus.settings");
		
		this.settingFields = {
			"updateLog": "", 
			"serialTracker": true, 
			"checkPremiumOnServer": false, 
			"updateLogPost": "",
			"sponsoredCatalogItemsEnabled": false,
			"gameServerCap": 1261
		};

		this.register([
			this.get,
			this.set
		]);
	}

	get() {
		return CachedPromise(`${this.serviceId}.get`, (resolve, reject) => {
			Roblox.content.getAssetContents(311113112).then(function (r) {
				try {
					resolve(JSON.parse(decodeURIComponent(r.substring(7, r.length - 9))));
				} catch (e) {
					reject(e);
				}
			}).catch(reject);
		}, [], {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 10 * 1000
		});
	}

	set(arg) {
		return QueuedPromise(`${this.serviceId}.set`, (resolve, reject) => {
			if (type(arg) !== "object") {
				reject([{
					code: 0,
					message: "Expected arg to be object"
				}]);
				return;
			}

			this.get().then((oldSettings) => {
				let ns = {};
				for (let n in this.settingFields) {
					if (typeof (this.settingFields[n]) === typeof (arg[n])) {
						ns[n] = arg[n];
					} else {
						ns[n] = oldSettings.hasOwnProperty(n) ? oldSettings[n] : this.settingFields[n];
					}
				}

				fetch(`https://data.roblox.com/Data/Upload.ashx?assetid=311113112&type=Model`, {
					method: 'POST',
					headers: {
						"Content-Type": "application/xml",
						"Requester": "Client"
					},
					body: `<roblox${encodeURIComponent(JSON.stringify(ns))}</roblox>`
				}).then(response => {
					if (!response.ok) {
						console.warn('Failed to upload asset', response);
						reject('Failed to send request');
					}

					resolve(ns);
				}).catch(reject);
			}).catch(reject);
		});
	}
};

RPlus.settings = new RPlus.Services.Settings();

// WebGL3D
