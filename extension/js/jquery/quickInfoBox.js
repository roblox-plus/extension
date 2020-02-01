/* quickInfoBox.js [5/18/2017] */
var RPlus = RPlus || {};

RPlus.quickInfo = RPlus.quickInfo || (function () {
	var icon = (function () {
		var navbarItem = $("<li id=\"navbar-rplus\" class=\"navbar-icon-item\">");
		var navbarAnchor = $("<a class=\"rplus-icon-32x32\">");
		navbarItem.append(navbarAnchor);
		return navbarItem;
	})();

	var containers = (function () {
		var outerContainer = $("<div id=\"rplus-quickinfo\" class=\"roblox-popover-container\">").hide();
		var innerContainer = $("<div>");

		var userContainer = (function () {
			var container = $("<div>");

			var avatarCard = (function () {
				var card = $("<div class=\"avatar-card-container\">");
				var cardContent = $("<div class=\"avatar-card-content\">");
				var cardButtons = $("<div class=\"avatar-card-btns\">").hide();

				var character = $("<div class=\"avatar-card-fullbody\">");
				var headshotAnchor = $("<a class=\"avatar-card-link\">");
				var headshotImage = $("<img class=\"avatar-card-image\">");
				var presenceAnchor = $("<a class=\"avatar-status online\">");
				var presenceIcon = $("<span>");

				var details = $("<div class=\"avatar-card-caption\">");
				var username = $("<div class=\"text-overflow avatar-name\">");
				var cardLabel1 = $("<div class=\"avatar-card-label\">");
				var cardLabel2 = $("<div class=\"avatar-card-label\">");
				var detailsLink = $("<a class=\"text-link text-overflow avatar-status-link\">");
				var rplusPremiumIcon = $("<span class=\"rplus-icon-32x32\">");

				var followButton = $("<button class=\"btn-primary-md\">").text("Join Game");

				headshotAnchor.append(headshotImage);
				presenceAnchor.append(presenceIcon);
				character.append(headshotAnchor, presenceAnchor);

				details.append(username, cardLabel1, cardLabel2, detailsLink, rplusPremiumIcon);

				cardButtons.append(followButton);

				cardContent.append(character, details);
				card.append(cardContent, cardButtons);

				followButton.click(function () {
					var userId = container.data("userid");
					if (userId) {
						Roblox.games.launch({
							followUserId: userId
						}).then(function () {
							// followed the user
						}).catch(function (e) {
							// didn't
						});
					}
				});

				return card;
			})();

			var collectibles = (function () {
				var list = $("<ul class=\"hlist item-cards rplus\">");
				return list;
			})();

			container.append(avatarCard, collectibles);

			return container;
		})();

		innerContainer.append(userContainer);
		outerContainer.append(innerContainer);

		return {
			outer: outerContainer,
			inner: innerContainer,
			user: userContainer,
			innerList: innerContainer.find(">div")
		};
	})();

	var searchBar = (function () {
		var input = $("<input class=\"form-control input-field\">").attr({
			"placeholder": "Drag user profile links here!"
		});
		var form = $("<form class=\"form-horizontal ng-pristine ng-valid\">").attr({
			"role": "form"
		});
		var formGroup = $("<div class=\"form-group\">");

		form.submit(function (e) {
			e.preventDefault();
		});

		containers.outer.prepend(form.append(formGroup.append(input)));

		return input;
	})();


	var displayTypes = {
		"user": 1
	};
	var processingId = 0;
	var processDisplayChange = (function () {
		var currentDisplayType = 0;
		var currentDisplayTargetId = 0;

		var userPresenceIcons = {
			"2": "online",
			"3": "studio",
			"4": "game"
		};

		function processUserDisplay(user, expectedProcessingId) {
			if (expectedProcessingId !== processingId) {
				return;
			}
			if (!user) {
				searchBar.val("");
				return;
			}
			console.log("user", user);
			searchBar.val(Roblox.users.getProfileUrl(user.id));
			containers.innerList.removeAttr("selected");

			containers.user.data("userid", user.id);
			containers.user.find(">.avatar-card-container").removeClass("disabled");
			containers.user.find(">ul.item-cards").html("");

			var avatarCardImage = containers.user.find(".avatar-card-image");
			containers.user.find(".avatar-card-link").attr("href", Roblox.users.getProfileUrl(user.id));
			avatarCardImage.attr("src", Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Pending));
			containers.user.find(".avatar-name").text(user.username);
			containers.user.find(".avatar-card-label").text("");
			containers.user.find(".avatar-card-btns").slideUp();

			Roblox.thumbnails.getUserHeadshotThumbnail(user.id, 150, 150).then((thumbnail) => {
				if (expectedProcessingId !== processingId) {
					return;
				}
				
				avatarCardImage.attr("src", thumbnail.imageUrl);
			}).catch(console.error.bind(console, "processUserDisplay", user));

			Roblox.users.getAuthenticatedUser().then(function (authenticatedUser) {
				var premiumViewers = [48103520, 44052422, 19483499];
				if (expectedProcessingId !== processingId || authenticatedUser == null || !premiumViewers.includes(authenticatedUser.id)) {
					return;
				}

				RPlus.premium.getPremium(user.id).then(function (premium) {
					if (expectedProcessingId !== processingId) {
						return;
					}

					var expiration = premium && premium.expiration ? new Date(premium.expiration) : null;
					containers.user.find(".avatar-card-container").attr({
						"data-premium-expiration": expiration ? expiration.getTime() : "null",
						"data-is-premium": premium != null
					});
					containers.user.find(".avatar-card-container .rplus-icon-32x32").attr("title", "Expiration: " + (expiration ? expiration.toLocaleDateString() : "Lifetime"));
				}).catch(function(e) {
					console.error(e);
				});
			}).catch(function(e) {
				console.error(e);
			});

			Roblox.users.getPresence([user.id]).then(function (presence) {
				if (expectedProcessingId !== processingId) {
					return;
				}
				presence = presence[user.id];
				if (presence === null || typeof (presence.locationType) !== "number" || !userPresenceIcons.hasOwnProperty(presence.locationType)) {
					containers.user.find(".avatar-status").hide();
				} else {
					containers.user.find(".avatar-status > span").attr({
						"class": "icon-" + userPresenceIcons[presence.locationType],
						"title": presence.locationName
					});
					containers.user.find(".avatar-status").attr({
						"href": presence.game ? Roblox.games.getGameUrl(presence.game.placeId, presence.game.name) : Roblox.users.getProfileUrl(user.id)
					}).show();
					if (presence.game && presence.locationType === 4) {
						containers.user.find(".avatar-card-btns").slideDown();
					}
				}
			}).catch(function (e) {
				// failed to load presence
			});

			Roblox.inventory.getCollectibles(user.id).then(function (collectibles) {
				if (expectedProcessingId !== processingId) {
					return;
				}
				console.log(collectibles);
				containers.user.find(".avatar-card-label").first().html("Collectibles: " + collectibles.collectibles.length + "<br>RAP: " + global.addCommas(collectibles.combinedValue));
				var collectibleCounts = {};
				collectibles.collectibles.sort(function (a, b) {
					return b.recentAveragePrice - a.recentAveragePrice;
				});
				collectibles.collectibles.forEach(function (collectible) {
					if (collectibleCounts.hasOwnProperty(collectible.assetId)) {
						collectibleCounts[collectible.assetId].countLabel.text("x" + (++collectibleCounts[collectible.assetId].count)).show();
					} else {
						var listItem = $("<li class=\"list-item item-card\">");
						var card = $("<div class=\"item-card-container\">");
						var cardLink = $("<a class=\"item-card-link\" target=\"_blank\">").attr({
							"href": Roblox.catalog.getAssetUrl(collectible.assetId, collectible.name),
							"title": collectible.name
						});
						var cardThumb = $("<div class=\"item-card-thumb-container\">");
						var thumbImage = $("<img class=\"item-card-thumb\">").attr({
							"src": Roblox.thumbnails.getAssetThumbnailUrl(collectible.assetId, 4)
						});
						var assetName = $("<div class=\"text-overflow item-card-name\">").text(collectible.name);

						collectibleCounts[collectible.assetId] = {
							count: 1,
							countLabel: $("<span class=\"item-serial-number\">").text("#" + collectible.serialNumber)
						};

						if (!collectible.serialNumber) {
							collectibleCounts[collectible.assetId].countLabel.hide();
						}

						var averagePrice = $("<div class=\"item-card-price\">");
						averagePrice.append($("<span class=\"rplus icon-robux-16x16\">"),
							$("<span class=\"text-robux\">").text(collectible.recentAveragePrice ? global.addCommas(collectible.recentAveragePrice) : "?"));


						cardThumb.append(collectibleCounts[collectible.assetId].countLabel, thumbImage);
						cardLink.append(cardThumb, assetName);
						card.append(cardLink, averagePrice);
						listItem.append(card);
						containers.user.find(">ul.item-cards").append(listItem);
					}
				});
			}).catch(function (e) {
				if (typeof (e) === "object" && Array.isArray(e.errors) && e.errors[0].code === 1) {
					containers.user.find(">.avatar-card-container").addClass("disabled");
					containers.user.find(".avatar-card-label").first().text("User has been restricted.");
				} else {
					containers.user.find(".avatar-card-label").first().text("Failed to load collectibles");
					console.error(e);
				}
			});

			containers.user.attr("selected", "selected");
		}

		return function (expectedProcessingId, target) {
			if (expectedProcessingId !== processingId
				|| (target.displayType === currentDisplayType && target.displayTargetId === currentDisplayTargetId)) {
				return;
			}

			currentDisplayType = target.displayType;
			currentDisplayTargetId = target.displayTargetId;

			if (currentDisplayType === displayTypes.user) {
				Roblox.users.getByUserId(currentDisplayTargetId).then(function (user) {
					processUserDisplay(user, expectedProcessingId);
				}).catch(function (e) {
					processUserDisplay(null, expectedProcessingId);
				});
			}
		};
	})();


	function isContainerOpen() {
		return !containers.outer.is(":hidden");
	}

	function openContainer() {
		containers.outer.slideDown();
	}

	function closeContainer() {
		containers.outer.slideUp();
	}

	function processInputChange(input) {
		var processId = ++processingId;

		var userId = Roblox.users.getIdFromUrl(input);
		if (userId) {
			processDisplayChange(processId, {
				displayType: displayTypes.user,
				displayTargetId: userId
			});
			return;
		}
		
		var usernameMatch = input.match(/^user:(.+)/i) || ["", ""];
		if (usernameMatch[1].length > 0) {
			Roblox.users.getByUsername(usernameMatch[1]).then(function (user) {
				processDisplayChange(processId, {
					displayType: displayTypes.user,
					displayTargetId: user.id
				});
			}).catch(function (e) {
				processDisplayChange(processId, {
					displayType: displayTypes.user,
					displayTargetId: 0
				});
			});
			return;
		}

		var userIdMatch = input.match(/^userid:(\d+)/i) || ["", ""];
		if (userIdMatch[1].length > 0) {
			processDisplayChange(processId, {
				displayType: displayTypes.user,
				displayTargetId: Number(userIdMatch[1])
			});
			return;
		}
	}


	icon.click(function () {
		if (isContainerOpen()) {
			closeContainer();
		} else {
			openContainer();
		}
	}).on("dragenter", function (e) {
		openContainer();
	}).on("dragover", function (e) {
		e.preventDefault();
	}).on("drop", function (e) {
		var dropText = e.originalEvent.dataTransfer.getData("text");
		if (typeof (dropText) === "string" && dropText.length > 0) {
			processInputChange(dropText);
		}
	});

	searchBar.on("keyup", function (e) {
		if (e.keyCode === 13) {
			processInputChange($(this).val());
		}
	}).on("drop", function (e) {
		var dropText = e.originalEvent.dataTransfer.getData("text");
		if (typeof (dropText) === "string" && dropText.length > 0) {
			processInputChange(dropText);
		}
	});

	containers.outer.on("dragover", function (e) {
		e.preventDefault();
	}).on("drop", function (e) {
		var dropText = e.originalEvent.dataTransfer.getData("text");
		if (e.target !== searchBar[0] && typeof (dropText) === "string" && dropText.length > 0) {
			processInputChange(dropText);
		}
	});


	$(function () {
		// Expirmental feature, only let me see it for now.
		if ($("#header").length <= 0) {
			return;
		}

		$("#navbar-setting").before(icon);
		$("#header").append(containers.outer);
	});

	return {
		isContainerOpen: isContainerOpen,
		openContainer: openContainer,
		closeContainer: closeContainer,
		trigger: function (input) {
			if (typeof (input) === "string" && input.length > 0) {
				openContainer();
				processInputChange(input);
			}
		}
	};
})();


// WebGL3D
