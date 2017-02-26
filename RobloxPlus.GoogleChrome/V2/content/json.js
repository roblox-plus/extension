/*
	content/json.js [12/10/2016]
*/
$(function(){
	if(document.contentType.startsWith("application/json")){
		var tag = $("pre");
		var json = JSON.parse(tag.html());
		var original = JSON.stringify(json);
		var pretty = JSON.stringify(json, null, "\t");
		var isPretty = false;
		$(document).keyup(function(e){
			if(e.keyCode == 13){
				tag.text((isPretty = !isPretty) ? pretty : original);
			}
		});
	}
});


// WebGL3D
