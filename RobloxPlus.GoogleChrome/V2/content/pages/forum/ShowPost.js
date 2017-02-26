var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ForumShowPost = function () {
	var id = Number(url.param("PostID"));
	if (!id) {
		return;
	}

	storage.get("forums", function (f) {
		f.admins = ["Moderators", "Admins", "Alts", "Asset Control", "Developer"];
		groupService.role({ group: 2518656, user: users.userId }, function (mod) {
			mod = f.admins.indexOf(mod) >= 0;
			(f.blocking ? friendService.blocked : function (cb) { cb({ data: {} }); })(function (blockList) {
				blockList = blockList.data;
				var firstPost = Number($("a[name]").attr("name"));
				var page = ($("#ctl00_cphRoblox_PostView1_ctl00_Pager .normalTextSmallBold").text() || "Page 1 of 1").replace(/,/g, "").match(/^Page\s*(\d+)\s*of\s*(\d+)/i) || ["", 1, 1];
				var maxPage = Number(page[2]) || 1;
				page = Number(page[1]) || 1;

				if (page == 1 && id != firstPost) { id = firstPost; }

				var tracked = $("#ctl00_cphRoblox_PostView1_ctl00_TrackThread").prop("checked");
				$("#ctl00_cphRoblox_PostView1_ctl00_TrackThread").parent().html("").addClass("rplusforumcheckbox").append(
					$("<label>").append($("<input type=\"checkbox\">").prop("checked", tracked).change(function () {
						forumService[tracked = $(this).prop("checked") ? "track" : "untrack"](id, function () { });
					})).append(" Track Thread")
				).append("<br>").append(
					$("<label>").append($("<input type=\"checkbox\">").prop("checked", f.blacklist.indexOf(id) >= 0).change(function () {
						var c = $(this).prop("checked");
						storage.get("forums", function (f) {
							if (c && f.blacklist.indexOf(id) < 0) {
								f.blacklist.push(id);
								storage.set("forums", f);
							} else if (!c && f.blacklist.indexOf(id) >= 0) {
								f.blacklist.splice(f.blacklist.indexOf(id), 1);
								storage.set("forums", f);
							}
						});
					})).append(" Forum Notifier Blacklist")
				);

				if (Number(url.hash()) == f.last && f.last && Number(url.hash())) {
					f.last = 0;
					storage.set("forums", f);
					if (maxPage != 1 && !$("a[name='" + url.hash() + "']").length) {
						window.location.href = "/Forum/ShowPost.aspx?PostID=" + id + "&PageIndex=" + maxPage + "#" + url.hash();
						return;
					}
				}

				$("#ctl00_cphRoblox_PostView1_ctl00_PostList .forum-post").each(function (n) {
					var post = $(this);
					var content = post.find(".forum-content-background .linkify");
					var poster = users.urlId(post.find("a[href*='/users/']").attr("href"));
					var postId = Number(post.find("a[name]").attr("name")) || 0;
					var postCount = 0;
					post.find(">.forum-content-background:first-child>table>tbody>tr>td b").each(function () {
						if (($(this).text() || "").startsWith("Total Posts")) {
							$(this).parent().html("<b>Total Posts:</b> " + addComma(postCount = (Number(($(this).parent().text() || "").replace(/\D+/g, "")) || 0)));
						}
					});

					if (blockList[poster]) { post.hide(); return; }

					if (ext.tts.enabled) {
						var toRead = content.text().replace(/r\+:\/\/\d+/gi, "");
						post.find(".post-response-options").prepend($("<a class=\"btn-control btn-control-medium\" href=\"javascript:/* Read */\">Read</a>").click(function () {
							var button = $(this);
							if (button.text() == "Read") {
								button.text("Stop");
								ext.tts.speak(toRead, function () {
									button.text("Read");
								});
							} else {
								ext.tts.stop();
							}
						}));
					}

					if (f.rap) {
						var rapLabel = $("<span class=\"rplusinventory robux-text\" userid=\"" + poster + "\">0%</span>");
						post.find(">.forum-content-background:first-child>table>tbody>tr:nth-child(2)").after($("<tr>").append($("<td>").append("<b>RAP</b>: ").append(rapLabel)));
						users.inventory(poster, function (inv) {
							if (inv.bc != "NBC" && !post.find(".post-response-options>a[href*='Trade']").length) {
								post.find(".post-response-options").prepend($("<a class=\"btn-control btn-control-medium\" href=\"javascript:/* Trade */\">Trade</a>").click(function () {
									tradeSystem.display(poster);
								}));
							}
							if (inv.load.total < 100) {
								rapLabel.text(Math.floor(inv.load.total) + "%");
							} else {
								rapLabel.text(inv.success ? "R$" + addComma(inv.rap) : "FAILED");
							}
						});
					}

					if (f.postIds) {
						post.find("a[name]").parent().prepend("<a href=\"/Forum/ShowPost.aspx?PostId=" + id + (page != 1 ? "&PageIndex=" + page : "") + (postId != id ? "#" + postId : "") + "\">#" + postId + "</a> - ");
					}

					if (f.embedding) {
						groupService.role({ user: poster, group: 2518656 }, function (role) {
							if (f.admins.indexOf(role) < 0 && role != "Guest" && mod) {
								post.find(".post-response-options").prepend($("<a href=\"javascript:/* Forum Embedding */\" class=\"btn-control btn-control-medium\">" + (role == "Thugs" ? "Unban" : "Ban") + "</a>").click(function () {
									var button = $(this);
									if (button.text() == "...") { return; }
									var rid = button.text() == "Ban" ? 17759787 : 16556234;
									button.text("...");
									groupService.rank({ user: poster, group: 2518656, id: rid }, function (s) {
										button.text(s ? (rid == 16556234 ? "Ban" : "Unban") : (rid == 16556234 ? "Unban" : "Ban"));
									});
								}));
							}
							forumService.embed(content, role != "Thugs" && role != "Guest" ? Math.max(role == "Member" ? 1 : 3, Math.ceil((postCount + 1) / 1000)) : 0, f.embedSize);
						});
					}
				}).find(">.forum-content-background:first-child").dblclick(function () {
					$(this).parent().toggleClass("forumshrink");
				});
			});
		});
	});

	return {};
};

RPlus.Pages.ForumShowPost.patterns = [/^\/Forum\/ShowPost\.aspx/i];


// WebGL3D
