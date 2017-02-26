/*
	soundService.js [11/24/2016]
*/

soundService = (function(){
	var cache = {};
	
	return function(src){
		if(typeof(src) != "string"){
			src = "";
		}
		if(cache[src]){
			return cache[src];
		}
		
		var element = document.createElement("audio");
		var readyToPlay = false;
		var failed = false;
		
		element.addEventListener("canplaythrough", function(){
			cache[src].trigger("ready");
			if(readyToPlay){
				element.play();
			}
		});
		element.addEventListener("play", function(){
			cache[src].trigger("play");
		});
		element.addEventListener("pause", function(){
			cache[src].trigger("pause");
			cache[src].trigger("stop");
		});
		element.addEventListener("ended", function(){
			cache[src].trigger("stop");
		});
		element.addEventListener("error", function(){
			failed = true;
			cache[src].trigger("error");
		});
		
		element.src = src;
		
		return cache[src] = $.addTrigger({
			src: element,
			
			play: function(callBack){
				if(typeof(callBack) == "number"){
					element.volume = callBack;
				}
				if(typeof(callBack) == "function"){
					return this.on("play", callBack);
				}else if(element.readyState == 4){
					element.play();
				}else if(!element.readyState){
					readyToPlay = true;
				}
				return this;
			},
			stop: function(callBack){
				if(callBack){
					return this.on("stop", callBack);
				}else{
					readyToPlay = false;
					element.pause();
					element.currentTime = 0;
				}
				return this;
			},
			pause: function(callBack){
				if(callBack){
					return this.on("pause", callBack);
				}else{
					readyToPlay = false;
					element.pause();
				}
				return this;
			},
			
			fail: function(callBack){
				if(failed){
					callBack();
				}else{
					return this.on("fail", callBack);
				}
				return this;
			},
			
			
			playing: function(){ return !this.src.paused; },
			volume: function(v){
				if(v){
					this.src.volume = v;
					return this;
				}else{
					return this.src.volume;
				}
			}
		});
	};
})();



// WebGL3D
