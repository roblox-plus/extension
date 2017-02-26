/*
	roblox/social.js [01/21/2017]
*/
(window.Roblox || (Roblox = {})).social = $.addTrigger({
	getBlockedUsers: $.cache(request.backgroundFunction("Roblox.social.getBlockedUsers", function(callBack){
		var blockedUsers = {};
		$.get("https://www.roblox.com/my/settings/json").done(function(r){
			r.BlockedUsersModel.BlockedUsers.forEach(function(user){
				blockedUsers[user.uid] = user.Name;
			});
		}).always(function(){
			callBack(blockedUsers);
		});
	}), 30 * 1000)
});

// WebGL3D
