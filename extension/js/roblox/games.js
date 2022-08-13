/*
	roblox/games.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Games = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.games");

		let securityParameters = $.param({ verification: Extension.Singleton.id, _: +new Date });
		this.launchFrame = $("<iframe id=\"roblox-plus-game-launcher\">").hide();
		this.baseLaunchUrl = "https://assetgame.roblox.com/game/PlaceLauncher.ashx?";
		this.authTicketUrl = `https://auth.roblox.com/v1/authentication-ticket?${securityParameters}`;
		this.refererOverrideValue = "https://www.roblox.com/users/48103520/profile?roblox=plus";
		this.launchMessenger = new Extension.Messaging(this.extension, `Extension.BackgroundService.${this.serviceId}.ProtocolLaunchMessenger`, this.tryLaunchProtocolUrl.bind(this));

		this.register([
			this.getAuthTicket,
			this.getVipServerById,
			this.getVipServers,
			this.launch,
			this.getGroupGames,
			this.hasJoinedServer,
			this.trackJoinedServer
		]);
	}

	getIdFromUrl(url) {
		return Number((url.match(/\/games\/(\d+)\//i) || url.match(/place\.aspx.*id=(\d+)/i) || url.match(/place\?.*id=(\d+)/i) || ["", 0])[1]) || 0;
	}

	getGameUrl(placeId, placeName) {
		if (typeof (placeName) != "string" || !placeName) {
			placeName = "redirect";
		} else {
			placeName = placeName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
		}

		return `https://www.roblox.com/games/${placeId}/${placeName}`;
	}

	getAuthTicket() {
		return QueuedPromise(`${this.serviceId}.getAuthTicket`, (resolve, reject) => {
			$.post(this.authTicketUrl).done((r, status, xhr) => {
				resolve(xhr.getResponseHeader("rbx-authentication-ticket"));
			}).fail(Roblox.api.$reject(reject));
		});
	}

	getVipServerById(vipServerId) {
		return CachedPromise(`${this.serviceId}.getVipServers`, (resolve, reject) => {
			$.get(`https://games.roblox.com/v1/vip-servers/${vipServerId}`).done((r) => {
				const expirationDate = new Date(r.subscription.expirationDate);
				resolve({
					id: r.id,
					name: r.name,
					expirationDate: expirationDate.getTime()
				});
			}).fail(Roblox.api.$reject(reject));
		}, [vipServerId], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000
		});
	}

	getVipServers(placeId, cursor) {
		return CachedPromise(`${this.serviceId}.getVipServers`, (resolve, reject) => {
			Roblox.users.getAuthenticatedUser().then(authenticatedUser => {
				$.get(`https://games.roblox.com/v1/games/${placeId}/servers/VIP`, {
					limit: 100,
					cursor: cursor || ""
				}).done((r) => {
					const vipServers = [];
					const vipServerPromises = []; 
	
					r.data.forEach(server => {
						if (server.owner.id === authenticatedUser.id) {
							vipServerPromises.push(this.getVipServerById(server.vipServerId).then(vipServer => {
								vipServer.owner = server.owner;
								vipServers.push(vipServer);
							}));
						} else {
							vipServers.push({
								id: server.vipServerId,
								name: server.name,
								owner: server.owner
							});
						}
					});
	
					Promise.all(vipServerPromises).then(() => {	
						if (r.nextPageCursor) {
							this.getVipServers(placeId, r.nextPageCursor).then(moreVipServers => {
								resolve(vipServers.concat(moreVipServers));
							}).catch(reject);
						} else {
							resolve(vipServers);
						}
					}).catch(reject);
				}).fail(Roblox.api.$reject(reject));
			}).catch(reject);
		}, [placeId, cursor], {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000
		});
	}

	launch(launchArguments) {
		return new Promise((resolve, reject) => {
			if (typeof (launchArguments) != "object") {
				reject([{
					code: 0,
					message: "Invalid launchArguments"
				}]);
				return;
			}

			let launchParameters = {};

			if (launchArguments.hasOwnProperty("followUserId")) {
				if (typeof (launchArguments.followUserId) != "number" || launchArguments.followUserId <= 0) {
					reject([{
						code: 0,
						message: "Invalid followUserId"
					}]);
					return;
				}

				launchParameters = {
					request: "RequestFollowUser",
					userId: launchArguments.followUserId
				};
			} else {
				if (typeof (launchArguments.placeId) != "number" || launchArguments.placeId <= 0) {
					reject([{
						code: 0,
						message: "Invalid placeId"
					}]);
					return;
				}
				if (typeof (launchArguments.serverId) != "string" && launchArguments.hasOwnProperty("serverId")) {
					reject([{
						code: 0,
						message: "Invalid serverId"
					}]);
					return;
				}

				if (launchArguments.serverId) {
					this.trackJoinedServer(launchArguments.serverId).then(() => {
						// server tracked, nothing to do.
					}).catch(console.error);
				}

				launchParameters = {
					request: launchArguments.serverId ? "RequestGameJob" : "RequestGame",
					gameId: launchArguments.serverId || "",
					placeId: launchArguments.placeId
				};
			}

			this.getAuthTicket().then((authTicket) => {
				let launchUrl = this.baseLaunchUrl + $.param(launchParameters);
				this.launchMessenger.sendMessage({
					protocolUrl: "roblox-player:1+launchmode:play+gameinfo:" + authTicket + "+launchtime:" + (+new Date) + "+placelauncherurl:" + encodeURIComponent(launchUrl)
				}).then(resolve).catch(reject);
			}).catch(reject);
		});
	}

	tryLaunchProtocolUrl(message) {
		// Basically this exists because I'm pretty sure the reason the entire chrome browser _just crashes_ when trying to launch a game
		// is because of how protocol URLs are launched. If it has to pop up and ask "are you sure you want to launch Roblox?" and it's in a background page
		// the whole browser just shuts down. This should at least prevent _some of that_ by "if they have a tab open, use that instead!"
		return new Promise((resolve, reject) => {
			let protocolUrl = message.data.protocolUrl;
			if (!protocolUrl) {
				reject("Missing protocolUrl");
				return;
			}

			if (Extension.Singleton.executionContextType === Extension.ExecutionContextTypes.tab) {
				this.launchFrame.attr("src", protocolUrl);
				resolve({});
				return;
			}

			this.launchMessenger.getAllTabIds().then(tabIds => {
				if (tabIds.length > 0) {
					this.launchMessenger.sendMessage({
						protocolUrl: protocolUrl
					}, tabIds[0]).then(resolve).catch(reject);
				} else {
					this.launchFrame.attr("src", protocolUrl);
					resolve({});
				}
			}).catch(reject);
		});
	}

	getGroupGames(groupId) {
		return CachedPromise(`${this.serviceId}.getGroupGames`, (resolve, reject) => {
			$.get(`https://games.roblox.com/v2/groups/${groupId}/games`, {
				limit: 100,
				sortOrder: "Asc",
				accessFilter: "Public"
			}).done((games) => {
				resolve(games.data.map((game) => {
					return {
						id: game.id,
						name: game.name
					};
				}));
			}).fail(Roblox.api.$reject(reject));
		}, [groupId], {
			resolveExpiry: 60 * 1000,
			rejectExpiry: 5 * 1000,
			queued: true
		});
	}

	isGameServerTrackingEnabled() {
		return new Promise((resolve, reject) => {
			Extension.Storage.Singleton.get("gameServerTracker").then((gameServerTrackerSettings) => {
				if (gameServerTrackerSettings && gameServerTrackerSettings.on) {
					Roblox.users.getAuthenticatedUser().then((authenticatedUser) => {
						if (authenticatedUser) {
							RPlus.premium.isPremium(authenticatedUser.id).then(resolve).catch(reject);
						} else {
							resolve(false);
						}
					}).catch(reject);
				} else {
					resolve(false);
				}
			}).catch(reject);
		});
	}

	hasJoinedServer(gameServerId) {
		return new Promise((resolve, reject) => {
			var cache = RPlus.notifiers.gameServerTracker.getCache();
			resolve(cache.hasOwnProperty(gameServerId));
		});
	}

	trackJoinedServer(gameServerId) {
		return new Promise((resolve, reject) => {
			var cache = RPlus.notifiers.gameServerTracker.getCache();
			cache[gameServerId] = +new Date;
			resolve({});
		});
	}
};

Roblox.games = new Roblox.Services.Games();

$(function () {
	$("body").append(Roblox.games.launchFrame);
});

switch (Extension.Singleton.executionContextType) {
	case Extension.ExecutionContextTypes.background:
		chrome.webRequest.onBeforeSendHeaders.addListener(function (data) {
			var swappedReferer = false;

			data.requestHeaders.forEach((header) => {
				var headerName = header.name.toLowerCase();
				if (headerName === "User-Agent") {
					header.value += " Roblox/Plus";
				} else if (headerName === "referer") {
					header.value = Roblox.games.refererOverrideValue;
					swappedReferer = true;
				}
			});

			if (!swappedReferer) {
				data.requestHeaders.push({
					name: "Referer",
					value: Roblox.games.refererOverrideValue
				});
			}

			return { requestHeaders: data.requestHeaders };
		}, {
			urls: [Roblox.games.authTicketUrl],
			types: ["xmlhttprequest"]
		}, ["blocking", "requestHeaders", "extraHeaders"]);

		break;
	case Extension.ExecutionContextTypes.tab:
		$("<a href=\"javascript:Roblox=window.Roblox||{};(Roblox.VideoPreRollDFP||Roblox.VideoPreRoll||{}).showVideoPreRoll=false;\">")[0].click();

		setInterval(function () {
			var gameServerSrc = $("#gamelaunch").attr("src");
			if (gameServerSrc) {
				var gameServerIdMatch = decodeURIComponent(gameServerSrc).match(/accessCode=([\w\-]+)/i) || [""];
				var gameServerId = gameServerIdMatch[1];
				if (gameServerId) {
					Roblox.games.trackJoinedServer(gameServerId).then(() => {
						// server tracked, nothing to do.
					}).catch(console.error);
				}
			}
		}, 1000);

		break;
}

// WebGL3D
