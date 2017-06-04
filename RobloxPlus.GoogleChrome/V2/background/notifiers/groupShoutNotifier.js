/* background/notifiers/groupShoutNotifier.js [06/04/2017] */

var RPlus = RPlus || {};
RPlus.notifiers = RPlus.notifiers || {};
// Leaving groupNotifier for legacy reasons.
// TODO: Delete groupNotifier accessor
RPlus.notifiers.groupShout = groupNotifier = RPlus.notifiers.groupShout || (function () {
	var groupNotifier;
	groupNotifier = setupNotifier(function (loop, uid) {
		var startup = groupNotifier.ran != uid;
		$.get("https://www.roblox.com/Feeds/GetUserFeed").done(function (r) {
			var whitelist = storage.get("groupShoutNotifierList") || {};
			var got = {};
			$._(r).find(".feeds>.list-item").each(function () {
				var group = $(this).find(".list-content>a[href*='gid=']");
				if (group.length) {
					var id = Number(url.param("gid", group.attr("href"))) || 0;
					if (!id || got[id]) { return; }
					got[id] = true;
					var shout = $(this).find(".feedtext.linkify").text();
					shout = shout.substring(1, shout.length - 1);
					var timestamp = new Date($(this).find(".text-date-hint").text().replace(/\s*\|\s*/g, " ")).getTime();
					if (!startup && (groupNotifier.cache[id] || 0) < timestamp && (storage.get("groupShoutNotifier_mode") != "whitelist" || whitelist[id])) {
						var links = [];
						var buttons = [];
						foreach(shout.match(url.roblox.linkify) || [], function (n, o) {
							if (buttons.length < 2) {
								links.push(o);
								buttons.push("Visit link " + links.length);
							} else {
								return true;
							}
						});
						var note = {
							header: group.text(),
							lite: string.clean(shout.replace(/https?:\/\/w?w?w?\./gi, "")),
							icon: $(this).find(".header-thumb").attr("src"),
							buttons: buttons,
							clickable: true,
							robloxSound: Number((storage.get("notifierSounds") || {}).groupShout) || 0,
							tag: "groupshout" + id,
							url: { url: group.attr("href"), close: true }
						};
						if (!note.robloxSound) {
							delete note.robloxSound;
							note.speak = "Group shout from " + note.header;
						}
						notify(note).button1Click(function () {
							window.open(links[0]);
						}).button2Click(function () {
							window.open(links[1]);
						});
					}
					groupNotifier.cache[id] = Math.max(groupNotifier.cache[id] || 0, timestamp);
				}
			});
			groupNotifier.ran = uid;
		}).always(function () {
			loop();
		});
	}, {
		userId: true,
		storage: "groupShoutNotifier"
	});

	groupNotifier.cache = {};
	groupNotifier.ran = 0;
	groupNotifier.run();

	return groupNotifier;
})();



// WebGL3D
