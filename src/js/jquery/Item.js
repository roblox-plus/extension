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

	return {
		item: item
	};
};

RPlus.Pages.Item.patterns = [/^\/catalog\/(\d+)\//i, /^\/library\/(\d+)\//i];


// WebGL3D
