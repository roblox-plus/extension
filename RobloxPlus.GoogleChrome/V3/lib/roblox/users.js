/*
	roblox/users.js [10/15/2016]
*/
(window.Roblox || (Roblox = {})).users = $.addTrigger({
	page: {
		id: 0,
		username: ""
	},
	
	
	getIdFromUrl: function(url){
		return Number((url.match(/\/users\/(\d+)\//i) || url.match(/user\.aspx.*id=(\d+)/i) || ["", 0])[1]) || 0;
	},
	
	getProfileUrl: function(info){
		if(typeof(info) == "string"){
			return "https://www.roblox.com/users/profile?username=" + encodeURIComponent(info);
		}
		return "https://www.roblox.com/users/" + (Number(info) || 0) + "/profile";
	},
	
	
	getCurrentRobux: $.cache(request.backgroundFunction("Roblox.users.getCurrentRobux", function(callBack){
		$.get("https://api.roblox.com/currency/balance").done(function(r){
			callBack(Number(r.robux) || 0);
		}).fail(function(){
			callBack(0);
		});
	}), 5000),
	
	getNavigationCounts: $.cache(request.backgroundFunction("Roblox.users.getNavigationCounts", function(callBack){
		$.get("https://api.roblox.com/incoming-items/counts").done(function(r){
			callBack({
				"friendRequestCount": Number(r.friendRequestsCount) || 0,
				"unreadMessageCount": Number(r.unreadMessageCount) || 0
			});
		}).fail(function(){
			callBack({
				"friendRequestCount": 0,
				"unreadMessageCount": 0
			});
		});
	}), 5000),
	
	getCurrentId: $.cache(request.backgroundFunction("Roblox.users.getCurrentId", function(callBack){
		$.get("https://assetgame.roblox.com/Game/GetCurrentUser.ashx").done(function(r){
			callBack(Number(r) || 0);
		}).fail(function(){
			callBack(0);
		});
	}), 5000),
	
	getCurrentUserInfo: $.cache(request.backgroundFunction("Roblox.users.getCurrentUserInfo", function(callBack){
		Roblox.users.getCurrentId(function(userId){
			Roblox.users.getById(userId, callBack);
		});
	}), 5000),
	
	getById: $.cache(request.backgroundFunction("Roblox.users.getById", function(id, callBack){
		var template = {
			id: 0,
			username: "",
			bc: "NBC"
		};
		
		if(id <= 0){
			callBack(template);
			return;
		}
		
		$.get("https://www.roblox.com/profile?userId=" + id).done(function(r){
			template.id = r.UserId;
			template.username = r.Username;
			template.bc = r.OBC ? "OBC" : (r.TBC ? "TBC" : (r.BC ? "BC" : "NBC"));
		}).always(function(){
			callBack(template);
		});
	}), 60 * 1000),
	getByUsername: $.cache(request.backgroundFunction("Roblox.users.getByUsername", function(username, callBack){
		$.get("https://api.roblox.com/users/get-by-username", {username: username}).done(function(r){
			Roblox.users.getById(r.Id, callBack);
		}).fail(function(){
			Roblox.users.getById(0, callBack);
		});
	}), 60 * 1000)
});


if(ext.isContentScript){
	$(function(){
		Roblox.users.page.id = $("#chat-data-model").data("userid") || 0;
		Roblox.users.page.username = $("#navigation>ul>li.text-lead>a.text-overflow").text() || "";
	});
}



// WebGL3D
