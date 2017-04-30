var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Inventory = function () {
	var userId = Roblox.users.getIdFromUrl(location.href) || users.userId;
	var deletable = ["models", "decals", "badges", "audio"];

	setInterval(function () {
		var sel = url.hash().substring(2).toLowerCase();
		if (deletable.indexOf(sel) >= 0) {
			$(".item-card-container:not([rplus])").attr("rplus", "").each(function () {
				var item = $(this);
				var id = Roblox.catalog.getIdFromUrl(item.find(">a").attr("href"));
				var name = item.find(".item-card-name,.recommended-name").text().trim();
				var thumb = item.find(".item-card-thumb-container,.recommended-thumb");
				if (userId == users.userId && deletable.indexOf(sel) >= 0 && !item.hasClass("recommended-item-link")) {
					thumb.append($("<span class=\"icon-alert\">").click(function (e) {
						e.preventDefault();
						var button = $(this);
						Roblox.ui.confirm({
							bodyText: "Are you sure you want to remove " + name + " from your inventory?"
						}).then(function (a) {
							if (a) {
								button.hide();
								item.css("opacity", ".25").find("a").attr("target", "_blank");
								Roblox.inventory.delete(id).then(function () {
									button.remove();
								}, function (e) {
									console.error(e);
									item.css("opacity", "1").find("a").removeAttr("target");
									button.show();
									Roblox.ui.feedback("Failed to remove " + name + " from your inventory", "warning", 5000);
								});
							}
						});
					}));
				}
			});
		}
	}, 250);

	return {};
};

RPlus.Pages.Inventory.patterns = [/^\/users\/inventory/i, /^\/users\/(\d+)\/inventory/i];


// WebGL3D
