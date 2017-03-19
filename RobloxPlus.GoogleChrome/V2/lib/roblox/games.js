/*
	roblox/games.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).games = (function () {
	var launchFrame = $("<iframe>").hide();
	var baseLaunchUrl = "https://assetgame.roblox.com/game/PlaceLauncher.ashx?";
	var authTicketUrl = "https://www.roblox.com/game/getauthticket?" + $.param({ verification: ext.id, _: +new Date });

	
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
		})
	};
})();

Roblox.games = $.addTrigger($.promise.background("Roblox.games", Roblox.games));


// WebGL3D
