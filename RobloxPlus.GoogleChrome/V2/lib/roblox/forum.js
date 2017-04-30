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

	return {
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
		})
	};
})();

Roblox.forum = $.addTrigger($.promise.background("Roblox.forum", Roblox.forum));

// WebGL3D
