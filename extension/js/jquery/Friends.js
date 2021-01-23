var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Friends = function () {
	var id = Roblox.users.getIdFromUrl(location.href) || Roblox.users.authenticatedUserId;

	return {};
};

RPlus.Pages.Friends.patterns = [/^\/users\/(\d+)\/friends/i, /^\/users\/friends/i];


// WebGL3D
