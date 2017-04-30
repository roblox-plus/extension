var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ForumShowPost = function () {
	var id = Number(url.param("PostID"));
	if (!id) {
		return;
	}

	storage.get("forums", function (f) {
		f.admins = ["Moderators", "Admins", "Alts", "Asset Control", "Developer"];
		Roblox.groups.getUserRole(2518656, users.userId).then(function (authenticatedUserRole) {
			var firstPost = Number($("a[name]").attr("name"));
			var page = ($("#ctl00_cphRoblox_PostView1_ctl00_Pager .normalTextSmallBold").text() || "Page 1 of 1").replace(/,/g, "").match(/^Page\s*(\d+)\s*of\s*(\d+)/i) || ["", 1, 1];
			var maxPage = Number(page[2]) || 1;
			page = Number(page[1]) || 1;

			if (page == 1 && id != firstPost) { id = firstPost; }

			var tracked = $("#ctl00_cphRoblox_PostView1_ctl00_TrackThread").prop("checked");
			$("#ctl00_cphRoblox_PostView1_ctl00_TrackThread").parent().html("").addClass("rplusforumcheckbox").append(
				$("<label>").append($("<input type=\"checkbox\">").prop("checked", tracked).change(function () {
					console.log("tick", $(this).prop("checked"));
					if ($(this).prop("checked")) {
						Roblox.forum.trackThread(id);
					} else {
						Roblox.forum.untrackThread(id);
					}
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
				var poster = Roblox.users.getIdFromUrl(post.find("a[href*='/users/']").attr("href"));
				var postId = Number(post.find("a[name]").attr("name")) || 0;
				var postCount = 0;
				post.find(">.forum-content-background:first-child>table>tbody>tr>td b").each(function () {
					if (($(this).text() || "").startsWith("Total Posts")) {
						$(this).parent().html("<b>Total Posts:</b> " + addComma(postCount = (Number(($(this).parent().text() || "").replace(/\D+/g, "")) || 0)));
					}
				});

				if (f.blocking) {
					Roblox.social.isBlocked(poster).then(function (isBlocking) {
						if (isBlocking) {
							post.hide();
						}
					});
				}

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
					var rapLabel = $("<span class=\"rplusinventory robux-text\" userid=\"" + poster + "\">...</span>");
					post.find(">.forum-content-background:first-child>table>tbody>tr:nth-child(2)").after($("<tr>").append($("<td>").append("<b>RAP</b>: ").append(rapLabel)));
					Roblox.inventory.getCollectibles(poster).then(function (inv) {
						rapLabel.text("R$" + global.addCommas(inv.combinedValue));
					}, function () {
						rapLabel.text("FAILED");
					});
				}

				if (post.find("img[src *= '/BCOverlay.']").length) {
					post.find(".post-response-options").prepend($("<a class=\"btn-control btn-control-medium\" href=\"javascript:/* Trade */\">Trade</a>").click(function () {
						Roblox.trades.openSettingBasedTradeWindow(poster);
					}));
				}

				if (f.postIds) {
					post.find("a[name]").parent().prepend("<a href=\"/Forum/ShowPost.aspx?PostId=" + id + (page != 1 ? "&PageIndex=" + page : "") + (postId != id ? "#" + postId : "") + "\">#" + postId + "</a> - ");
				}

				if (f.embedding) {
					var isAuthenticatedUserMod = f.admins.includes(authenticatedUserRole.name);
					Roblox.groups.getUserRole(2518656, poster).then(function (role) {
						if (!f.admins.includes(role.name) && isAuthenticatedUserMod) {
							post.find(".post-response-options").prepend($("<a href=\"javascript:/* Forum Embedding */\" class=\"btn-control btn-control-medium\">" + (role.name == "Thugs" ? "Unban" : "Ban") + "</a>").click(function () {
								var button = $(this);
								if (button.attr("disabled")) {
									return;
								}
								button.attr("disabled", "disabled");
								var rid = button.text() == "Ban" ? 17759787 : 16556234;
								Roblox.groups.setUserRole(2518656, poster, rid).then(function () {
									button.text(rid == 16556234 ? "Ban" : "Unban");
									button.removeAttr("disabled");
								}, function () {
									button.text(rid == 16556234 ? "Unban" : "Ban");
									button.removeAttr("disabled");
								});
							}));
						}
						forumService.embed(content, role.name != "Thugs" && role.name != "Guest" ? Math.max(role.name == "Member" ? 1 : 3, Math.ceil((postCount + 1) / 1000)) : 0, f.embedSize);
					});
				}
			}).find(">.forum-content-background:first-child").dblclick(function () {
				$(this).parent().toggleClass("forumshrink");
			});
		});
	});

	return {};
};

RPlus.Pages.ForumShowPost.patterns = [/^\/Forum\/ShowPost\.aspx/i];


// WebGL3D
