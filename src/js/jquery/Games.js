var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Games = function () {
	$("body").on("mouseover", ".game-card:not(.sponsored-game) a.game-card-link[href *= 'Position=']", function () {
		var position = Number(($(this).attr("href").match(/[&\?]Position=(\d+)/i) || ["", NaN])[1]);
		if (!isNaN(position) && position > 0) {
			var marker = $(this).find(".game-card-thumb-container > span");
			if (marker.length > 0) {
				return;
			}

			$(this).find(".game-card-thumb-container").prepend($("<span class=\"rplus-game-card-position\">").text("#" + position));
		}
	});

	RPlus.style.loadStylesheet(Extension.Singleton.getUrl("/css/pages/games.css"));

	return {};
};

RPlus.Pages.Games.patterns = [/^\/games\/?\D*/i];


// WebGL3D
