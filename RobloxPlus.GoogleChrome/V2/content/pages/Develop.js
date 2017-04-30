var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Develop = function () {
	var views = [
		2, // T-shirt
		3, // Audio
		10, // Model
		11, // Shirt
		12, // Pants
		13 // Decal
	];

	storage.get("quickSell", function (on) {
		if (!on) { return; }
		setInterval(function () {
			var v = Number(url.param("view"));
			if (views.indexOf(v) < 0) { return; }
			$(".item-table:not([rplus])").attr("rplus", getMil()).each(function () {
				var row = $(this);
				var assetId = row.data("item-id");
				Roblox.develop.canManage(assetId).then(function (canManage) {
					if (!canManage) {
						return;
					}
					Roblox.catalog.getAssetInfo(assetId).then(function (asset) {
						var onsale = asset.isFree || asset.robuxPrice;
						row.find(".details-table tbody").append(users.userId == 2533795 || users.userId == 77907390 ? $("<tr>").append($("<button style=\"font-size: 11px;\">Clear Description</button>").click(function () {
							var button = $(this).text("...");
							catalog.update({ id: asset.id, description: "" }, function (s) {
								button.text(s ? "Cleared Description" : "Clear Description");
							});
						})) : "").find(">tr:first-child").prepend($("<td class=\"activate-cell\">").append($("<a class=\"place-" + (onsale ? "" : "in") + "active\" href=\"javascript:/* Change Status */\">").text((onsale ? "On" : "Off") + "sale").click(function () {
							var button = $(this);
							var x = (onsale = !onsale);
							catalog.update((v == 2 || v == 11 || v == 12) ? { id: asset.id, robux: x ? 1 : 0 } : { id: asset.id, free: x }, function (s) {
								if (s) {
									button.attr("class", "place-" + (x ? "" : "in") + "active").text((x ? "On" : "Off") + "sale");
								}
							});
						})));
					});
				});
			});
		}, 250);
	});

	return {};
};

RPlus.Pages.Develop.patterns = [/^\/develop/i, /^\/develop\/groups\/\d+/i, /^\/develop\/groups/i];


// WebGL3D
