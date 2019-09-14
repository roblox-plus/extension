/*
	roblox/thumbnails.js [10/15/2016]
*/
var Roblox = Roblox || {};

Roblox.thumbnails = (function(){
	var sizes = [
		{ x: 48, y: 48 },
		{ x: 60, y: 62 },
		{ x: 75, y: 75 },
		{ x: 100, y: 100 },
		{ x: 110, y: 110 },
		{ x: 160, y: 100 },
		{ x: 250, y: 250 },
		{ x: 352, y: 352 },
		{ x: 420, y: 230 },
		{ x: 420, y: 420 }
	];
	
	function urlBuilder(path, param, x, y){
		x = x || "width";
		y = y || "height";
		return function(id, size){
			size = sizes[typeof(size) == "number" ? size : 9];
			return "https://www.roblox.com/" + path + "?" + param + "=" + id + "&" + x + "=" + size.x + "&" + y + "=" + size.y;
		};
	}
	
	 return {
		sizes: sizes,
		
		getUserHeadshotThumbnailUrl: urlBuilder("headshot-thumbnail/image", "userId"),
		getUserBustThumbnailUrl: urlBuilder("bust-thumbnail/image", "userId"),
		getUserAvatarThumbnailUrl: urlBuilder("avatar-thumbnail/image", "userId"),
		
		getAssetThumbnailUrl: urlBuilder("asset-thumbnail/image", "assetId"),
		
		getOutfitThumbnailUrl: urlBuilder("outfit-thumbnail/image", "userOutfitId")
	};
})();



// WebGL3D
