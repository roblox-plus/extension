var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Item = function () {
	var id = Roblox.catalog.getIdFromUrl(location.href);
	var item = (function (hold) {
		// TODO: wow look how ridiculously bad this looks, fix
		hold.find("#item-details-description>span").remove();
		var creator = hold.find(".item-name-container>div>span.text-label>a.text-name");

		var ret = {
			assetType: hold.find("#item-container").data("asset-type"),
			assetTypeId: 0,
			creator: { id: Roblox.users.getIdFromUrl(creator.attr("href")), name: creator.text(), creatorType: creator.attr("href").indexOf("/users/") >= 0 ? "User" : "Group" },
			description: hold.find("#item-details-description").text().trim(),
			free: hold.find(".text-robux-lg").text() == "Free",
			id: Number((hold.find("link[rel='canonical']").attr("href").match(/\/catalog\/(\d+)\//) || ["", 0])[1]),
			limited: hold.find("#AssetThumbnail .icon-limited-unique-label, #AssetThumbnail .icon-limited-label").length > 0,
			limitedUnique: hold.find("#AssetThumbnail .icon-limited-unique-label").length > 0,
			name: hold.find("#item-container").data("item-name"),
			"new": hold.find(".asset-status-icon.status-New").length > 0,
			productId: Number(hold.find(".PurchaseButton[data-product-id]").data("product-id")) || 0,
			robuxPrice: Number(hold.find(".icon-robux-price-container .text-robux-lg").text().replace(/\D+/g, "")) || 0,
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

	var commentButton = $(".rbx-post-comment");
	if (commentButton.length) {
		setInterval(function () {
			storage.get("commentTimer", function (commentTimer) {
				var waitTime = 60 * 1000; // floodcheck time
				var remaining = commentTimer[users.userId] && commentTimer[users.userId].hasOwnProperty(id) ? waitTime - (getMil() - commentTimer[users.userId][id]) : 0;
				if (commentTimer.last && getMil() < commentTimer.last + (60 * 1000)) {
					remaining = Math.max(remaining, (60 * 1000) - (getMil() - commentTimer.last));
				}
				commentButton.prop("disabled", remaining > 0).html(remaining ? "Post Comment<br>(" + Math.ceil(remaining / 1000) + ")" : "Post Comment");
				$(".rbx-comment-input").prop("disabled", remaining > 0);
			});
		}, 1000);
	}

	if ((item.assetTypeId == 1 || item.assetTypeId == 4) && item.creator.id == 1) {
		$("#item-details .action-button>button").replaceWith($("<a>").attr({ "class": "btn-primary-lg", "download": item.name, href: "https://assetgame.roblox.com/asset/?id=" + id }).text("Download"));
	} else if (id == 391072534) {
		$(".item-type-field-container .field-content").text("Roblox+ Enhancement");
		var buyButton = $(".PurchaseButton").attr("data-asset-type", "Roblox+ Enhancement");
		$("#AssetThumbnail>.thumbnail-span>img").attr("src", ext.getUrl("images/notifier.png")).css("height", "155px");

		if (browser.name != "Chrome") {
			buyButton.attr("disabled", "").attr("title", "Available on Chrome only");
		} else {
			buyButton.parent().after($("<button class=\"btn-primary-md\">Example</button>").click(function () {
				request.send({ request: "buttonTest" });
			}));
			request.send({ request: "buttonOwner" }, function (o) {
				if (o) {
					buyButton.attr("disabled", "").attr("title", "You already own this item.");
				}
			});
		}
	} else if (id == 375602203) {
		//$("#ItemContainer").prepend("<span class=\"status-confirm\" style=\"display: block;width: 81%;text-align: center;font-weight: bold;\">"+($("#ctl00_cphRoblox_btnDelete.invisible").length?"Earn this badge to unlock the Easter theme for Roblox+":"By earning this you've unlocked the Easter theme for Roblox+")+"</span><br>");
	}


	var createTab = function (name, listType) {
		var tabContainer = $("<div id=\"" + name.toLowerCase() + "\" class=\"tab-pane resellers-container\">").append($("<div class=\"section-content\"><div class=\"resellers\"><ul class=\"" + listType + "list\"></ul></div></div>")).hide();
		tabContainer.prepend("<div class=\"container-header\"><h3>" + name + "</h3></div>");
		var count = $("<span class=\"notification-red\">").hide();
		var message = $("<div class=\"section-content-off\" style=\"display: none;\"></div>");
		tabContainer.append(message);
		var onFirstLoad;
		var tab = $("<li class=\"rbx-tab\">").append($("<a class=\"rbx-tab-heading\" href=\"#" + name.toLowerCase() + "\">").append($("<span class=\"text-lead\">").text(name), count)).click(function (e) {
			e.preventDefault();
			$(this).parent().find(".rbx-tab").removeClass("active");
			$(this).addClass("active");
			if (onFirstLoad) {
				onFirstLoad();
				onFirstLoad = undefined;
			}
		});
		$(".resale-pricechart-tabs #horizontal-tabs").append(tab);
		$(".resale-pricechart-tabs>.tab-content").append(tabContainer);
		var ret = {
			tab: tab,
			container: tabContainer,
			count: function (n) { count.text(n.toString()).show(); },
			message: function (t) { message.text(t)[t ? "show" : "hide"](); },
			content: tabContainer.find("ul"),
			firstLoad: function (cb) {
				if (cb) {
					onFirstLoad = cb;
				}
			}
		};
		return ret;
	};

	if (!$(".rbx-tabs-horizontal").length) {
		$(".section-content.top-section").after($("<div class=\"rbx-tabs-horizontal resale-pricechart-tabs\">").append(
			$("<ul id=\"horizontal-tabs\" class=\"nav nav-tabs\" role=\"tablist\">"),
			$("<div class=\"tab-content rbx-tab-content\">")
		));
	} else {
		$(".rbx-tabs-horizontal").attr("rplus", "AllTabs");
	}


	if (item.creator.id == 1 && item.assetTypeId != 1 && item.assetTypeId != 4) {
		var loaderId = 0;
		var currentPage = 1;
		var previousPageCursor = "";
		var nextPageCursor = "";
		var busy = false;

		serialTracker = {
			tab: createTab("Owners", "v"),
			loadPage: function (cursor) {
				if (busy) {
					return true;
				}
				busy = true;
				serialTracker.tab.content.html("").append($("<div>").hide());
				serialTracker.tab.message("Loading...");
				Roblox.inventory.getAssetOwners(id, cursor, "Asc").then(function (data) {
					serialTracker.tab.input.attr("placeholder", "Page " + currentPage);
					serialTracker.tab.message("");
					nextPageCursor = data.nextPageCursor || "";
					previousPageCursor = data.previousPageCursor || "";
					data.data.forEach(function (record) {
						var username = record.owner ? record.owner.username : "[ Deleted ]";
						var profileUrl = record.owner ? "/users/" + record.owner.userId + "/profile" : "javascript:/* User does not exist */";
						serialTracker.tab.content.append($("<li class=\"list-item\" data-userasset-id=\"" + record.userAssetId + "\">").append(
							$("<a class=\"avatar avatar-headshot-md list-header\" data-bc=\"" + (record.owner ? record.owner.buildersClubMembershipType : "0") + "\">").attr("href", profileUrl).append($("<img class=\"avatar-card-image\">").attr({ "src": "https://www.roblox.com/headshot-thumbnail/image?userId=" + (record.owner ? record.owner.userId : "0") + "&width=60&height=60&format=png", "alt": username })),
							$("<div class=\"resale-info\">").append(
								$("<a class=\"text-name username\" href=\"" + profileUrl + "\">").text(username),
								record.serialNumber ? $("<span class=\"separator\">").text("-") : "",
								record.serialNumber ? $("<span class=\"serial-number\">Serial #" + record.serialNumber + "</span>") : ""
							)
						));
					});
					busy = false;
				}, function (errors) {
					serialTracker.tab.message("Failed to load owners, trying again...");
					setTimeout(function () {
						busy = false;
						serialTracker.loadPage(cursor);
					}, 2000);
				});
			}
		};

		function nextPage() {
			if (nextPageCursor) {
				if (!serialTracker.loadPage(nextPageCursor)) {
					currentPage += 1;
				}
			}
		}

		function prevPage() {
			if (previousPageCursor) {
				if (!serialTracker.loadPage(previousPageCursor)) {
					currentPage -= 1;
				}
			}
		}

		$(document).keyup(function (e) {
			if (e.keyCode == 37 && serialTracker.tab.content.is(":visible")) {
				prevPage();
			} else if (e.keyCode == 39 && serialTracker.tab.content.is(":visible")) {
				nextPage();
			}
		});

		serialTracker.tab.container.find(".container-header").append($("<div class=\"pager\">").append(
			$("<div class=\"pager-prev\"><a><span class=\"icon-left\"></span></a></div>").click(function (e) {
				e.preventDefault();
				prevPage();
			}),
			serialTracker.tab.input = $("<input class=\"input-field\" placeholder=\"Page 1\" readonly=\"readonly\"/>"),
			$("<div class=\"pager-next\"><a><span class=\"icon-right\"></span></a></div>").click(function (e) {
				e.preventDefault();
				nextPage();
			})
		));

		serialTracker.tab.firstLoad(function () {
			serialTracker.loadPage("");
		});
	}


	if ((["LeftArm", "RightArm", "Torso", "Head", "RightLeg", "LeftLeg", "Hat", "Gear", "Face", "Package", "Waist Accessory", "Back Accessory", "Front Accessory", "Hair Accessory", "Shoulder Accessory", "Neck Accessory", "Face Accessory"]).indexOf(item.assetType) >= 0
		|| ((["MeshPart", "Decal"]).indexOf(item.assetType) >= 0 && item.creator.id == users.userId)
		|| Roblox.page.user.id === 48103520) {
		// I'm the creator of the extension, sometimes I need to view specific asset contents to debug.
		var assetContentTab = createTab("Content", "h");
		assetContentTab.content.parent().css("padding", "10px");
		assetContentTab.firstLoad(function () {
			assetContentTab.message("Loading asset contents...");
			Roblox.content.getDependentAssets(id).then(function (assets) {
				console.log(assets);
				assetContentTab.count(assets.length);
				assetContentTab.message(assets.length ? "" : "This asset has no dependent content.");
				assets.forEach(function (asset) {
					assetContentTab.content.append($("<li class=\"list-item\">").append($("<div class=\"store-card\">").append(
						$("<a>").attr({
							"href": Roblox.catalog.getAssetUrl(asset.id, asset.name),
							"target": "_blank"
						}).append(
							$("<img>").attr({
								src: Roblox.thumbnails.getAssetThumbnailUrl(asset.id, 4),
								title: asset.name
							}),
							$("<div class=\"store-card-caption\">").append($("<div class=\"text-overflow store-card-name\">").attr("title", asset.assetType).text(asset.assetType))
						)
					)));
				});
			}, function () {
				assetContentTab.message("Failed to load asset contents.");
			});
		});
	}


	if ($("#horizontal-tabs>li").length < 1) {
		$(".rbx-tabs-horizontal").hide();
	} else {
		$(".rbx-tabs-horizontal").attr("rplus", $("#horizontal-tabs>li").length);
		$("#horizontal-tabs").show().find(">li").click(function () {
			var tabContent = $(this).parent().parent().find(">.tab-content");
			tabContent.find(">*").hide();
			var thisTab = $(this).find(">a").attr("href").substr(1);
			if (thisTab == "resellers" || thisTab == "price-chart") {
				tabContent.find("#resellers,#price-chart").show();
			} else {
				tabContent.find(">*[id='" + thisTab + "']").show();
			}
		});
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
		$(".price-chart-info-container").last().after($("<div class=\"price-chart-info-container clearfix\">").append($("<div class=\"text-label\">").text("RAP After Sale"), $("<div class=\"info-content\"><span class=\"icon-robux-20x20\"></span></div>").append(answerSpan)));
		setTimeout(recalc, 3000);

		storage.get("remainingCounter", function (loop) {
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
		});
	}

	return {};
};

RPlus.Pages.Item.patterns = [/^\/catalog\/(\d+)\//i, /^\/library\/(\d+)\//i];


// WebGL3D
