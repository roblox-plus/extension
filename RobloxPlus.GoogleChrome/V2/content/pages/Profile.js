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

	setInterval(function () {
		if (($(".btn-friends:not([rplus])>button").text() || "").trim() == "Unfriend") {
			var original; original = $(".btn-friends").after($("<li class=\"btn-friends\" rplus>").mouseover(function () {
				$(this).find(">button").addClass("btn-unfollow");
			}).mouseout(function () {
				$(this).find(">button").removeClass("btn-unfollow");
			}).click(function () {
				var fake = $(this);
				confirm.modal("Are you sure you want to unfriend " + username + "?", function (c) {
					if (c) {
						fake.remove();
						original.show().find(">button")[0].click();
					}
				});
			}).append("<button class=\"btn-control-md\">Unfriend</button>")).attr("rplus", "").hide();
		}
	}, 250);

	storage.get(["profileRAP", "tradeTab"], function (vals, rapLabel) {
		if (vals.profileRAP) {
			$(".header-details>.details-info").append(rapLabel = $("<li><div class=\"text-label\">RAP</div><a userid=\"" + id + "\" class=\"rplusinventory text-name\" href=\"javascript:/* ROBLOX+ */;\"><h3>0%</h3></a></li>"));
			users.inventory(id, function (inv) {
				if (inv.load.total < 100) {
					rapLabel.find("h3").text(Math.floor(inv.load.total) + "%");
				} else {
					rapLabel.find("h3").text(addComma(inv.rap));
				}
			});
		}

		if (vals.tradeTab) {
			tradeSystem.display(id, 0, function (href, target) {
				$(".trade-link").hide().after($("<a>Trade</a>").attr("class", $(".trade-link").attr("class")).attr("href", href).attr("target", target));
				$("#profile-trade-items").hide().after($("<a>Trade Items</a>").attr("href", href).attr("target", target));
			});
		}
	});

	foreach({ 3: "Clothing", 6: "Model" }, function (n, o) {
		var count = 0, stat, load;
		load = function (page) {
			stat.text(".".repeat((page % 3) + 1));
			$.get("/catalog/json?Subcategory=" + n + "&ResultsPerPage=42&IncludeNotForSale=true&CreatorId=" + id + "&PageNumber=" + page).success(function (r) {
				for (var n in r) {
					count += Number((r[n].Sales || "").replace(/\D+/g, "")) || 0;
				}
				if (r.length == 42) {
					load(page + 1);
				} else {
					stat.text(addComma(count));
				}
			}).fail(function () {
				setTimeout(load, 250, page);
			});
		};
		$(".profile-stats-container").append($("<li class=\"profile-stat\">").append($("<p class=\"text-label\">").text(o + " Sales")).append(stat = $("<p class=\"text-lead\">").append($("<a href=\"javascript:/* ROBLOX+ */\">[ Load ]</a>").click(function () { load(1); }))));
	});

	if ($("a.badge-link[href*='Badges.aspx'][title='Administrator']").length) {
		users.admin(id, function () { });
	}

	if (($(".btn-friends:not([rplus])>button").text() || "").trim() == "Unfriend") {
		storage.get("friendNotifier", function (notifier) {
			if (!notifier.on) { return; }
			notifier.blocked = type(notifier.blocked) != "array" ? [] : notifier.blocked;
			$("#profile-header-more #popover-content>ul").prepend($("<li>").append($("<a rplus=\"notifier\">").attr("href", "javascript:$(\"#profile-header-more #popover-content>ul>li>a[rplus='notifier']\")[0].click();").text("Notifier: O" + (notifier.blocked.indexOf(id) >= 0 ? "ff" : "n")).click(function () {
				var button = $(this);
				console.log("click");
				storage.get("friendNotifier", function (notifier) {
					notifier.blocked = type(notifier.blocked) != "array" ? [] : notifier.blocked;
					console.log(notifier);
					if (notifier.blocked.indexOf(id) >= 0) {
						console.log("unblock");
						var blocked = [];
						notifier.blocked.forEach(function (o) { if (o != id) { blocked.push(o); } });
						notifier.blocked = blocked;
						storage.set("friendNotifier", notifier, function () {
							button.text("Notifier: On");
						});
					} else {
						console.log("block");
						confirm.modal("Stop receiving friend notifications for " + username + "?", function (s) {
							if (!s) { return; }
							notifier.blocked.push(id);
							storage.set("friendNotifier", notifier, function () {
								button.text("Notifier: Off");
							});
						});
					}
				});
			})));
		});
	}

	return {};
};

RPlus.Pages.Profile.patterns = [/^\/users\/(\d+)\/profile/i];


// WebGL3D
