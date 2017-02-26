var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ShowForum = function () {
	$("div[class='thread-link-outer-wrapper']>div").css("max-width", ($("#Body").width() / 4) + "px");
	storage.get("forums", function (f) {
		if (f.blocking) {
			friendService.blocked(function (b) {
				$(".post-list-author").each(function () {
					if (b.data[users.urlId($(this).attr("href"))]) {
						$(this).parent().parent().hide();
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
				forumService[$(this).prop("checked") ? "track" : "untrack"](id, function () { });
				trackLab.text("Your Tracked Threads (" + $("#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking>tbody>.forum-table-row>td>input:checked").length + ")");
			}));
		}).length + ")");
	}

	return {};
};

RPlus.Pages.ShowForum.patterns = [/^\/Forum\/ShowForum\.aspx/i, /^\/Forum\/User\/MyForums\.aspx/i];


// WebGL3D
