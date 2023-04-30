var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Profile = function () {
	var id = Roblox.users.getIdFromUrl(location.href);

	var username = $(".header-title>h2").text();
	$(".profile-avatar-thumb").attr("draggable", "true").on("dragstart", function (e) {
		e.originalEvent.dataTransfer.setData("text/plain", "user:" + username);
	}).text();

	if (id == 1) {
		$("#about>.profile-collections>.container-header>h3").after("<a href=\"/catalog/browse.aspx?Subcategory=17&SortType=3&IncludeNotForSale=true\" class=\"btn-secondary-sm btn-more inventory-link\">Recent</a>");
	}

	return {};
};

RPlus.Pages.Profile.patterns = [/^\/users\/(\d+)\/profile/i];


// WebGL3D
