var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Catalog = function () {
	Extension.Storage.Singleton.get("catalog").then(function (catalogSettings) {
		if (!catalogSettings || !catalogSettings.hideBlockedSellers) {
			return;
		}

		var creatorObserver = new MutationObserver(function (records) {
			records.forEach(function (record) {
				record.addedNodes.forEach(function (e) {
					var creatorLabel = $(e);
					var creatorUrl = creatorLabel.attr("href");
					if (creatorLabel.hasClass("creator-name") && creatorUrl.includes("/users/")) {
						var creatorId = Roblox.users.getIdFromUrl(creatorUrl);
						Roblox.social.isBlocked(creatorId).then(function(blocked) {
							if (blocked) {
								var itemCard = creatorLabel.closest(".item-card");
								console.log(creatorLabel.text(), "is blocked - hiding item", itemCard);
								itemCard.addClass("creator-blocked");
							}
						}).catch(console.error);
					}
				});
			});
		});

		creatorObserver.observe(document.body, { childList: true, subtree: true });
	}).catch(console.warn);

	return {};
};

RPlus.Pages.Catalog.patterns = [/^\/catalog\//i];

// WebGL3D
