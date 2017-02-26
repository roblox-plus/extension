var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Item = function () {
	var id = catalog.getIdFromUrl(location.href);
	var item = catalog.info.parse($("html").html());
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
		$(".item-type-field-container .field-content").text("ROBLOX+ Enhancement");
		var buyButton = $(".PurchaseButton").attr("data-asset-type", "ROBLOX+ Enhancement");
		$("#AssetThumbnail>.thumbnail-span>img").attr("src", ext.url("images/notifier.png")).css("height", "155px");

		if (ext.browser.name != "Chrome") {
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
		//$("#ItemContainer").prepend("<span class=\"status-confirm\" style=\"display: block;width: 81%;text-align: center;font-weight: bold;\">"+($("#ctl00_cphRoblox_btnDelete.invisible").length?"Earn this badge to unlock the Easter theme for ROBLOX+":"By earning this you've unlocked the Easter theme for ROBLOX+")+"</span><br>");
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
		serialTracker.tab = createTab("Owners", "v");

		var loaderId = 0;
		var currentPage = 1;
		var previousPageCursor = "";
		var nextPageCursor = "";
		var busy = false;
		serialTracker.resultsPerPage = 20;
		serialTracker.loadPage = function (cursor) {
			if (busy) {
				return true;
			}
			busy = true;
			serialTracker.tab.content.html("").append($("<div>").hide());
			serialTracker.tab.message("Loading...");
			serialTracker.get({
				id: id,
				results: serialTracker.resultsPerPage,
				cursor: cursor
			}, function (data) {
				serialTracker.tab.input.attr("placeholder", "Page " + currentPage);
				if (data.success) {
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
				} else {
					serialTracker.tab.message("Failed to load owners, trying again...");
					setTimeout(function () {
						busy = false;
						serialTracker.loadPage(cursor);
					}, 1000);
				}
			});
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
		|| ((["MeshPart", "Decal"]).indexOf(item.assetType) >= 0 && item.creator.id == users.userId)) {
		var assetContentTab = createTab("Content", "h");
		assetContentTab.content.parent().css("padding", "10px");
		assetContentTab.firstLoad(function () {
			assetContentTab.message("Loading asset contents...");
			catalog.getAssetContents(id, function (data) {
				console.log(data);
				assetContentTab.count(data.contents.length);
				assetContentTab.message(data.contents.length ? "" : "This asset has no external content.");
				data.contents.forEach(function (assetId) {
					var title = "Content";
					if (data.textures.indexOf(assetId) >= 0) {
						title = "Texture";
					} else if (data.meshes.indexOf(assetId) >= 0) {
						title = "Mesh";
					}
					assetContentTab.content.append($("<li class=\"list-item\">").append($("<div class=\"store-card\">").append(
						$("<a>").attr({ "href": "/catalog/" + assetId + "/" + title, "target": "_blank" }).append(
							$("<img>").attr("src", catalog.thumbnail(assetId, 4)),
							$("<div class=\"store-card-caption\">").append($("<div class=\"text-overflow store-card-name\">").attr("title", title).text(title))
						)
					)));
				});
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
			answerSpan.text(addComma(catalog.calculateRAP(rap, lowestPrice)));
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
					catalog.info(id, function (info) {
						spans.first().text("Limited quantity: " + addComma(info.sales) + " ");
						spans.last().text("/ " + addComma(info.sales + info.remaining));
						setTimeout(loop, 2500);
					});
				};
				loop();
			}
			var span = $("#ctl00_cphRoblox_LimitedEditionRemaining>span");
			loop = loop && function () {
				catalog.info(id, function (info) {
					span.text(addComma(info.remaining));
					saleCount.text(addComma(info.sales));
					if (info.remaining && !info.privateSellers.length) {
						setTimeout(loop, 1000);
					}
				});
			};
			if (span.length && loop) {
				loop();
			}
		});
	}

	return {};
};

RPlus.Pages.Item.patterns = [/^\/catalog\/(\d+)\//i, /^\/library\/(\d+)\//i];


// WebGL3D
