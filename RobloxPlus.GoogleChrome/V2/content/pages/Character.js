var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Character = function () {
	var lid = 0;
	var getAssetTypeId = function () {
		var assetTypeId = Number($("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_AssetTypeDropDownList").val());
		if (!assetTypeId) {
			var wat = $("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_UpdatePanelWardrobe .AttireCategorySelector_Selected").first().text();
			assetTypeId = Number(array.flip(Roblox.catalog.assetTypes)[string.autoCorrect(wat, Roblox.catalog.assetTypes)]) || 0;
		}
		return assetTypeId;
	};
	var reset = function () {
		++lid;
		try { $("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_cmdRefreshAllUpdatePanels2")[0].click(); } catch (e) { }
		$("#tab-wardrobe>div>input").val("").removeAttr("readonly");
	};

	$(".divider-top").css("margin-top", "5px");
	$("#tab_wardrobe").prepend($("<input class=\"input-field\">").keyup(function (e) {
		var input = $(this);
		if (e.keyCode == 13) {
			var keyword = input.blur().val();
			if (!keyword) {
				reset();
				return;
			}
			input.attr("readonly", "readonly");
			var assetTypeId = getAssetTypeId();
			var i = ++lid;
			$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_AttireDataPager_Footer, #ctl00_ctl00_cphRoblox_cphMyRobloxContent_UpdatePanelWardrobe .FooterPager2").hide();
			var tileGroup = $("<div class=\"TileGroup\">");
			var content = $("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_UpdatePanelWardrobe .AttireContent").html(tileGroup);
			var found = {};
			Roblox.inventory.getAssets(users.userId, assetTypeId).then(function (assets) {
				if (i == lid && assetTypeId == getAssetTypeId()) {
					assets.forEach(function (asset) {
						if (asset.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) {
							found[asset.id] = asset;
							if (tileGroup.find(">.Asset").length == 4) {
								tileGroup = $("<div class=\"TileGroup\">");
								content.append(tileGroup);
							}
							tileGroup.append($("<div class=\"Asset\">").append($("<a class=\"AssetThumbnail\" href=\"javascript:/* Wear */\" title=\"click to wear\">").click(function () {
								Roblox.avatar.wearAsset(asset.id).then(reset, reset);
							}).append(
								$("<img>").attr("src", Roblox.thumbnails.getAssetThumbnailUrl(asset.id, 4)),
								$("<div class=\"btn-small btn-neutral\">").text("Wear")),
								$("<div class=\"AssetDetails\">").append(
									$("<div class=\"AssetName\">").append(
										$("<a>").attr({ "href": Roblox.catalog.getAssetUrl(asset.id, asset.name), "title": "click to view" }).text(asset.name)))));
						}
					});
					if (!Object.keys(found).length) {
						content.text("No items match that search.");
					}
					input.removeAttr("readonly").val(keyword);
				} else {
					input.removeAttr("readonly").val("");
				}
			}, function () {
				++lid;
				content.text("An unexpected error with the search, please try again.");
				input.removeAttr("readonly").val(keyword);
			});
		}
	}));


	var skin = $("<a class=\"btn-neutral btn-small\" href=\"javascript:/* Choose Skin Color */\">Skin</a>");

	var colorCallback;
	var colorFrame = $("<div>").css("height", "0px");
	for (var y = 0; y < 8; y++) {
		for (var x = 0; x < 8; x++) {
			(function (c) {
				colorFrame.append($("<div>").attr("title", c).css({ "top": (43.75 * y) + "px", "left": (43.75 * x) + "px", "background-color": brickColor.css(c) }).click(function () {
					if (colorCallback) {
						colorCallback(c);
					}
				}));
			})(brickColor.smallList[colorFrame.find(">div").length]);
		}
	}
	var pickColor = function (callBack) {
		$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_ColorChooserFrame").css("height", "0px");
		skin.hide();
		var p = $("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_ColorChooser>p:first-child");
		if (p.find("a").length) { return; }
		var called = false;
		var cb = function (x) {
			if (called) { return; }
			colorCallback = _;
			callBack(x);
			p.text("Click a body part to change its color:");
			colorFrame.css("height", "0px");
			$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_ColorChooserFrame").css("height", "240px");
			skin.show();
		};
		colorCallback = cb;
		p.html($("<a href=\"javascript:/* Close Color Picker */\">[ Click to close ]</a>").click(function () {
			cb();
		}));
		colorFrame.css("height", "350px");
	};
	$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_UpdatePanelBodyColors").before(colorFrame);

	$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_ColorChooser").append(skin.click(function () {
		pickColor(function (c) {
			if (c) {
				var dcb = 0;
				foreach(["head", "torso", "rightArm", "leftArm", "rightLeg", "leftLeg"], function (n, o) {
					outfit.bodyColor({ part: o, color: c }, function (s) {
						if (s) {
							$("div[rplus='" + o + "']").attr("title", c).find(">div").css("background-color", brickColor.css(c));
						}
						if (++dcb == 6) {
							reset();
						}
					});
				});
			}
		});
	}));

	setInterval(function () {
		$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_ColorChooserFrame>div>div[onclick]").each(function () {
			var bodyPart = string.autoCorrect($(this).attr("onclick"), ["head", "torso", "rightArm", "leftArm", "rightLeg", "leftLeg"]);
			if (bodyPart) {
				$(this).attr("title", brickColor.new($(this).find(">div").css("background-color")).name);
				$(this).removeAttr("onclick").attr("rplus", bodyPart);
				$(this).replaceWith($(this).outerHtml());
				var button = $("div[rplus='" + bodyPart + "']");
				button.click(function () {
					pickColor(function (c) {
						if (c) {
							outfit.bodyColor({ part: bodyPart, color: c }, function (s) {
								if (s) {
									reset();
								}
							});
						}
					});
				});
			}
		});
	}, 250);

	return {};
};

RPlus.Pages.Character.patterns = [/^\/My\/Character\.aspx/i];


// WebGL3D
