var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Item = function () {
	var id = Roblox.catalog.getIdFromUrl(location.href);
	var item = (function (hold) {
		// TODO: wow look how ridiculously bad this looks, fix
		var creator = hold.find(".item-name-container>div>span.text-label>a.text-name");

		var ret = {
			assetType: hold.find("#item-container").data("asset-type"),
			assetTypeId: 0,
			creator: { id: Roblox.users.getIdFromUrl(creator.attr("href")), name: creator.text(), creatorType: creator.attr("href").indexOf("/users/") >= 0 ? "User" : "Group" },
			id: Number((hold.find("link[rel='canonical']").attr("href").match(/\/(catalog|library)\/(\d+)\//) || ["", "", 0])[2]),
			limited: hold.find("#AssetThumbnail .icon-limited-unique-label, #AssetThumbnail .icon-limited-label").length > 0,
			name: hold.find("#item-container").data("item-name"),
			"new": hold.find(".asset-status-icon.status-New").length > 0,
			thumbnail: hold.find("#AssetThumbnail>.thumbnail-span>img").attr("src"),
			url: hold.find("link[rel='canonical']").attr("href")
		};
		ret.assetType = ret.assetType.replace("Accessory", " Accessory");

		ret.assetTypeId = Number(array.flip(Roblox.catalog.assetTypes)[ret.assetType]) || 0;

		return ret;
	})($("html"));
	console.log(item);
	// TODO: Update price button on private sales
	// TODO: Multi-private selling support

	if ((item.assetTypeId == 1 || item.assetTypeId == 4) && item.creator.id == 1) {
		Roblox.content.getAssetContentUrl(id).then(function (contentUrl) {
			$("#item-details .action-button>button").replaceWith($("<a>").attr({ "class": "btn-primary-lg", "download": item.name, href: contentUrl }).text("Download"));
		}).catch(function (e) {
			console.warn("Failed to load asset content url", e);
		});
	} else if (id == 375602203) {
		//$("#ItemContainer").prepend("<span class=\"status-confirm\" style=\"display: block;width: 81%;text-align: center;font-weight: bold;\">"+($("#ctl00_cphRoblox_btnDelete.invisible").length?"Earn this badge to unlock the Easter theme for Roblox+":"By earning this you've unlocked the Easter theme for Roblox+")+"</span><br>");
	}

	function isAuthenticatedUserCreator() {
		return Roblox.users.authenticatedUserId === item.creator.id && item.creator.type === "User";
	}

	function canAuthenticatedUserEdit() {
		if (isAuthenticatedUserCreator()) {
			return true;
		}

		return $("#configure-item").length > 0;
	}

	var canViewOwners = function() {
		if (item.limited) {
			return true;
		}

		if (canAuthenticatedUserEdit()) {
			return true;
		}

		return false;
	};

	var canViewSales = function(callBack) {
		if (item.assetTypeId === 1 || item.assetTypeId === 4) {
			// TODO: Make more accurate of asset types that can be sold.
			callBack(false);
			return;
		}

		if (canAuthenticatedUserEdit()) {
			callBack(true);
			return;
		}

		callBack(false);
	};

	var canViewAssetContents = function() {
		if (Roblox.users.authenticatedUserId === 48103520) {
			// I'm the creator of the extension, sometimes I need to view specific asset contents to debug.
			return true;
		}

		var enabledAssetTypes = [
			"LeftArm",
			"RightArm",
			"Torso",
			"Head",
			"RightLeg",
			"LeftLeg",
			"Hat",
			"Gear",
			"Face",
			"Package",
			"Waist Accessory",
			"Back Accessory",
			"Front Accessory",
			"Hair Accessory",
			"Shoulder Accessory",
			"Neck Accessory",
			"Face Accessory",
			"EmoteAnimation"
		];
		if (enabledAssetTypes.indexOf(item.assetType) >= 0) {
			return true;
		}

		var creatorEnabledAssetTypes = ["MeshPart", "Decal", "Model"];
		if (canAuthenticatedUserEdit() && creatorEnabledAssetTypes.includes(item.assetType)) {
			return true;
		}

		return false;
	};

	let tabTypes = [];

	if (canViewOwners()) {
		tabTypes.push(ItemDetailsTabs.tabTypes.owners);
	}

	if (canViewAssetContents()) {
		tabTypes.push(ItemDetailsTabs.tabTypes.linkedItems);
	}

	if (tabTypes.length > 0) {
		let container = $("<div>");
		let itemDetailsTabs = React.createElement(ItemDetailsTabs, {
			tabTypes: tabTypes,
			assetId: item.id
		});

		$(".section-content.top-section").after(container);
		ReactDOM.render(itemDetailsTabs, container[0]);
	}

	if (item.limited) {
		var answerSpan = $("<span class=\"text-robux\">...</span>");
		var rap = 0;
		var lowestPrice = $("#item-container").data("expected-price");
		function recalc() {
			if (!rap) {
				rap = pround($("#item-average-price").text());
			}
			answerSpan.text(addComma(Roblox.catalog.calculateAveragePriceAfterSale(rap, lowestPrice)));
		}
		answerSpan.click(function () {
			var newPrice = pround(prompt("What price would you like to input to calculate future RAP?"));
			if (newPrice) {
				lowestPrice = newPrice;
				recalc();
			}
		});
		setTimeout(function() {
			$(".price-chart-info-container").last().after($("<div class=\"price-chart-info-container clearfix\">").append($("<div class=\"text-label\">").text("RAP After Sale"), $("<div class=\"info-content\"><span class=\"icon-robux-20x20\"></span></div>").append(answerSpan)));
			recalc();
		}, 1000);

		Extension.Storage.Singleton.get("remainingCounter").then(function (loop) {
			var spans = $(".item-note.has-price-label>span");
			if (spans.length == 2 && loop) {
				loop = function () {
					Roblox.catalog.getAssetInfo(id).then(function (asset) {
						spans.first().text("Limited quantity: " + global.addCommas(asset.sales) + " ");
						spans.last().text("/ " + global.addCommas(asset.stock));
						if (asset.remaining > 0) {
							setTimeout(loop, 2500);
						}
					}, function () {
						setTimeout(loop, 2500);
					});
				};
				loop();
			}
		}).catch(console.warn);
	}

	Extension.Storage.Singleton.get("itemSalesCounter").then(function(itemSalesCounterEnabled) {
		if (!itemSalesCounterEnabled) {
			return;
		}

		canViewSales(function(canView) {
			if (!canView) {
				return;
			}
	
			Roblox.catalog.getAssetSalesCount(item.id).then(function(sales) {
				var container = $("<div class=\"item-field-container\">");
				var label = $("<div class=\"text-label field-label text-overflow\">").text("Sales");
				var count = $("<span>").text(global.addCommas(sales));
	
				$(".item-type-field-container").after(container.append(label, count));
			}).catch(console.error);
		});
	}).catch(console.warn);
	
	return {
		item: item
	};
};

RPlus.Pages.Item.patterns = [/^\/catalog\/(\d+)\//i, /^\/library\/(\d+)\//i];


// WebGL3D
