/*
	roblox/audio.js [11/24/2016]
*/
(window.Roblox || (Roblox = {})).audio = $.addTrigger({
	soundMap: { 0: "" },
	players: {},
	buttons: [],
	
	getSoundUrl: $.cache(request.backgroundFunction("Roblox.audio.getSoundUrl", function(id, callBack){
		id = Number(id) || 0;
		if(Roblox.audio.soundMap.hasOwnProperty(id)){
			callBack(Roblox.audio.soundMap[id]);
			return;
		}
		$.get("https://assetgame.roblox.com/asset/?id=" + id + " &soundCheck=RPlus").always(function(){
			callBack(Roblox.audio.soundMap[id]);
		});
	})),
	
	getSoundPlayer: function(id, callBack){
		this.getSoundUrl(id, function(url){
			callBack(soundService(url));
		});
	},
	
	createPlayButton: function(defaultVolume){
		var button = $("<span class=\"icon-play\">");
		button.setAudioId = function(id){
			return button.attr("data-" + ext.id + "-robloxsound", id).addClass("icon-play").removeClass("icon-pause icon-audio icon-brokenpage");
		};
		button.setVolume = function(v){return button.attr("data-volume", v);};
		return button.setVolume(typeof(defaultVolume) == "number" ? defaultVolume : .5);
	}
});


if(ext.isBackground){
	chrome.webRequest.onBeforeRedirect.addListener(function(details){
		var id = Number((details.url.match(/id=(\d+)/i) || ["", 0])[1]);
		Roblox.audio.soundMap[id] = details.redirectUrl;
		return { cancel: true };
	}, { urls: [ "https://assetgame.roblox.com/asset/?id=*&soundCheck=RPlus" ], types: [ "xmlhttprequest" ] });
}else if(ext.isContentScript){
	$(function(){
		var soundMap = {};
		var dataName = ext.id + "-robloxsound";
		var attrName = "data-" + dataName;
		
		$("body").on("click", ".icon-play[" + attrName + "]", function(){
			var id = $(this).data(dataName);
			var volume = $(this).data("volume");
			var player = soundMap[id];
			var searchAttr = "[" + attrName + "='" + id + "']";
			
			if(typeof(volume) != "number"){
				volume = .5;
			}
			
			if(player){
				player.play(volume);
			}else if(id <= 0){
				return;
			}else{
				$(".icon-play" + searchAttr).addClass("icon-audio").removeClass("icon-play");
				Roblox.audio.getSoundPlayer(id, function(player){
					soundMap[id] = player.play(function(){
						$("span" + searchAttr).addClass("icon-pause").removeClass("icon-play icon-audio");
					}).stop(function(){
						$("span" + searchAttr).addClass("icon-play").removeClass("icon-pause icon-audio");
					}).fail(function(){
						$("span" + searchAttr).addClass("icon-brokenpage").removeClass("icon-play icon-audio icon-pause");
					}).on("ready", function(){
						this.play(volume);
					});
				});
			}
		}).on("click", ".icon-pause[" + attrName + "]", function(){
			var player = soundMap[$(this).data(dataName)];
			if(player){
				player.pause();
			}
		});
	});
}



// WebGL3D
