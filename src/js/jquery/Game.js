var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Game = function () {
	var placeId = Number((location.pathname.match(/^\/games\/(\d+)\//i) || ["", 0])[1]);
	if (!placeId) {
		return;
	}


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

	return {};
};

RPlus.Pages.Game.patterns = [/^\/games\/(\d+)\//i];


// WebGL3D
