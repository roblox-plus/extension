/*
	roblox/develop.js [04/29/2017]
*/
var Roblox = Roblox || {};

Roblox.forum = (function () {
	var setThreadTrackingState = $.promise.cache(function (resolve, reject, postId, isTracking) {
		Roblox.users.getCurrentUserId().then(function (authenticatedUserId) {
			if (authenticatedUserId <= 0) {
				reject([{
					code: 0,
					message: "Unauthenticated"
				}]);
				return;
			}

			var url = "https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + postId;
			$.get(url).done(function (r) {
				r = $._(r);
				$.post(url, {
					"ctl00$cphRoblox$PostView1$ctl00$TrackThread": isTracking ? "on" : "",
					__EVENTTARGET: "ctl00$cphRoblox$PostView1$ctl00$TrackThread",
					__VIEWSTATE: r.find("#__VIEWSTATE").val(),
					__EVENTVALIDATION: r.find("#__EVENTVALIDATION").val()
				}).done(function () {
					resolve();
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, reject);
	}, {
		queued: true,
		resolveExpiry: 250,
		rejectExpiry: 500
	});

	function parseMyForumsRow(row) {
		var stats = row.find(".normalTextSmaller");
		var status = (row.find("noimg,img").attr("title") || "").toLowerCase();
		var lastReplyUrl = row.find(".last-post").attr("href");
		return {
			id: Roblox.forum.getPostIdFromUrl(row.find(".post-list-subject").attr("href")),
			subject: row.find(".post-list-subject").text().trim(),
			poster: {
				id: Roblox.users.getIdFromUrl(row.find(".post-list-author").attr("href")),
				username: row.find(".post-list-author").text().trim()
			},
			lastReply: {
				id: Number((lastReplyUrl.match(/#(\d+)/) || ["", 0])[1]) || 0,
				page: Number((lastReplyUrl.match(/PageIndex=(\d+)/i) || ["", 1])[1]) || 1,
				date: new Date(row.find(".last-post span.normalTextSmaller").text()).getTime(),
				poster: (row.find(".last-post div.normalTextSmaller").text() || "").trim()
			},
			replies: Number((stats[1] || { innerText: "0" }).innerText.replace(/\D+/g, "")) || 0,
			views: Number((stats[2] || { innerText: "0" }).innerText.replace(/\D+/g, "")) || 0,
			popular: status.indexOf("popular") >= 0,
			read: status.indexOf("not read") < 0
		};
	}


	if (ext.isBackground) {
		/* Get forum thread without marking as read */
		chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
			var requestHeaders = [];
			details.requestHeaders.forEach(function (header) {
				if (header.name != "Cookie") {
					requestHeaders.push(header);
				}
			});
			return {
				requestHeaders: requestHeaders
			};
		}, {
			urls: ["https://forum.roblox.com/Forum/ShowPost.aspx*RobloxPlus*"],
			types: ["xmlhttprequest"]
		}, ["requestHeaders", "blocking"]);
	}


	return {
		getPostIdFromUrl: function (url) {
			return Number((url.match(/PostID=(\d+)/i) || ["", 0])[1]);
		},

		trackThread: $.promise.cache(function (resolve, reject, postId) {
			if (typeof (postId) != "number" || postId <= 0) {
				reject([{
					code: 0,
					message: "Invalid postId"
				}]);
				return;
			}

			setThreadTrackingState(postId, true).then(resolve, reject);
		}, {
			resolveExpiry: 250,
			rejectExpiry: 500,
			queued: true
		}),

		untrackThread: $.promise.cache(function (resolve, reject, postId) {
			if (typeof (postId) != "number" || postId <= 0) {
				reject([{
					code: 0,
					message: "Invalid postId"
				}]);
				return;
			}

			setThreadTrackingState(postId, false).then(resolve, reject);
		}, {
			resolveExpiry: 250,
			rejectExpiry: 500,
			queued: true
		}),

		getTrackedThreads: $.promise.cache(function (resolve, reject) {
			Roblox.users.getCurrentUserId().then(function (userId) {
				if (userId <= 0) {
					reject([{
						code: 0,
						message: "Unauthorized"
					}]);
				}

				$.get("https://forum.roblox.com/Forum/User/MyForums.aspx").done(function (r) {
					var data = {
						data: []
					};
					$._(r).find("#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking .forum-table-row").each(function () {
						data.data.push(parseMyForumsRow($(this)));
					});
					resolve(data);
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 20 * 1000,
			queued: true
		}),

		getRecentThreads: $.promise.cache(function (resolve, reject) {
			Roblox.users.getCurrentUserId().then(function (userId) {
				if (userId <= 0) {
					reject([{
						code: 0,
						message: "Unauthorized"
					}]);
				}

				$.get("https://forum.roblox.com/Forum/User/MyForums.aspx").done(function (r) {
					var data = {
						data: []
					};
					$._(r).find("#ctl00_cphRoblox_MyForums1_ctl00_ParticipatedThreads .forum-table-row").each(function () {
						data.data.push(parseMyForumsRow($(this)));
					});
					resolve(data);
				}).fail(function (jxhr, errors) {
					reject(errors);
				});
			}, reject);
		}, {
			resolveExpiry: 30 * 1000,
			rejectExpiry: 20 * 1000,
			queued: true
		}),

		getForumThreadReplies: $.promise.cache(function (resolve, reject, postId, cursor) {
			if (typeof (cursor) != "number" || cursor < 1) {
				cursor = 1;
			}
			$.get("https://forum.roblox.com/Forum/ShowPost.aspx", {
				PostID: postId,
				PageIndex: cursor || 1,
				RobloxPlus: ""
			}).done(function (r) {
				r = $._(r);
				var maxPage = Number((r.find("#ctl00_cphRoblox_PostView1_ctl00_Pager .normalTextSmallBold").text().match(/^Page\s*[\d,]+\s*of\s*([\d,]+)/i) || ["", "1"])[1].replace(/,/g, "")) || 1;
				var ret = {
					subject: r.find("#ctl00_cphRoblox_PostView1_ctl00_PostTitle").text(),
					data: [],
					nextPageCursor: cursor < maxPage ? cursor + 1 : null,
					previousPageCursor: cursor > 1 ? cursor - 1 : null
				};
				r.find("#ctl00_cphRoblox_PostView1_ctl00_PostList .forum-post").each(function () {
					var poster = $(this).find("a.normalTextSmallBold[href*='/users/']");
					var pid = $(this).find(".normalTextSmaller>a[name]");
					var body = $(this).find(".normalTextSmall.linkify");
					ret.data.push({
						id: Number(pid.attr("name")),
						poster: {
							id: Roblox.users.getIdFromUrl(poster.attr("href")),
							username: poster.text()
						},
						body: body.html(body.html().replace(/<\s*br\s*>/g, "\n")).text(),
						posted: new Date(pid.parent().text()).getTime()
					});
				});
				resolve(ret);
			}).fail(function (jxhr, errors) {
				reject(errors);
			});
		}, {
			resolveExpiry: 15 * 1000,
			rejectExpiry: 10 * 1000,
			queued: true
		})
	};
})();

Roblox.forum = $.addTrigger($.promise.background("Roblox.forum", Roblox.forum));

// WebGL3D
