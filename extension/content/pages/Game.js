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

	var servers = {
		anchor: $("<a>"),
		page: function () { return Number(servers.curPage.text()) || 1; },
		maxPage: $("<span>1</span>"),
		curPage: $("<span>1</span>"),
		firstPage: $("<li class=\"first disabled\">").append("<a><span class=\"icon-first-page\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				servers.fetch(1);
			}
		}),
		lastPage: $("<li class=\"last disabled\">").append("<a><span class=\"icon-last-page\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				servers.fetch(Number(servers.maxPage.text()) || 1);
			}
		}),
		prevPage: $("<li class=\"pager-prev disabled\">").append("<a><span class=\"icon-left\"></span></a>").click(function () {
			if (!$(this).hasClass("disabled")) {
				servers.fetch(Math.max(1, servers.page() - 1));
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

		Roblox.audio.getSoundUrl(255288110).then(function (audioUrl) {
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

	return {};
};

RPlus.Pages.Game.patterns = [/^\/games\/(\d+)\//i];


// WebGL3D
