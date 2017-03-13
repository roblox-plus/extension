/*
	roblox/users.js [10/15/2016]
*/
(window.Roblox || (Roblox = {})).users = $.addTrigger({
	getIdFromUrl: function (url) {
		var match = url.match(/\/users\/(\d+)\//i) || url.match(/user\.aspx.*id=(\d+)/i) || ["", 0];
		return Number(match[1]) || 0;
	},

	getProfileUrl: function (info) {
		if (typeof (info) == "string") {
			return "https://www.roblox.com/users/profile?username=" + encodeURIComponent(info);
		}
		return "https://www.roblox.com/users/" + (Number(info) || 0) + "/profile";
	}
});



// WebGL3D
