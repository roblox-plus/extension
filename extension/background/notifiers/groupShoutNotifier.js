/* background/notifiers/groupShoutNotifier.js [06/04/2017] */
RPlus.notifiers.groupShout = (function () {
	return RPlus.notifiers.init({
		name: "Group Shout",
		sleep: 15 * 1000,
		isEnabled: function (callBack) {
			callBack(storage.get("groupShoutNotifier"));
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			$.get("https://www.roblox.com/Feeds/GetUserFeed").done(function (r) {
				var whitelist = storage.get("groupShoutNotifierList") || {};
				var groups = {};
				var cacheTimestamp = cache.timestamp || 0;

				$._(r).find(".feeds>.list-item").each(function () {
					var group = $(this).find(".list-content>a[href*='gid=']");
					if (group.length) {
						var shout = $(this).find(".feedtext.linkify").text();
						shout = shout.substring(1, shout.length - 1);
						var timestamp = new Date($(this).find(".text-date-hint").text().replace(/\s*\|\s*/g, " ")).getTime();
						var groupId = Roblox.groups.getIdFromUrl(group.attr("href"));

						if (groupId < 0 || groups[groupId] || (cache.timestamp && timestamp <= cache.timestamp)) {
							return;
						}

						cacheTimestamp = Math.max(cacheTimestamp, timestamp);
						groups[groupId] = true;

						if (!rerun
							|| (storage.get("groupShoutNotifier_mode") === "whitelist" && !whitelist.hasOwnProperty(id))) {
							return;
						}

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
						
						$.notification({
							tag: "groupshout" + groupId,
							title: group.text(),
							message: string.clean(shout.replace(/https?:\/\/w?w?w?\./gi, "")),
							icon: $(this).find(".header-thumb").attr("src"),
							buttons: buttons,
							clickable: true,
							metadata: {
								robloxSound: Number((storage.get("notifierSounds") || {}).groupShout) || 0,
								url: group.attr("href"),
								speak: "Group shout from " + group.text()
							}
						}).click(function () {
							this.close();
						}).buttonClick(function (index) {
							window.open(links[index]);
						});
					}
				});

				cache.timestamp = cacheTimestamp;
				resolve([]);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		});
	});
})();


// WebGL3D
