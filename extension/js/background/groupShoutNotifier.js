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

						let buttons = [];
						foreach(shout.body.match(url.roblox.linkify) || [], function (n, o) {
							if (buttons.length < 2) {
								buttons.push({
									text: `Visit link ${buttons.length + 1}`,
									url: o
								});
							} else {
								return true;
							}
						});
						
						Extension.Storage.Singleton.get("notifierSounds").then(notifierSounds => {
							Roblox.thumbnails.getGroupIconUrl(group.group.id, 420, 420).then(groupIconUrl => {
								Extension.NotificationService.Singleton.createNotification({
									id: `groupShout${group.group.id}`,
									title: "Group Shout",
									context: group.group.name,
									message: string.clean(shout.body.replace(/https?:\/\/w?w?w?\./gi, "")),
									icon: groupIconUrl,
									buttons: buttons,
									displayExpiration: 30 * 1000,
									metadata: {
										robloxSound: Number((notifierSounds || {}).groupShout) || 0,
										url: Roblox.groups.getGroupUrl(group.group.id, group.group.name),
										speak: `Group shout from ${group.group.name}`
									}
								}).then(notification => {
									console.log("Group shout notification", group.group, notification);
								}).catch(console.error);
							}).catch(e => {
								console.warn("failed to load group icon for notification", e, group);
							});
						}).catch(e => {
							console.warn(e);
						});
					});

					cache.timestamp = math.ceil(cacheTimestamp, 1000);
					resolve([]);
				}).fail((jxhr, errors) => {
					reject(errors);
				});
			}).catch(reject);
		});
	});
})();


// WebGL3D
