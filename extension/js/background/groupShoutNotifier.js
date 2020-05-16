/* background/notifiers/groupShoutNotifier.js [06/04/2017] */
RPlus.notifiers.groupShout = (function () {
	const getGroupWhitelist = function() {
		return new Promise(function(resolve, reject) {
			Extension.Storage.Singleton.get("groupShoutNotifier_mode").then(mode => {
				if (mode !== "whitelist") {
					resolve(null);
					return;
				}

				Extension.Storage.Singleton.get("groupShoutNotifierList").then(whitelist => {
					resolve(whitelist || {});
				}).catch(reject);
			}).catch(reject);
		});
	};

	return RPlus.notifiers.init({
		name: "Group Shout",
		sleep: 15 * 1000,
		isEnabled: function (callBack) {
			Extension.Storage.Singleton.get("groupShoutNotifier").then(function(on) {
				callBack(on);
			}).catch(function(e) {
				console.warn(e);
				callBack(false);
			});
		},
		requireAuthenticatedUser: true
	}, function (user, cache, rerun) {
		return new Promise(function (resolve, reject) {
			getGroupWhitelist().then(whitelist => {
				$.get(`https://groups.roblox.com/v1/users/${user.id}/groups/roles`).done((r) => {
					let cacheTimestamp = cache.timestamp || 0;
					r.data.forEach(group => {
						let shout = group.group.shout;
						let timestamp = shout ? new Date(shout.updated).getTime() : 0;
						if (cache.timestamp && timestamp <= cache.timestamp) {
							return;
						}

						cacheTimestamp = Math.max(cacheTimestamp, timestamp);
						if (!rerun || !shout.body) {
							return;
						}

						if (whitelist && !whitelist[group.group.id]) {
							console.log("Skipping group shout notification because the group is not whitelisted", group.group);
							return;
						} else {
							console.log("RPlus.notifiers.groupShout", group.group);
						}

						let links = [];
						let buttons = [];
						foreach(shout.body.match(url.roblox.linkify) || [], function (n, o) {
							if (buttons.length < 2) {
								links.push(o);
								buttons.push("Visit link " + links.length);
							} else {
								return true;
							}
						});
						
						Extension.Storage.Singleton.get("notifierSounds").then(notifierSounds => {
							Roblox.thumbnails.getGroupIconUrl(group.group.id, 420, 420).then(groupIconUrl => {
								$.notification({
									tag: "groupshout" + group.group.id,
									title: group.group.name,
									message: string.clean(shout.body.replace(/https?:\/\/w?w?w?\./gi, "")),
									icon: groupIconUrl,
									buttons: buttons,
									clickable: true,
									metadata: {
										robloxSound: Number((notifierSounds || {}).groupShout) || 0,
										url: Roblox.groups.getGroupUrl(group.group.id, group.group.name),
										speak: "Group shout from " + group.group.name
									}
								}).click(function () {
									this.close();
								}).buttonClick(function (index) {
									window.open(links[index]);
								});
							}).catch(e => {
								console.warn("failed to load group icon for notification", e, group);
							});
						}).catch(e => {
							console.warn(e);
						});
					});

					cache.timestamp = cacheTimestamp;
					resolve([]);
				}).fail((jxhr, errors) => {
					reject(errors);
				});
			}).catch(reject);
		});
	});
})();


// WebGL3D
