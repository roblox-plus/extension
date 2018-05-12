/*
	roblox/games.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).games = (function () {
	var launchFrame = $("<iframe>").hide();
	var baseLaunchUrl = "https://assetgame.roblox.com/game/PlaceLauncher.ashx?";
	var authTicketUrl = "https://www.roblox.com/game-auth/getauthticket?" + $.param({ verification: ext.id, _: +new Date });

	var getServers = $.promise.cache(function (resolve, reject, placeId, cursor) {
		$.get("https://www.roblox.com/games/getgameinstancesjson", { placeId: placeId, startindex: (cursor - 1) * 10 }).done(function (r) {
			resolve({
				nextPageCursor: r.TotalCollectionSize > cursor * 10 && r.Collection.length >= 10 ? cursor + 1 : null,
				previousPageCursor: cursor > 1 ? cursor - 1 : null,
				data: r.Collection
			});
		}).fail(function (jxhr, errors) {
			reject(errors);
		});
	}, {
		queued: true,
		resolveExpiry: 15 * 1000,
		rejectExpiry: 10 * 1000
	});

	
	if (ext.isBackground) {
		$(function () {
			$("body").append(launchFrame);
		});

		chrome.webRequest.onBeforeSendHeaders.addListener(function (data) {
			for (var n in data.requestHeaders) {
				if (data.requestHeaders[n].name == "User-Agent") {
					data.requestHeaders[n].value += " Roblox/Plus";
					break;
				}
			}
			return { requestHeaders: data.requestHeaders };
		}, { urls: [authTicketUrl], types: ["xmlhttprequest"] }, ["blocking", "requestHeaders"]);
	} else {
		$("<a href=\"javascript:Roblox=window.Roblox||{};(Roblox.VideoPreRollDFP||Roblox.VideoPreRoll||{}).showVideoPreRoll=false;\">")[0].click();
	}


	return {
		getIdFromUrl: function (url) {
			return Number((url.match(/\/games\/(\d+)\//i) || url.match(/place\.aspx.*id=(\d+)/i) || url.match(/place\?.*id=(\d+)/i) || ["", 0])[1]) || 0;
		},

		getGameUrl: function (placeId, placeName) {
			if (typeof (placeName) != "string" || !placeName) {
				placeName = "redirect";
			} else {
				placeName = placeName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
			}
			return "https://www.roblox.com/games/" + placeId + "/" + placeName;
		},

		launch: $.promise.cache(function (resolve, reject, launchArguments) {
			if (typeof (launchArguments) != "object") {
				reject([{
					code: 0,
					message: "Invalid launchArguments"
				}]);
				return;
			}

			var launchParameters = {};

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

				launchParameters = {
					request: launchArguments.serverId ? "RequestGameJob" : "RequestGame",
					gameId: launchArguments.serverId || "",
					placeId: launchArguments.placeId
				};
			}

			$.get(authTicketUrl).done(function (authTicket) {
				var launchUrl = baseLaunchUrl + $.param(launchParameters);
				launchFrame.attr("src", "roblox-player:1+launchmode:play+gameinfo:" + authTicket + "+launchtime:" + (+new Date) + "+placelauncherurl:" + encodeURIComponent(launchUrl));
				resolve();
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			resolveExpiry: 500,
			rejectExpiry: 500,
			queued: true
		}),

		getAllRunningServers: $.promise.cache(function (resolve, reject, placeId) {
			var runningServers = [];
			var serverMap = {};
			function getRunningServers(cursor) {
				getServers(placeId, cursor).then(function (data) {
					data.data.forEach(function (server) {
						if (serverMap.hasOwnProperty(server.Guid)) {
							return;
						}
						var players = [];
						server.CurrentPlayers.forEach(function (player) {
							players.push({
								id: player.Id,
								username: player.Username
							});
						});
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
						resolve(runningServers);
					}
				}, reject);
			}
			getRunningServers(1);
		}, {
			resolveExpiry: 20 * 1000,
			rejectExpiry: 5 * 1000
		})
	};
})();

Roblox.games = $.addTrigger($.promise.background("Roblox.games", Roblox.games));


// WebGL3D
