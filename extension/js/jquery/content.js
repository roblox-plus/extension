// content.js [4/4/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
fixCB(({
	"text/html": function (subdomain, upath, list) {
		if (document.querySelector("#navigation .rplus-icon") || (["help", "corp", "developer", "wiki", "devforum", "blog", "api", "m", "bloxcon", "setup", "content", "polls"]).indexOf(subdomain = subdomain[subdomain.length - 3]) >= 0) { return; }
		
		storage.get("twemoji", function (enabled) {
			if (!enabled) {
				return;
			}

			var emojiSelector = "h2,p,div";
			var addEmojis = function (element) {
				setTimeout(function () {
					twemoji.parse(element);
				}, 500);
			};

			$(emojiSelector).each(function () {
				addEmojis(this);
			});

			var emojiObserver = new MutationObserver(function (records) {
				records.forEach(function (record) {
					record.addedNodes.forEach(function (e) {
						if ($(e).is(emojiSelector)) {
							addEmojis(e);
						}
					});
				});
			});

			emojiObserver.observe(document.body, { childList: true, subtree: true });
		});

		$("body").on("click", ".friend-status.icon-game", function (e) {
			e.preventDefault();
			var id = Roblox.users.getIdFromUrl($(this).parent().parent().find(">.friend-link").attr("href"));
			if (id) {
				Roblox.games.launch({
					followUserId: id
				});
			}
		}).on("click", ".rplusinventory[userid]", function () {
			RPlus.quickInfo.trigger(Roblox.users.getProfileUrl(Number($(this).attr("userid"))));
		});

		$("head").append($("<script>").attr("src", ext.getUrl("/js/jquery/overwrite.js")));
	}
})[document.contentType])(window.location.hostname.split("."), url.send(), []);



// WebGL3D
