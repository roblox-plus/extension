var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Friends = function () {
	var id = Roblox.users.getIdFromUrl(location.href) || users.userId;

	if (id == users.userId) {
		var unfollowAll;
		var followFriends;

		$(".friends-content>button").first().after(
			unfollowAll = $("<button class=\"btn-fixed-width btn-control-xs ignore-button\">Unfollow All</button>").click(function () {
				confirm.modal({
					text: "Are you sure you want to unfollow everyone?",
					foot: "Will not unfollow users in your friends list"
				}, function (c) {
					if (!c) { return; }
					Roblox.social.getFriends(id).then(function (friends) {
						var loading = siteUI.feedback("Unfollowing everyone... (this could take a while)").destroy(function () {
							siteUI.feedback({ type: "success", text: "Finished unfollowing everybody!" }).hide("destroy").show(false);
						}).show();
						var friendIds = [];
						friends.forEach(function (friend) {
							friendIds.push(friend.id);
						});
						var removeAll; removeAll = function () {
							$.get("/users/friends/list-json?pageSize=200&imgWidth=110&imgHeight=110&imgFormat=png&friendsType=Following&userId=" + id).success(function (r) {
								var mcb = r.Friends && r.Friends.length;
								var dcb = 0;
								var fcb = function () {
									if (++dcb == mcb) {
										if (r.TotalFriends > 200) {
											removeAll();
										} else {
											loading.destroy();
										}
									}
								};
								if (mcb) {
									foreach(r.Friends, function (n, o) {
										if (friendIds.includes(o.UserId)) {
											fcb();
										} else {
											Roblox.social.unfollowUser(o.UserId).then(fcb, fcb);
										}
									});
								} else {
									loading.destroy();
								}
							}).fail(removeAll);
						};
						removeAll();
					}, function () {
						alert("Failed to load friends! Wait a few seconds and try again.");
					});
				});
			}).hide()
		).after(
			followFriends = $("<button class=\"btn-control-xs ignore-button\">Follow All Friends</button>").click(function () {
				confirm.modal("Are you sure you want to follow everyone you're friends with?", function (c) {
					if (!c) { return; }
					Roblox.social.getFriends(id).then(function(friends){
						var dcb = 0;
						friends.forEach(function (friend) {
							Roblox.social.followUser(friend.id).then(function () {
								if (++dcb == friends.length) {
									siteUI.feedback({ type: "success", text: "Followed all friends!" }).show();
								}
							}, function () {
								if (++dcb == friends.length) {
									siteUI.feedback({ type: "success", text: "Followed all friends!" }).show();
								}
							});
						});
					});
				});
			}).hide()
		);

		setInterval(function () {
			unfollowAll[$("#following.rbx-tab.active").length && $(".avatar-card").length ? "show" : "hide"]();
			followFriends[$("#friends.rbx-tab.active").length && $(".avatar-card").length ? "show" : "hide"]();
		}, 250);
	}

	return {};
};

RPlus.Pages.Friends.patterns = [/^\/users\/(\d+)\/friends/i, /^\/users\/friends/i];


// WebGL3D
