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
						row.find(".details-table tbody").append(Roblox.users.authenticatedUserId === 2533795 || Roblox.users.authenticatedUserId === 77907390 ? $("<tr>").append($("<button style=\"font-size: 11px;\">Clear Description</button>").click(function () {
							var button = $(this).text("...");
							Roblox.catalog.configureAsset(asset.id, {
								description: ""
							}).then(function () {
								button.text("Cleared Description");
							}).catch(function (e) {
								console.error(e);
								button.text("Failed to clear");
							});
						})) : "").find(">tr:first-child").prepend($("<td class=\"activate-cell\">").append($("<a class=\"place-" + (onsale ? "" : "in") + "active\" href=\"javascript:/* Change Status */\">").text((onsale ? "On" : "Off") + "sale").click(function () {
							var button = $(this);
							var x = (onsale = !onsale);
							Roblox.catalog.configureAsset(asset.id, (v === 2 || v === 11 || v === 12) ? { robux: x ? 1 : 0 } : { free: x }).then(function () {
								button.attr("class", "place-" + (x ? "" : "in") + "active").text((x ? "On" : "Off") + "sale");
							}).catch(function (e) {
								console.error(e);
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
