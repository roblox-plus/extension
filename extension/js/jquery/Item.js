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

	var commentButton = $(".rbx-post-comment");
	if (commentButton.length) {
		setInterval(function () {
			storage.get("commentTimer", function (commentTimer) {
				var waitTime = 60 * 1000; // floodcheck time
				var remaining = commentTimer[Roblox.users.authenticatedUserId] && commentTimer[Roblox.users.authenticatedUserId].hasOwnProperty(id) ? waitTime - (getMil() - commentTimer[Roblox.users.authenticatedUserId][id]) : 0;
				if (commentTimer.last && getMil() < commentTimer.last + (60 * 1000)) {
					remaining = Math.max(remaining, (60 * 1000) - (getMil() - commentTimer.last));
				}
				commentButton.prop("disabled", remaining > 0).html(remaining ? "Post Comment<br>(" + Math.ceil(remaining / 1000) + ")" : "Post Comment");
				$(".rbx-comment-input").prop("disabled", remaining > 0);
			});
		}, 1000);
	}

	if ((item.assetTypeId == 1 || item.assetTypeId == 4) && item.creator.id == 1) {
		Roblox.content.getAssetContentUrl(id).then(function (contentUrl) {
			$("#item-details .action-button>button").replaceWith($("<a>").attr({ "class": "btn-primary-lg", "download": item.name, href: contentUrl }).text("Download"));
		}).catch(function (e) {
			console.warn("Failed to load asset content url", e);
		});
	} else if (id == 391072534) {
		$(".item-type-field-container .field-content").text("Roblox+ Enhancement");
		var buyButton = $(".PurchaseButton").attr("data-asset-type", "Roblox+ Enhancement");
		$("#AssetThumbnail>.thumbnail-span>img").attr("src", ext.getUrl("images/notifier.png")).css("height", "155px");

		if (browser.name != "Chrome") {
			buyButton.attr("disabled", "").attr("title", "Available on Chrome only");
		} else {
			var exampleButton = $("<button class=\"btn-primary-md\">Example</button>").click(function () {
				ipc.send("catalogNotifier:testBuyButton", {});
			});
			if (buyButton.length) {
				buyButton.parent().after(exampleButton);
			} else {
				$("#edit-avatar-button").after("<br>", exampleButton);
			}
			RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(function(ispremium) {
				if (ispremium) {
					buyButton.attr("disabled", "").attr("title", "You already own this item.");
				}
			}).catch(function(e) {
				console.warn(e);
			});
		}
	} else if (id == 375602203) {
		//$("#ItemContainer").prepend("<span class=\"status-confirm\" style=\"display: block;width: 81%;text-align: center;font-weight: bold;\">"+($("#ctl00_cphRoblox_btnDelete.invisible").length?"Earn this badge to unlock the Easter theme for Roblox+":"By earning this you've unlocked the Easter theme for Roblox+")+"</span><br>");
	}


	var createTab = function (name, listType) {
		var list = $("<div class=\"section-content\"><ul class=\"" + listType + "list\"></ul></div>").hide();
		var tabContainer = $("<div id=\"" + name.toLowerCase() + "\" class=\"tab-pane resellers-container\">").append(list).hide();
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
			list: list,
			container: tabContainer,
			count: function (n) { count.text(n.toString()).show(); },
			message: function (t) { 
				message.text(t)[t ? "show" : "hide"]();

				if (t) {
					list.hide();
				} else {
					list.show();
				}
			},
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
		if (item.creator.id === 1) {
			return item.assetTypeId !== 1 && item.assetTypeId !== 4;
		}

		if (Roblox.users.authenticatedUserId === 48103520 || canAuthenticatedUserEdit()) {
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

		if (item.creator.id === 1 || canAuthenticatedUserEdit()) {
			callBack(true);
			return;
		}

		RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(callBack).catch(function(e) {
			callBack(false);
		});
	};

	var canViewAssetContents = function() {
		if (Roblox.users.authenticatedUserId === 48103520) {
			// I'm the creator of the extension, sometimes I need to view specific asset contents to debug.
			return true;
		}

		var enabledAssetTypes = ["LeftArm", "RightArm", "Torso", "Head", "RightLeg", "LeftLeg", "Hat", "Gear", "Face", "Package", "Waist Accessory", "Back Accessory", "Front Accessory", "Hair Accessory", "Shoulder Accessory", "Neck Accessory", "Face Accessory"];
		if (enabledAssetTypes.indexOf(item.assetType) >= 0) {
			return true;
		}

		var creatorEnabledAssetTypes = ["MeshPart", "Decal", "Model"];
		if (canAuthenticatedUserEdit() && creatorEnabledAssetTypes.includes(item.assetType)) {
			return true;
		}

		return false;
	};

	if (canViewOwners()) {
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
						var date = new Date(record.updated);
						var username = record.owner ? record.owner.username : "[ Owner has their inventory hidden ]";
						var profileUrl = record.owner ? "/users/" + record.owner.userId + "/profile" : "javascript:/* User does not exist */";
						var thumbnailImage = $("<img class=\"avatar-card-image\">").attr({ 
							"src": Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Pending),
							"alt": username,
							"onerror": "this.onerror=null;this.src='" + Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Error) + "';"
						});

						Roblox.thumbnails.getUserHeadshotThumbnail((record.owner && record.owner.userId) || 0, 150, 150).then((thumbnail) => {
							thumbnailImage.attr("src", thumbnail.imageUrl)
						}).catch(console.error.bind(console, "serialTracker", record));

						serialTracker.tab.content.append($("<li class=\"list-item\" data-userasset-id=\"" + record.userAssetId + "\">").append(
							$("<a class=\"avatar avatar-headshot-md list-header\">").attr("href", profileUrl).append(thumbnailImage),
							$("<div class=\"resale-info\">").append(
								$("<a class=\"text-name username\" href=\"" + profileUrl + "\">").text(username),
								record.serialNumber ? $("<span class=\"separator\">").text("-") : "",
								record.serialNumber ? $("<span class=\"serial-number\">Serial #" + record.serialNumber + "</span>") : "",
								$("<br>"),
								$("<span class=\"text-secondary\">").text("Owner since: " + date.toLocaleDateString() + " " + date.toLocaleTimeString())
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


	if (canViewAssetContents()) {
		var assetContentTab = createTab("Linked Items", "h");
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
							$("<div class=\"store-card-caption\">").append($("<div class=\"text-overflow store-card-name\">").attr("title", asset.assetType + " - " + asset.name).text(asset.name))
						)
					)));
				});
			}, function () {
				assetContentTab.message("Failed to load asset contents.");
			});

			Roblox.catalog.getAssetBundles(id).then(function(bundles) {
				console.log("This asset is part of the following bundles", bundles);

				if (bundles.length > 0) {
					var bundlesHeader = $("<div class=\"container-header\">").append($("<h3>").text("Bundles"));
					var bundlesContents = $("<div class=\"section-content\">");
					var bundlesList = $("<ul class=\"hlist\">");

					bundles.forEach(function(bundle) {
						Roblox.thumbnails.getBundleThumbnail(bundle.id, 420, 420).then(function(thumbnail) {
							bundlesList.append($("<li class=\"list-item\">").append($("<div class=\"store-card\">").append(
								$("<a>").attr({
									"href": Roblox.catalog.getBundleUrl(bundle.id, bundle.name),
									"target": "_blank"
								}).append(
									$("<img>").attr({
										src: thumbnail.imageUrl,
										title: bundle.name
									}),
									$("<div class=\"store-card-caption\">").append($("<div class=\"text-overflow store-card-name\">").attr("title", bundle.name).text(bundle.name))
								)
							)));
						}).catch(console.error.bind(console, bundle));
					});

					assetContentTab.container.append(bundlesHeader, bundlesContents.append(bundlesList));
				}
			}).catch(console.error);
		});
	}


	if ($("#horizontal-tabs>li").length < 1) {
		$(".rbx-tabs-horizontal").hide();
	} else {
		$(".rbx-tabs-horizontal").attr("rplus", $("#horizontal-tabs>li").length - (item.limited ? 1 : 0));
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
		setTimeout(function() {
			$(".price-chart-info-container").last().after($("<div class=\"price-chart-info-container clearfix\">").append($("<div class=\"text-label\">").text("RAP After Sale"), $("<div class=\"info-content\"><span class=\"icon-robux-20x20\"></span></div>").append(answerSpan)));
			recalc();
		}, 1000);

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

		$("a.rbx-tab-heading[href='#price-chart']").parent().hide();
		$("a.rbx-tab-heading[href='#resellers']")[0].click();
	}

	if ((item.assetTypeId === 11 || item.assetTypeId === 12 || item.assetTypeId === 2)
		&& item.creator.id !== 1) {
		RPlus.copiedAssets.getOriginalAssetIds([item.id]).then(function (report) {
			if (typeof(report[item.id]) === "number" && report[item.id] !== item.id) {
				Roblox.ui.feedback($("<a>").text("This item is a copy! Click here for the original.").attr("href", Roblox.catalog.getAssetUrl(report[item.id])),
					Roblox.ui.feedbackTypes.warning,
					0,
					true);
			}
		}).catch(function (e) {
			// we failed
		});
	}

	storage.get("itemSalesCounter", function(itemSalesCounterEnabled) {
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
	});
	
	return {
		item: item
	};
};

RPlus.Pages.Item.patterns = [/^\/catalog\/(\d+)\//i, /^\/library\/(\d+)\//i];


// WebGL3D
