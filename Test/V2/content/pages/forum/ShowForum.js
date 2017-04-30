var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ShowForum = function () {
	$("div[class='thread-link-outer-wrapper']>div").css("max-width", ($("#Body").width() / 4) + "px");
	storage.get("forums", function (f) {
		if (f.blocking) {
			$(".post-list-author").each(function () {
				var element = $(this);
				var posterId = Roblox.users.getIdFromUrl(element.attr("href"));
				Roblox.social.isBlocked(posterId).then(function (isBlocked) {
					if (isBlocked) {
						element.parent().parent().hide();
					}
				});
			});
		}
	});

	var trackLab = $("#ctl00_cphRoblox_MyForums1>table>tbody>tr:nth-child(3)>td>h2");
	if (trackLab.length) {
		trackLab.text("Your Tracked Threads (" + $("#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking>tbody>.forum-table-row").each(function () {
			var id = Number(url.param("postid", $(this).find(".post-list-subject").attr("href")));
			$(this).find(">td:first-child>img").replaceWith($("<input type=\"checkbox\" checked=\"checked\">").change(function () {
				trackLab.text("Your Tracked Threads (" + $("#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking>tbody>.forum-table-row>td>input:checked").length + ")");
				if ($(this).prop("checked")) {
					Roblox.forum.trackThread(id);
				} else {
					Roblox.forum.untrackThread(id);
				}
			}));
		}).length + ")");
	}

	return {};
};

RPlus.Pages.ShowForum.patterns = [/^\/Forum\/ShowForum\.aspx/i, /^\/Forum\/User\/MyForums\.aspx/i];


// WebGL3D
