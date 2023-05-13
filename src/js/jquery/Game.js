var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Game = function () {
	var placeId = Number((location.pathname.match(/^\/games\/(\d+)\//i) || ["", 0])[1]);
	if (!placeId) {
		return;
	}

	if (placeId === 258257446) {
		$(".create-server-banner-text").text("Purchasing a VIP server in this place will activate Roblox+ Premium!\nRoblox+ currently only expands the Roblox dark theme onto pages unsupported by Roblox.\n\tThere are plans to expand Roblox+ Premium in the future, but not in the short term.");
	}
	return {};
};

RPlus.Pages.Game.patterns = [/^\/games\/(\d+)\//i];

// WebGL3D
