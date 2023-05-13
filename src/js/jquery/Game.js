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

	$(".rbx-gear-item-delete>.icon-delete").addClass("icon-alert");
	
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

		Roblox.audio.getSoundUrl(9180343981).then(function (audioUrl) {
			audioTag.src = audioUrl;
			forceLoad();
		}).catch(function () {
			console.error("no rockefeller today :(");
		});

		$("#game-details-play-button-container").on("mouseover", function () {
			jplayer.animate({ volume: 0.05 }, 500);
		}).on("mouseout", function () {
			jplayer.animate({ volume: minimumVolume }, 500);
		});

		$(window).focus(function () {
			jplayer.animate({ volume: minimumVolume }, 500);
		}).blur(function () {
			jplayer.animate({ volume: 0 }, 500);
		});
	}

	RPlus.settings.get().then(settings => {
		if (settings.gameServerCap) {
			// Roblox is treating game servers like the catalog... it doesn't matter if there are more results
			// the remaining servers get cut off after x amount of them... :(
			$("#rbx-running-games").attr("data-max-servers", settings.gameServerCap);
		}
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
	}, 250);

	return {};
};

RPlus.Pages.Game.patterns = [/^\/games\/(\d+)\//i];


// WebGL3D
