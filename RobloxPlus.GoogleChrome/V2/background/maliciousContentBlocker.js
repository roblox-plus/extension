/* background/maliciousContentBlocker.js [06/10/2017] */
RPlus.maliciousContentBlocker = (function () {
	var blocked = {};
	var hasPermission = true;
	var permissions = {
		origins: ["<all_urls>"]
	};
	var mustCloseUrls = [];

	function getMaliciousUrls(callBack) {
		$.get("http://vps.roblox.plus/urlBlacklist.json").done(callBack).fail(function () {
			setTimeout(getMaliciousUrls, 30 * 1000, callBack);
		});
	}

	function blockMaliciousUrls(urls, reason, mustClose) {
		var blockList = [];
		for (var n in urls) {
			if (blocked[n]) {
				continue;
			}
			blocked[n] = urls[n];
			blockList.push(n);
		}
		if (blockList.length) {
			console.log("Blocking " + blockList.length + " url" + (blockList.length === 1 ? "" : "s") + "\n\t", blockList, "\n\tReason:", reason);
			if (mustClose) {
				mustCloseUrls = mustCloseUrls.concat(blockList);
			}
			chrome.webRequest.onBeforeRequest.addListener(function (details) {
				$.notification({
					title: "Attempt to load malicious content blocked",
					context: "Reason: " + reason,
					metadata: {
						expiration: 5000
					}
				});
				return { cancel: true };
			}, { urls: blockList }, ["blocking"]);
		}
	}

	function getAndBlockMaliciousUrls() {
		getMaliciousUrls(function (urls) {
			for (var n in urls) {
				var list = n.split(",");
				var obj = {};
				for (var i = 0; i < list.length; i++) {
					obj[list[i]] = urls[n].dateAdded;
				}
				blockMaliciousUrls(obj, urls[n].description, urls[n].mustClose);
			}
			setTimeout(getAndBlockMaliciousUrls, 15 * 1000);
		});
	}

	function checkPermissions() {
		chrome.permissions.contains(permissions, function (hasAccess) {
			hasPermission = hasAccess;
			if (hasAccess) {
				getAndBlockMaliciousUrls();
			} else {
				setTimeout(checkPermissions, 5000);
			}
		});
	}
	checkPermissions();

	request.sent(function (req, callBack) {
		if (req.request == "isBlockingMaliciousContent") {
			callBack(hasPermission);
		} else if (req.request == "startBlockingMaliciousContent") {
			chrome.permissions.request(permissions, function (granted) {
				callBack(granted);
			});
		}
	});

	setTimeout(function () {
		var tabNotifications = {};

		setInterval(function () {
			if (mustCloseUrls.length) {
				chrome.tabs.query({
					url: mustCloseUrls
				}, function (tabs) {
					var tabIds = [];
					tabs.forEach(function (tab) {
						tabIds.push(tab.id);
						if (!tabNotifications.hasOwnProperty(tab.id)) {
							tabNotifications[tab.id] = $.notification({
								tag: "maliciousTab:" + tab.id,
								title: "You're viewing a tab marked as malicious!",
								message: "At least one tab you have open is marked as malicous",
								context: "Click to close",
								clickable: true
							}).click(function () {
								this.close();
								chrome.tabs.remove([tab.id], function () { });
							}).close(function () {
								delete tabNotifications[tab.id];
							});
						}
					});
					for (var n in tabNotifications) {
						if (!tabIds.includes(Number(n))) {
							tabNotifications[n].close();
						}
					}
				});
			}
		}, 100);

		chrome.tabs.onRemoved.addListener(function (tabId) {
			if (tabNotifications[tabId]) {
				tabNotifications[tabId].close();
			}
		});
	}, 100);

	return {
	};
})();


// WebGL3D
