/*
	Asset.js [12/4/2016]
*/
(function(){
	var assetId = Roblox.catalog.getIdFromUrl(location.href);
	
	$("#AssetThumbnail").on("dragstart", function(e){
		e.originalEvent.dataTransfer.setData("text/plain", location.href);
	});
})();


// WebGL3D
