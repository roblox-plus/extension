/*
	roblox/games.js [12/10/2016]
*/
(window.Roblox || (Roblox = {})).games = (function(){
	var iframe;
	var baseLaunchUrl = "https://assetgame.roblox.com/game/PlaceLauncher.ashx?";
	var authTicketUrl = "https://www.roblox.com/game/getauthticket?" + $.param({ verification: ext.id, _: +new Date });
	
	function launch(args, callBack){
		$.get(authTicketUrl).done(function(authTicket){
			var launchUrl = baseLaunchUrl + $.param(args);
			iframe.attr("src", "roblox-player:1+launchmode:play+gameinfo:" + authTicket + "+launchtime:" + (+new Date) + "+placelauncherurl:" + encodeURIComponent(launchUrl));
			callBack(true);
		}).fail(function(){
			callBack(false);
		});
	}
	
	var loadGameServersPageByPlaceId = $.cache(function(placeId, page, callBack){
		var data = {
			nextPage: 0,
			previousPage: 0,
			data: []
		};
		var startIndex = (page - 1) * 10;
		$.get("https://www.roblox.com/games/getgameinstancesjson", { placeId: placeId, startindex: startIndex }).done(function(r){
			r.Collection.forEach(function(serverData){
				var server = {
					id: serverData.Guid,
					players: [],
					ping: serverData.Ping,
					framesPerSecond: serverData.Fps,
					isSlow: serverData.ShowSlowGameMessage,
					isJoinable: serverData.UserCanJoin,
					playerCapacity: serverData.Capacity
				};
				serverData.CurrentPlayers.forEach(function(player){
					server.players.push({
						userId: player.Id,
						username: player.Username
					});
				});
				data.data.push(server);
			});
			if(r.TotalCollectionSize > startIndex + 10){
				data.nextPage = page + 1;
			}
			if(page > 1){
				data.previousPage = page - 1;
			}
		}).always(function(){
			callBack(data);
		});
	}, 30 * 1000);
	
	
	if(ext.isBackground){
		$(function(){
			$("body").prepend(iframe = $("<iframe>"));
		});
		
		chrome.webRequest.onBeforeSendHeaders.addListener(function(data){
			for(var n in data.requestHeaders){
				if(data.requestHeaders[n].name == "User-Agent"){
					data.requestHeaders[n].value += " Roblox/ExtensionLaunch";
					break;
				}
			}
			return { requestHeaders: data.requestHeaders };
		}, { urls: [ authTicketUrl ], types: ["xmlhttprequest"] }, ["blocking", "requestHeaders"]);
	}else{
		$("<a href=\"javascript:Roblox=window.Roblox||{};(Roblox.VideoPreRollDFP||Roblox.VideoPreRoll||{}).showVideoPreRoll=false;\">")[0].click();
	}
	
	return $.addTrigger({
		launch: request.backgroundFunction("Roblox.games.launch", function(launchArguments, callBack){
			if(launchArguments.hasOwnProperty("followUserId")){
				if(typeof(launchArguments.followUserId) != "number"){
					callBack(false);
					return;
				}
				launch({
					request: "RequestFollowUser",
					userId: launchArguments.followUserId
				}, callBack);
			}else{
				if(typeof(launchArguments.placeId) != "number"){
					callBack(false);
					return;
				}
				if(typeof(launchArguments.serverId) != "string" && launchArguments.serverId){
					delete launchArguments.serverId;
				}
				launch({
					request: launchArguments.serverId ? "RequestGameJob" : "RequestGame",
					gameId: launchArguments.serverId || "",
					placeId: launchArguments.placeId
				}, callBack);
			}
		}),
		
		getServersByPlaceId: $.cache(request.backgroundFunction("Roblox.games.getServersByPlaceId", function(placeId, callBack){
			var load, data = [];
			load = function(page){
				loadGameServersPageByPlaceId(placeId, page, function(servers){
					data = data.concat(servers.data);
					if(servers.nextPage){
						load(servers.nextPage);
					}else{
						callBack(data);
					}
				});
			};
			load(1);
		}), 30* 1000),
		
		getServerHtml: function(placeId, server){
			var li = $("<li class=\"section-content rbx-game-server-item\">").attr("data-gameid", server.id);
			var details = $("<div class=\"section-left rbx-game-server-details\">");
			var players = $("<div class=\"section-right rbx-game-server-players\">");
			
			details.append(
				$("<div class=\"rbx-game-status rbx-game-server-status\">").text(server.players.length + " of " + server.playerCapacity + " Players Max"),
				$("<div class=\"rbx-game-server-alert\">").toggleClass("hidden", !server.isSlow).append($("<span class=\"icon-remove\">"), "Slow Game"),
				$("<a class=\"btn-full-width btn-control-xs rbx-game-server-join\">").attr({
					"data-placeid": placeId,
					"data-gameid": server.id
				}).text("Join").click(function(){
					launch({
						request: "RequestGameJob",
						placeId: placeId,
						gameId: server.id
					});
				})
			);
			
			server.players.forEach(function(player){
				var avatar = $("<span class=\"avatar avatar-headshot-sm player-avatar\">");
				var link = $("<a class=\"avatar-card-link\">").attr({
					href: Roblox.users.getProfileUrl(player.userId),
					title: player.username
				});
				var img = $("<img class=\"avatar-card-image\">").attr("src", Roblox.thumbnails.getUserHeadshotThumbnailUrl(player.userId, 0));
				players.append(avatar.append(link.append(img)));
			});
			
			li.prepend(details, players);
			return li;
		}
	});
})();



// WebGL3D
