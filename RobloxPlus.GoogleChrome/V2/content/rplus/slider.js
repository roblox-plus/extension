/*
	rplus/slider.js [11/26/2016]
*/
(window.RPlus || (RPlus = {})).slider = (function(){
	function fixSlider(slider){
		slider.each(function(){
			var val = Number($(this).val());
			var max = Number($(this).attr("max"));
			var min = Number($(this).attr("min"));
			var perc = "0%";
			if(val){
				perc = Math.floor(((val - min)/(max - min)) * 100) + "%";
			}
			$(this).attr({
				"style": "background: -webkit-linear-gradient(left, rgb(31, 115, 255), rgb(31, 115, 255) " + perc + ", rgb(175, 175, 175) " + perc + ", rgb(175, 175, 175));",
				"title": max >= 75 ? perc : val
			});
		});
	}
	
	fixSlider($(".rplus-slider"));
	$("body").on("input", "input[type='range'].rplus-slider", function(){
		fixSlider($(this));
	});
	
	return {
		fixSlider: fixSlider
	};
})();



// WebGL3D
