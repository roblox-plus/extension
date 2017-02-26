/*
	jquery.notifications.ext.js [10/08/2016]
*/
$.notification.on("beforeCreate", function(){
	if(this.details.hasOwnProperty("url")){
		this.creationDetails.isClickable = true;
	}
});

$.notification.on("click", function(){
	if(this.details.hasOwnProperty("url")){
		window.open(this.details.url);
	}
});


$.notification.on("afterCreate", function(){
	var volume = this.details.hasOwnProperty("volume") ? this.details.volume : .5;
	if(this.details.hasOwnProperty("robloxSound") && this.details.robuxSound){
		Roblox.audio.getSoundPlayer(this.details.robloxSound, function(player){
			player.play(volume);
		});
	}else if(this.details.hasOwnProperty("speak") && this.details.speak){
		chrome.tts.speak(this.details.speak, { volume: volume });
	}
});


// WebGL3D
