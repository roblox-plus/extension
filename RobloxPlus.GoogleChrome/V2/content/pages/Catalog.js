var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Catalog = function () {
	// Temporarily disable until the back end is better.
	return {};

	function scanPage() {
		var assetIds = [];
		$(".CatalogItemOuter:not([data-asset-id]").each(function () {
			var assetId = $(this).find(".roblox-item-image").data("item-id");
			$(this).attr("data-asset-id", assetId);
			var creatorAnchor = $(this).find(".CatalogHoverContent>div").first().find("a");
			if (creatorAnchor.text() !== "ROBLOX") {
				assetIds.push(assetId);
			}
		});
		if (assetIds.length > 0) {
			RPlus.copiedAssets.getOriginalAssetIds(assetIds).then(function (originals) {
				for (var n in originals) {
					if (originals.hasOwnProperty(n) && Number(n) !== Number(originals[n]) && typeof(originals[n]) === "number") {
						console.log("Copier!\n\tAsset: " + n + "\n\tOriginal: " + originals[n]);
						$(".CatalogItemOuter[data-asset-id='" + n + "'] .item-image-wrapper > a").attr({
							"href": Roblox.catalog.getAssetUrl(Number(originals[n]))
						});
					}
				}
				setTimeout(scanPage, 500);
			}).catch(function (e) {
				setTimeout(scanPage, 500);
			});
		} else {
			setTimeout(scanPage, 500);
		}
	}

	scanPage();

	return {};
};

RPlus.Pages.Catalog.patterns = [/^\/catalog\//i];

// WebGL3D
