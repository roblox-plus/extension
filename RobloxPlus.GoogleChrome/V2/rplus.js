/*
	rplus.cs [11/24/2016]
*/
rplus = {
	getGlobalSettings: $.cache(request.backgroundFunction("rplus.getGlobalSettings", function(callBack){
		$.get("https://assetgame.roblox.com/asset/?id=311113112").done(function(r){
			try{
				callBack(JSON.parse(decodeURIComponent(r.substring(7,r.length-9))));
			}catch(e){
				callBack({});
			}
		}).fail(function(){
			callBack({});
		});
	}), 60 * 1000),
	
	getSettings: $.cache(request.backgroundFunction("rplus.getSettings", function(callBack){
		$.getJSON(ext.getUrl("/settings.json"), function(settings){
			callBack(settings);
		}).fail(function(){
			console.error("Failed to load settings.json", arguments);
			callBack([]);
		});
	}), 500),
	
	getFeatures: $.cache(request.backgroundFunction("rplus.getFeatures", function(callBack){
		$.getJSON(ext.getUrl("/features.json"), function(features){
			callBack(features);
		}).fail(function(){
			console.error("Failed to load features.json", arguments);
			callBack([]);
		});
	}), 500)
};



// WebGL3D
