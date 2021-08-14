var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Profile = function () {
	var id = Roblox.users.getIdFromUrl(location.href);

	var username = $(".header-title>h2").text();
	$(".profile-avatar-thumb").attr("draggable", "true").on("dragstart", function (e) {
		e.originalEvent.dataTransfer.setData("text/plain", "user:" + username);
	}).text();

	if (id == 1) {
		$("#about>.profile-collections>.container-header>h3").after("<a href=\"/catalog/browse.aspx?Subcategory=17&SortType=3&IncludeNotForSale=true\" class=\"btn-secondary-sm btn-more inventory-link\">Recent</a>");
	}

	/*
	setInterval(function () {
		if (($(".btn-friends:not([rplus])>button").text() || "").trim() == "Unfriend") {
			var original; original = $(".btn-friends").after($("<li class=\"btn-friends\" rplus>").mouseover(function () {
				$(this).find(">button").addClass("btn-unfollow");
			}).mouseout(function () {
				$(this).find(">button").removeClass("btn-unfollow");
			}).click(function () {
				var fake = $(this);
				Roblox.ui.confirm({
					bodyText: "Are you sure you want to unfriend " + username + "?"
				}).then(function(c) {
					if (c) {
						fake.remove();
						original.show().find(">button")[0].click();
					}
				});
			}).append("<button class=\"btn-control-md\">Unfriend</button>")).attr("rplus", "").hide();
		}
	}, 250);
	//*/

	Extension.Storage.Singleton.get("profileRAP").then(function(profileRAP) {
		if (profileRAP) {
			let rapLabel= $("<li><div class=\"text-label font-caption-header\">RAP</div><a userid=\"" + id + "\" class=\"rplusinventory text-name\" href=\"javascript:/* Roblox+ */;\"><span class=\"font-header-2\">...</span></a></li>");
			$(".header-details>.details-info").append(rapLabel);

			Roblox.inventory.getCollectibles(id).then(function (inv) {
				rapLabel.find("span").text(global.addCommas(inv.combinedValue));
			}, function () {
				rapLabel.hide();
			});
		}
	}).catch(console.warn);

	if (($(".btn-friends:not([rplus])>button").text() || "").trim() == "Unfriend") {
		Extension.Storage.Singleton.get("friendNotifier").then(function (notifier) {
			if (!notifier.on) { return; }
			notifier.blocked = type(notifier.blocked) != "array" ? [] : notifier.blocked;
			$("#profile-header-more #popover-content>ul").prepend($("<li>").append($("<a rplus=\"notifier\">").attr("href", "javascript:$(\"#profile-header-more #popover-content>ul>li>a[rplus='notifier']\")[0].click();").text("Notifier: O" + (notifier.blocked.indexOf(id) >= 0 ? "ff" : "n")).click(function () {
				var button = $(this);
				console.log("click");
				Extension.Storage.Singleton.get("friendNotifier").then(function (notifier) {
					notifier.blocked = type(notifier.blocked) != "array" ? [] : notifier.blocked;
					console.log(notifier);
					if (notifier.blocked.indexOf(id) >= 0) {
						console.log("unblock");
						var blocked = [];
						notifier.blocked.forEach(function (o) { if (o != id) { blocked.push(o); } });
						notifier.blocked = blocked;
						Extension.Storage.Singleton.set("friendNotifier", notifier).then(() => {
							button.text("Notifier: On");
						}).catch(err => {
							console.warn(err);
						});
					} else {
						console.log("block");
						Roblox.ui.confirm({
							bodyText: "Stop receiving friend notifications for " + username + "?"
						}).then(function(s) {
							if (s) {
								notifier.blocked.push(id);
								Extension.Storage.Singleton.set("friendNotifier", notifier).then(() => {
									button.text("Notifier: Off");
								}).catch(err => {
									console.warn(err);
								});
							}
						});
					}
				}).catch(console.warn);
			})));
		}).catch(console.warn);
	}

	return {};
};

RPlus.Pages.Profile.patterns = [/^\/users\/(\d+)\/profile/i];


// WebGL3D
