/* background/notifiers/forumNotifier.js [06/04/2017] */

var RPlus = RPlus || {};
RPlus.notifiers = RPlus.notifiers || {};
// Leaving forumNotifier for legacy reasons.
// TODO: Delete forumNotifier accessor
RPlus.notifiers.forum = forumNotifier = RPlus.notifiers.forum || (function () {
	var forumNotifier;
	var threadCache = {};

	forumNotifier = setupNotifier(function (loop, uid) {
		var startup = forumNotifier.ran != uid;
		if (startup) {
			threadCache = {};
		}
		var blacklist = (storage.get("forums") || {}).blacklist;
		if (type(blacklist) != "array") {
			blacklist = [];
		}
		var dcb = 0;
		var mcb = 1;
		var tracked = [];
		var fcb = function () {
			if (++dcb == mcb) {
				loop();
			}
		};
		Roblox.users.getAuthenticatedUser().then(function (authenticatedUser) {
			mcb++;
			function handleForumData(data, isTrackedThreads) {
				forumNotifier.ran = uid;
				data.forEach(function (thread) {
					// If we're not starting up, and the thread is:
					// Just appearing and isn't a brand new post or something we just tracked
					// Has a new reply than we've seen before
					// not something we just posted
					// not blacklisted
					if (!startup && (
						(!threadCache.hasOwnProperty(thread.id) && !isTrackedThreads)
						|| (threadCache.hasOwnProperty(thread.id) && threadCache[thread.id].lastReply.id != thread.lastReply.id))
						&& thread.lastReply.poster != authenticatedUser.username
						&& !blacklist.includes(thread.id)) {
						mcb++;
						Roblox.forum.getForumThreadReplies(thread.id, thread.lastReply.page).then(function (post) {
							var o;
							for (var n in post.data) {
								if (post.data[n].id == thread.lastReply.id) {
									var reply = post.data[n];
									var note = {
										header: string.clean(reply.poster.username + " replied to thread\n" + post.subject.substring(0, 50)),
										lite: string.clean(reply.body.split("\n")[0]),
										icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(reply.poster.id, 3),
										buttons: ["Reply"],
										clickable: true,
										robloxSound: Number((storage.get("notifierSounds") || {}).forum) || 0,
										tag: "forum" + reply.id,
										url: {
											url: "https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + reply.id + (thread.lastReply.page != 1 ? "&PageIndex=" + thread.lastReply.page : "") + "#" + reply.id,
											close: true
										}
									};
									if (!note.robloxSound) {
										delete note.robloxSound;
										note.speak = note.header.split(/\n/)[0];
									}
									note = notify(note).button1Click(function () {
										window.open("https://forum.roblox.com/Forum/AddPost.aspx?mode=flat&PostID=" + reply.id);
										note.close();
									});
									break;
								}
							}
							fcb();
						}, fcb);
					}
					threadCache[thread.id] = thread;
				});
				fcb();
			}
			Roblox.forum.getTrackedThreads().then(function (data) {
				handleForumData(data.data);
			}, fcb);
			Roblox.forum.getRecentThreads().then(function (data) {
				handleForumData(data.data);
			}, fcb);
		}, fcb);
	}, {
		userId: true,
		storage: "forumNotifier",
		interval: 5 * 1000
	});

	forumNotifier.ran = 0;
	forumNotifier.run();
	forumNotifier.ransack = function (threadId) {
		delete threadCache[threadId];
	};

	return forumNotifier;
})();



// WebGL3D
