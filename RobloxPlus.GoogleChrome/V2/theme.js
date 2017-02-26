// theme.js [4/4/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
(function (subdomain, styleTag, overwritejs, xhr, extUrl, interval) {
	if (document.querySelector("#navigation .rplus-icon")) { window.location.reload(true); return; } else if ((["help", "corp", "developer", "wiki", "devforum", "blog", "api", "m", "bloxcon", "setup", "content", "polls"]).indexOf(subdomain = subdomain[subdomain.length - 3]) >= 0 || document.contentType != "text/html") { return; }
	overwritejs.setAttribute("src", extUrl("overwrite.js"));

	if (localStorage.getItem("rplusIcons")) {
		styleTag.innerHTML = localStorage.getItem("rplusIcons");
	}
	xhr.onload = function () {
		var size = document.querySelector(".container-main>.content") ? 1688 : 1319;
		localStorage.setItem("rplusIcons", styleTag.innerHTML = xhr.responseText.replace(/url\([^)]*\)/g, function (u) {
			return "url(" + extUrl(u.substring(4, u.length - 1)) + ")";
		}).replace(/@media\s*\(min-width:\s*\d+px\)/g, "@media (min-width: " + size + "px)").replace(/@media\s*\(max-width:\s*\d+px\)/g, "@media (max-width: " + (size - 1) + "px)"));
	};
	xhr.open("GET", extUrl("css/customIcon.css"), true);

	interval = function () {
		if (document.body && document.head) {
			document.head.appendChild(styleTag);
			document.head.appendChild(overwritejs);
			if (window.location.href.match(/\/games\/341017984\//)) {
				document.body.className = "easter-theme";
			} else if (window.location.href.match(/\/users\/\d+\/profile/) && document.querySelector(".header-title .icon-obc")) {
				document.body.className = "obc-theme";
			} else if (localStorage.getItem("rplusTheme") && !window.location.href.match(/\/Trade\/TradeWindow\.aspx/i)) {
				document.body.className = localStorage.getItem("rplusTheme");
			}
			xhr.send();
		} else {
			setTimeout(interval, 1);
		}
	};
	interval();
})(window.location.hostname.split("."), document.createElement("style"), document.createElement("script"), new XMLHttpRequest(), (window.browser || window.chrome || { extension: { getURL: function (x) { return (localStorage.getItem("RPLUS_EXTURL") || "/") + x; } } }).extension.getURL);



// WebGL3D
