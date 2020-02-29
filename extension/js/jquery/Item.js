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

	var tryLoad = function() {
		let hasResalePane = $("asset-resale-pane").length > 0;
		if (hasResalePane) {
			// Need to disable features on this page for limiteds for now
			return;
		}

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
	};

	tryLoad();
	
	return {
		item: item
	};
};

RPlus.Pages.Item.patterns = [/^\/catalog\/(\d+)\//i, /^\/library\/(\d+)\//i];


// WebGL3D
