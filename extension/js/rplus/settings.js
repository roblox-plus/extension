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

				let upload = `<roblox${encodeURIComponent(JSON.stringify(ns))}</roblox>`;
				$.post(`https://data.roblox.com/Data/Upload.ashx?assetid=311113112&type=Model&length=${upload.length}`, upload).done((r) => {
					resolve(ns);
				}).fail(Roblox.api.$reject(reject));
			}).catch(reject);
		});
	}
};

RPlus.settings = new RPlus.Services.Settings();

if (Extension.Singleton.executionContextType == Extension.ExecutionContextTypes.background) {
	/* Upload models with a post request */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
		if (url.path(details.url) == "/Data/Upload.ashx") {
			let newhead = [];
			let headers = {
				"User-Agent": "Roblox/WinInet",
				"Host": "data.roblox.com",
				"Accept": "*/*",
				"Accept-Encoding": "deflate, gzip",
				"Cookie": "",
				"Content-Type": "application/xml",
				"Requester": "Client",
				"Content-Length": url.param("length", details.url)
			};

			for (let n in details.requestHeaders) {
				let na = details.requestHeaders[n].name;
				if (headers.hasOwnProperty(na)) {
					newhead.push({ name: na, value: headers[na] || details.requestHeaders[n].value });
					delete headers[na];
				}
			}

			for (let n in headers) {
				newhead.push({ name: n, value: headers[n] });
			}

			return { requestHeaders: newhead };
		}
	}, { urls: ["*://data.roblox.com/Data/*"] }, ["requestHeaders", "blocking", "extraHeaders"]);
}

// WebGL3D
