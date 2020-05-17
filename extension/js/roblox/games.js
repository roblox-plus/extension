/*
	roblox/games.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Games = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.games");

		let securityParameters = $.param({ verification: Extension.Singleton.id, _: +new Date });
		this.launchFrame = $("<iframe>").hide();
		this.baseLaunchUrl = "https://assetgame.roblox.com/game/PlaceLauncher.ashx?";
		this.authTicketUrl = `https://auth.roblox.com/v1/authentication-ticket?${securityParameters}`;
		this.refererOverrideValue = "https://www.roblox.com/users/48103520/profile?roblox=plus";

		this.register([
			this.getAuthTicket,
			this.getVipServers,
			this.launch,
			this.getGroupGames,
			this.hasJoinedServer,
			this.trackJoinedServer,
			this.getAllRunningServers
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

	getServers(placeId, cursor) {
		return CachedPromise(`${this.serviceId}.getServers`, (resolve, reject) => {
			$.get("https://www.roblox.com/games/getgameinstancesjson", {
				placeId: placeId,
				startindex: (cursor - 1) * 10
			}).done((r) => {
				resolve({
					nextPageCursor: r.TotalCollectionSize > cursor * 10 && r.Collection.length >= 10 ? cursor + 1 : null,
					previousPageCursor: cursor > 1 ? cursor - 1 : null,
					data: r.Collection
				});
			}).fail(Roblox.api.$reject(reject));
		}, [placeId, cursor], {
			queued: true,
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000
		});
	}

	getVipServers(universeId, pageNumber) {
		return CachedPromise(`${this.serviceId}.getVipServers`, (resolve, reject) => {
			pageNumber = pageNumber || 1;

			$.get("https://www.roblox.com/private-server/instance-list-json", {
				universeId: universeId,
				page: pageNumber
			}).done((r) => {
				var vipServers = [];

				(r.Instances || []).forEach((server) => {
					if (server.PrivateServer.StatusType !== 1) {
						return;
					}

					var expirationDate = Number((server.PrivateServer.ExpirationDate.match(/\d+/) || ["0"])[0]);
					vipServers.push({
						id: server.PrivateServer.Id,
						name: server.Name,
						owner: {
							id: server.PrivateServer.OwnerUserId
						},
						expirationDate: isNaN(expirationDate) || expirationDate <= 0 ? NaN : expirationDate
					});
				});

				if (!r.TotalPages || r.TotalPages <= pageNumber) {
					resolve(vipServers);
				} else {
					this.getVipServers(universeId, pageNumber + 1).then((moreVipServers) => {
						resolve(vipServers.concat(moreVipServers));
					}).catch(reject);
				}
			}).fail(Roblox.api.$reject(reject));
		}, [universeId, pageNumber], {
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
				this.launchFrame.attr("src", "roblox-player:1+launchmode:play+gameinfo:" + authTicket + "+launchtime:" + (+new Date) + "+placelauncherurl:" + encodeURIComponent(launchUrl));
				resolve({});
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

	getAllRunningServers(placeId) {
		return CachedPromise(`${this.serviceId}.getAllRunningServers`, (resolve, reject) => {
			var runningServers = [];
			var serverMap = {};
			var serversData = {
				PlaceId: placeId,
				ShowShutdownAllButton: false,
				TotalCollectionSize: 0,
				Collection: []
			};

			const getRunningServers = (cursor) => {
				this.getServers(placeId, cursor).then((data) => {
					if (data.ShowShutdownAllButton) {
						serversData.ShowShutdownAllButton = data.ShowShutdownAllButton;
					}

					data.data.forEach((server) => {
						if (serverMap.hasOwnProperty(server.Guid)) {
							return;
						}

						var players = [];
						server.CurrentPlayers.forEach((player) => {
							players.push({
								id: player.Id,
								username: player.Username
							});
						});

						serversData.Collection.push(server);

						runningServers.push(serverMap[server.Guid] = {
							id: server.Guid,
							capacity: server.Capacity,
							framesPerSecond: server.Fps,
							ping: server.Ping,
							isSlow: server.ShowSlowGameMessage,
							playerList: players
						});
					});

					if (data.nextPageCursor) {
						getRunningServers(data.nextPageCursor);
					} else {
						serversData.TotalCollectionSize = serversData.Collection.length;
						serversData.Collection = serversData.Collection.sort((a, b) => {
							return a.CurrentPlayers.length - b.CurrentPlayers.length;
						});

						resolve({
							servers: runningServers,
							data: serversData
						});
					}
				}).catch(reject);
			};

			getRunningServers(1);
		}, [placeId], {
			resolveExpiry: 120 * 1000,
			rejectExpiry: 5 * 1000
		});
	}
};

Roblox.games = new Roblox.Services.Games();

switch (Extension.Singleton.executionContextType) {
	case Extension.ExecutionContextTypes.background:
		$(function () {
			$("body").append(Roblox.games.launchFrame);
		});

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
