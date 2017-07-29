/* background/notifiers/forumNotifier.js [06/04/2017] */
RPlus.notifiers.forum = (function () {
	return RPlus.notifiers.init({
		name: "Forum",
		sleep: 25 * 1000,
		isEnabled: function (callBack) {
			callBack(storage.get("forumNotifier"));
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			var blacklist = (storage.get("forums") || {}).blacklist;
			if (type(blacklist) != "array") {
				blacklist = [];
			}

			var dcb = 0;
			var mcb = 2;
			var tracked = [];
			var fcb = function () {
				if (++dcb == mcb) {
					resolve([]);
				}
			};
			
			function handleForumData(data, isTrackedThreads) {
				data.forEach(function (thread) {
					// If we're not starting up, and the thread is:
					// Just appearing and isn't a brand new post or something we just tracked
					// Has a new reply than we've seen before
					// not something we just posted
					// not blacklisted
					if (rerun && (
						(!cache.hasOwnProperty(thread.id) && !isTrackedThreads)
						|| (cache.hasOwnProperty(thread.id) && cache[thread.id].lastReply.id !== thread.lastReply.id))
						&& thread.lastReply.poster !== user.username
						&& !blacklist.includes(thread.id)) {
						mcb++;
						Roblox.forum.getForumThreadReplies(thread.id, thread.lastReply.page).then(function (post) {
							post.data.forEach(function (reply) {
								if (reply.id !== thread.lastReply.id) {
									return;
								}

								var title = string.clean(reply.poster.username + " replied to thread\n" + post.subject.substring(0, 50));
								$.notification({
									tag: "forum" + reply.id,
									title: title,
									context: string.clean(reply.body.split("\n")[0]),
									icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(reply.poster.id, 3),
									buttons: ["Reply"],
									clickable: true,
									metadata: {
										url: "https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + reply.id + (thread.lastReply.page != 1 ? "&PageIndex=" + thread.lastReply.page : "") + "#" + reply.id,
										robloxSound: Number((storage.get("notifierSounds") || {}).forum) || 0,
										speak: title.split(/\n/)[0]
									}
								}).click(function () {
									this.close();
								}).buttonClick(function () {
									this.close();
									window.open("https://forum.roblox.com/Forum/AddPost.aspx?mode=flat&PostID=" + reply.id);
								});
							});

							fcb();
						}, fcb);
					}

					cache[thread.id] = thread;
				});
				fcb();
			}

			Roblox.forum.getTrackedThreads().then(function (data) {
				handleForumData(data.data, true);
			}, fcb);

			Roblox.forum.getRecentThreads().then(function (data) {
				handleForumData(data.data, false);
			}, fcb);
		});
	});
})();


// WebGL3D
