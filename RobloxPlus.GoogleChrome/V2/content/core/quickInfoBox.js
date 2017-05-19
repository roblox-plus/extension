/* quickInfoBox.js [5/18/2017] */
var RPlus = RPlus || {};

RPlus.quickInfo = RPlus.quickInfo || (function () {
	var icon = (function () {
		var navbarItem = $("<li id=\"navbar-rplus\" class=\"navbar-icon-item\">");
		var navbarAnchor = $("<a class=\"rplus-icon-32x32\">");
		navbarItem.append(navbarAnchor);
		return navbarItem;
	})();

	var container = (function () {
		var container = $("<div id=\"rplus-quickinfo\" class=\"roblox-popover-container\">").hide();
		var innerContainer = $("<div>");

		container.append(innerContainer);

		return {
			outer: container,
			inner: innerContainer
		};
	})();

	var searchBar = (function () {
		var input = $("<input class=\"form-control input-field\">").attr({
			"placeholder": "Drag Roblox links here!"
		});
		var form = $("<form class=\"form-horizontal ng-pristine ng-valid\">").attr({
			"role": "form"
		});
		var formGroup = $("<div class=\"form-group\">");

		form.submit(function (e) {
			e.preventDefault();
		});

		container.outer.prepend(form.append(formGroup.append(input)));

		return input;
	})();


	var displayTypes = {
		"user": 1,
		"asset": 2,
		"catalog": 3
	};
	var processingId = 0;
	var processDisplayChange = (function () {
		var currentDisplayType = 0;
		var currentDisplayTargetId = 0;

		function processUserDisplay(user) {
			console.log("user", user);
		}

		function processAssetDisplay(asset) {
			console.log("asset", asset);
		}

		function processCatalogDisplay() {
			console.log("wee woo");
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
					if (expectedProcessingId !== processingId) {
						return;
					}
					processUserDisplay(user);
				}).catch(function (e) {
					if (expectedProcessingId !== processingId) {
						return;
					}
					console.error("User does not exist - handle better!");
				});
			} else if (currentDisplayType === displayTypes.asset) {
				Roblox.catalog.getAssetInfo(currentDisplayTargetId).then(function (asset) {
					if (expectedProcessingId !== processingId) {
						return;
					}
					processAssetDisplay(asset);
				}).catch(function (e) {
					if (expectedProcessingId !== processingId) {
						return;
					}
					console.error("Asset does not exist - handle better!");
				});
			} else if (currentDisplayType === displayTypes.catalog) {
				// we woo...
			}
		};
	})();


	function isContainerOpen() {
		return !container.outer.is(":hidden");
	}

	function openContainer() {
		container.outer.slideDown();
	}

	function closeContainer() {
		container.outer.slideUp();
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

		var assetId = Roblox.catalog.getIdFromUrl(input);
		if (assetId) {
			processDisplayChange(processId, {
				displayType: displayTypes.asset,
				displayTargetId: assetId
			});
			return;
		}

		var usernameMatch = input.match(/^username:(.+)/i) || ["", ""];
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

		var userIdMatch = input.match(/^user:(\d+)/i) || ["", ""];
		if (userIdMatch[1].length > 0) {
			processDisplayChange(processId, {
				displayType: displayTypes.user,
				displayTargetId: Number(userIdMatch[1])
			});
			return;
		}

		var assetIdMatch = input.match(/^asset:(\d+)/i) || ["", ""];
		if (assetIdMatch[1].length > 0) {
			processDisplayChange(processId, {
				displayType: displayTypes.asset,
				displayTargetId: Number(assetIdMatch[1])
			});
			return;
		}

		var limitedSearchMatch = input.match(/^limi?t?e?d?:(.+)/i) || ["", ""];
		if (limitedSearchMatch[1].length > 0) {
			processDisplayChange(processId, {
				displayType: displayTypes.catalog,
				displayTargetId: "limited:" + limitedSearchMatch[1],
				input: limitedSearchMatch[1]
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

	searchBar.change(function () {
		processInputChange($(this).val());
	}).on("drop", function (e) {
		var dropText = e.originalEvent.dataTransfer.getData("text");
		if (typeof (dropText) === "string" && dropText.length > 0) {
			processInputChange(dropText);
		}
	});


	$(function () {
		// Expirmental feature, only let me see it for now.
		if (Roblox.page.user.id !== 48103520 || $("#header").length <= 0) {
			return;
		}

		$("#navbar-setting").before(icon);
		$("#header").append(container.outer);
	});

	return {
		isContainerOpen: isContainerOpen,
		openContainer: openContainer,
		closeContainer: closeContainer
	};
})();


// WebGL3D
