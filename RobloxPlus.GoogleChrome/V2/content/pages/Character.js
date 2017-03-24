var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Character = function () {
	var lid = 0;
	var getAssetType = function () {
		var assetType = $(".AttireCategorySelector_Selected").text();
		foreach({ "Accessories": "Hat" }, function (n, o) {
			if (assetType.startsWith(n)) {
				assetType = Roblox.catalog.assetTypes[Number($("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_AssetTypeDropDownList").val())] || o;
				return true;
			}
		});
		return assetType;
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
			var assetType = getAssetType();
			var i = ++lid;
			$("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_AttireDataPager_Footer").hide();
			var content = $("#ctl00_ctl00_cphRoblox_cphMyRobloxContent_UpdatePanelWardrobe .AttireContent").html("");
			var found = {};
			users.fullInventory({ assetType: assetType, id: users.userId }, function (inv) {
				if (!inv) {
					++lid;
					content.text("An unexpected error with the search, please try again.");
					input.removeAttr("readonly").val(keyword);
					return;
				}
				if (i == lid && assetType == getAssetType()) {
					foreach(inv.data, function (n, o) {
						if (!found[o.id] && o.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) {
							found[o.id] = o;
							var busy = false;
							content.append($("<div class=\"Asset\">").append($("<a class=\"AssetThumbnail\" href=\"javascript:/* Wear */\" title=\"click to wear\">").click(function () {
								if (busy) { return; }
								busy = true;
								Roblox.avatar.wearAsset(o.id).then(reset, reset);
							}).append($("<img>").attr("src", o.thumbnail), $("<div class=\"btn-small btn-neutral\">").text("Wear")), $("<div class=\"AssetDetails\">").append($("<div class=\"AssetName\">").append($("<a>").attr({ "href": "/item.aspx?id=" + o.id, "title": "click to view" }).text(o.name)))));
						}
					});
					if (inv.load < 100) {
						input.val(keyword + " (" + Math.floor(inv.load) + "%)");
					} else {
						if (!Object.keys(found).length) {
							content.text("No items match that search.");
						}
						input.removeAttr("readonly").val(keyword);
					}
				} else {
					input.removeAttr("readonly").val("");
				}
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
