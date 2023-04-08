/*
	roblox/social.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.PrivateMessages = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.privateMessages");

		this.register([
			this.getUnreadMessageCount
		]);
	}

	getUnreadMessageCount() {
		return CachedPromise(`${this.serviceId}.getUnreadMessageCount`, (resolve, reject) => {
			$.get("https://privatemessages.roblox.com/v1/messages/unread/count").done((r) => {
				resolve(r.count);
			}).fail(Roblox.api.$reject(reject));
		}, [], {
			resolveExpiry: 30 * 1000
		});
	}
};

Roblox.privateMessages = new Roblox.Services.PrivateMessages();

// WebGL3D
