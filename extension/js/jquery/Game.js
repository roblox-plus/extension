var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Game = function () {
	var placeId = Number((location.pathname.match(/^\/games\/(\d+)\//i) || ["", 0])[1]);
	if (!placeId) {
		return;
	}

	var gameCreatorId = $(".game-creator a").attr("href");
	if (gameCreatorId.indexOf("group") >= 0) {
		gameCreatorId = 0;
	} else {
		gameCreatorId = Roblox.users.getIdFromUrl(gameCreatorId);
	}
	console.log("Game creator id", gameCreatorId);

	var servers;
	servers = {
		anchor: $("<a>"),
		page: function () { return Number(servers.curPage.text()) || 1; },
		maxPage: $("<span>1</span>"),
		curPage: $("<span>1</span>"),
		getMaxPage: function() {
			return Number(servers.maxPage.text()) || 1;
		},
		firstPage: $("<li class=\"first disabled\">").append("<a><span class=\"icon-first-page\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				servers.fetch(1);
			}
		}),
		lastPage: $("<li class=\"last disabled\">").append("<a><span class=\"icon-last-page\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				servers.fetch(servers.getMaxPage());
			}
		}),
		prevPage: $("<li class=\"pager-prev disabled\">").append("<a><span class=\"icon-left\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				var newPage = Math.min(servers.getMaxPage(), Math.max(1, servers.page() - 1));
				servers.fetch(newPage);
			}
		}),
		nextPage: $("<li class=\"pager-next disabled\">").append("<a><span class=\"icon-right\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				servers.fetch(Math.min(Number(servers.maxPage.text()) || 1, servers.page() + 1));
			}
		}),
		fetch: function (p) {
			if (type(p) == "number") {
				servers.curPage.text(p.toString());
			}

			servers.firstPage.toggleClass("disabled", servers.page() <= 1);
			servers.prevPage.toggleClass("disabled", servers.page() <= 1);
			servers.anchor.attr("href", "javascript:Roblox.RunningGameInstances.fetchServers(" + placeId + "," + ((servers.page() - 1) * 10) + ");")[0].click();
		}
	};

	$(".rbx-running-games-footer").html("").append($("<ul class=\"pager\">")
		.append(servers.firstPage)
		.append(servers.prevPage)
		.append($("<li class=\"pager-cur\"></li>").append(servers.curPage))
		.append($("<li class=\"pager-total\"><span class=\"fixed-spacing\">of</span></li>").append(servers.maxPage))
		.append(servers.nextPage)
		.append(servers.lastPage));

	$(".rbx-gear-item-delete>.icon-delete").addClass("icon-alert");
	
	$(".rbx-running-games-refresh").click(function () {
		servers.curPage.text("1");
		servers.firstPage.addClass("disabled");
		servers.prevPage.addClass("disabled");
	});
	
	if (placeId === 258257446) {
		$(".create-server-banner-text").text("Purchasing a VIP server in this place will activate Roblox+ Premium!\nRoblox+ currently only expands the Roblox dark theme onto pages unsupported by Roblox.\n\tThere are plans to expand Roblox+ Premium in the future, but not in the short term.");
	} else if (placeId === 2117000638) {
		var audioTag = document.createElement("audio");
		var jplayer = $(audioTag);
		var minimumVolume = 0.01;

		audioTag.volume = minimumVolume;
		audioTag.loop = true;

		var forceLoad = function () {
			if (!audioTag.paused) {
				return;
			}
			
			audioTag.play().then(function () {

			}).catch(function (e) {
				setTimeout(forceLoad, 100);
			});
		};

		Roblox.audio.getSoundUrl(2860310547).then(function (audioUrl) {
			audioTag.src = audioUrl;
			forceLoad();
		}).catch(function () {
			console.error("no rockefeller today :(");
		});

		$("#MultiplayerVisitButton").on("mouseover", function () {
			jplayer.animate({ volume: 0.05 }, 500);
		}).on("mouseout", function () {
			jplayer.animate({ volume: minimumVolume }, 500);
		});

		$(window).focus(function () {
			jplayer.animate({ volume: minimumVolume }, 500);
		}).blur(function () {
			jplayer.animate({ volume: 0 }, 500);
		});

		RPlus.style.loadStylesheet(ext.getUrl("/css/easterEggs/rockefellerStreet.css"));
	}

	$(".voting-panel.body").each(function () {
		var up = Number($(this).attr("data-total-up-votes")) || 0;
		var down = Number($(this).attr("data-total-down-votes")) || 0;
		if (up || down) {
			var p = (!down ? 100 : (100 / (down + up)) * up).toFixed(3);
			$(this).attr("title", p + "% of voters recommend this game");
		}
	});

	Roblox.games.isGameServerTrackingEnabled().then(function(gameServerTrackingEnabled) {
		if (!gameServerTrackingEnabled) {
			return;
		}

		var section = $("<div class=\"section\">");
		var sectionContent = $("<div class=\"section-content\">");
		var label = $("<span class=\"text-lead\">").text("Join a server you haven't yet.");

		var playDiv = $("<div class=\"rplus-new-server\">");
		var playButton = $("<button type=\"button\" class=\"btn-secondary-md\">").text("Play");
		var searchingLabel = $("<div class=\"text-secondary\">").text("Searching...").hide();

		var cachedGameServers = null;
		var joinNewGameServer = function(gameServers) {
			var nextServer;
			nextServer = function() {
				var server = gameServers.data.Collection.shift();
				if (!server) {
					searchingLabel.text("No more servers.");
					return;
				}

				if (server.CurrentPlayers.length >= server.Capacity) {
					nextServer();
					return;
				}

				Roblox.games.hasJoinedServer(server.Guid).then(function(hasJoined) {
					if (hasJoined) {
						nextServer();
					} else {
						playButton.prop("disabled", false);
						searchingLabel.hide();

						var launchParameters = {
							placeId: gameServers.data.PlaceId,
							serverId: server.Guid
						};

						console.log("Found server!", server, launchParameters);
						Roblox.games.launch(launchParameters).then(console.log).catch(console.error);
					}
				}).catch(console.error);
			};

			nextServer();
		};

		playButton.click(function() {
			playButton.prop("disabled", true);
			searchingLabel.show();

			var hasCachedServers = !!cachedGameServers;
			if (hasCachedServers) {
				joinNewGameServer(cachedGameServers);
			}

			Roblox.games.getAllRunningServers(placeId).then(function(gameServers) {
				cachedGameServers = gameServers;

				if (!hasCachedServers) {
					joinNewGameServer(gameServers);
				}
			}).catch(function(e) {
				console.error(e);

				if (!hasCachedServers) {
					playButton.prop("disabled", false);
					searchingLabel.hide();
				}
			});
		});

		$("#rbx-running-games>.container-header").after(section.append(sectionContent.append(label, playDiv.append(playButton, searchingLabel))));
	}).catch(console.error);

	setInterval(function() {
		Roblox.games.isGameServerTrackingEnabled().then(function(gameServerTrackingEnabled) {
			if (!gameServerTrackingEnabled) {
				return;
			}
			
			$(".rbx-game-status").each(function() {
				var gameServerId = $(this).closest("li[data-gameinstance-id]").attr("data-gameinstance-id") || $(this).closest("li[data-gameid]").attr("data-gameid");
				if (gameServerId) {
					var playedLabel = $(this).find(".rplus-gameserver-played");
					if (playedLabel.length <= 0) {
						playedLabel = $("<span class=\"text-secondary rplus-gameserver-played\">").text("Played").hide();
						$(this).append($("<br>"), playedLabel);
					}

					Roblox.games.hasJoinedServer(gameServerId).then(function(played) {
						if (played) {
							playedLabel.show();
						} else {
							playedLabel.hide();
						}
					}).catch(console.error);
				}
			});
		}).catch(console.error);

		if (Roblox.users.authenticatedUserId) { 
			Extension.Storage.Singleton.get("badgeAchievementDatesEnabled").then(function(enabled) {
				if (enabled) {
					$(".badge-image:not([rplus-awarded-date])").each(function() {
						var badgeImage = $(this);
						var badgeId = Roblox.gameBadges.getIdFromUrl(badgeImage.find("a").attr("href"));
						if (badgeId > 0) {
							Roblox.gameBadges.getBadgeAwardedDate(Roblox.users.authenticatedUserId, badgeId).then(function(awardedDate) {
								if (awardedDate) {
									var date = new Date(awardedDate);
									badgeImage.append($("<div class=\"achievement-date\">").text(date.toLocaleDateString()).attr("title", `Achieved on ${date.toLocaleString()}`));
								}
							}).catch(console.error.bind(console, Roblox.users.authenticatedUserId, badgeId));
						}
					}).attr("rplus-awarded-date", +new Date);
				}
			}).catch(console.warn);
		}
	}, 250);

	return {};
};

RPlus.Pages.Game.patterns = [/^\/games\/(\d+)\//i];


// WebGL3D
