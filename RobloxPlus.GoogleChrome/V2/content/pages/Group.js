var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Group = function () {
	var id = Number(url.param("gid") || url.param("id", $("#ctl00_cphRoblox_AbuseReportButton_ReportAbuseTextHyperLink").attr("href")));
	if (!id) {
		console.warn("Could not parse group id.");
		return;
	}

	console.log("Group:", id);

	var shoutInput = $("#ctl00_cphRoblox_GroupStatusPane_StatusTextBox").attr("placeholder", "Enter group shout").attr("maxlength", "255").removeClass("default").removeAttr("value").removeAttr("onfocus");
	var shoutChar = function () { $("#ctl00_cphRoblox_GroupStatusPane_StatusSubmitButton").val("Shout (" + (255 - tostring(shoutInput.val()).length) + ")"); };
	shoutInput.keyup(shoutChar).keydown(shoutChar).keypress(shoutChar).change(shoutChar).trigger("change");

	var postInput = $("#ctl00_cphRoblox_GroupWallPane_NewPost").attr("maxlength", "500");
	var postChar = function () { $("#ctl00_cphRoblox_GroupWallPane_NewPostButton").val("Post (" + (500 - tostring(postInput.val()).length) + ")"); };
	postInput.keyup(postChar).keydown(postChar).keypress(postChar).change(postChar).trigger("change");

	storage.get(["groupShoutNotifierList", "groupShoutNotifier_mode"], function (s) {
		s.groupShoutNotifierList = type(s.groupShoutNotifierList) == "object" ? s.groupShoutNotifierList : {};
		s.wl = s.groupShoutNotifier_mode != "whitelist";
		$(".GroupControlsBox").append($("<div>").append($("<button class=\"btn-control-medium btn-control" + (s.wl ? "-disabled" : "") + "\">").click(s.wl ? function () { } : function (e) {
			e.preventDefault();
			if (s.groupShoutNotifierList[id]) {
				delete s.groupShoutNotifierList[id];
				$(this).text("Shout Notifier: Off");
			} else {
				s.groupShoutNotifierList[id] = $(".GroupPanelContainer h2").text();
				$(this).text("Shout Notifier: On");
			}
			storage.set("groupShoutNotifierList", s.groupShoutNotifierList);
		}).prop("disabled", s.wl).text("Shout Notifier: O" + (s.groupShoutNotifierList[id] || s.wl ? "n" : "ff"))));
	});

	if (id == 650266) {
		setInterval(function () {
			$(".GroupWall_PostBtns:not([rplus])").attr("rplus", "").each(function () {
				var el = $(this);
				var poster = users.urlId(el.parent().find(".UserLink>a[href*='/users/']").attr("href"));
				if (poster && el.parent().parent().parent().find(".bcOverlay").length) {
					tradeSystem.display(poster, 0, function (href, target) {
						el.append($("<a>Trade</a>").css("margin-left", "3px").attr("href", href).attr("target", target));
					});
				}
			}).find(">a[href^='javascript']").removeAttr("style");
		}, 250);
	}

	return {};
};

RPlus.Pages.Group.patterns = [/^\/my\/groups\.aspx/i, /^\/groups\/group\.aspx/i];


// WebGL3D
