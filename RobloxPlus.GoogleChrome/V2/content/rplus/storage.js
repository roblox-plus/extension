/*
	rplus/storage.js [11/26/2016]
*/
(window.RPlus || (RPlus = {})).storage = (function(){
	$("body").on("change", "input[data-rplus-storage][type='checkbox']", function(){
		$.storage($(this).data("rplus-storage"), $(this).is(":checked"));
	}).on("blur", "input[data-rplus-storage][type='text']", function(){
		$.storage($(this).data("rplus-storage"), $(this).val());
	}).on("change", "select[data-rplus-storage]", function(){
		$.storage($(this).data("rplus-storage"), $(this).val());
	}).on("input", "input[data-rplus-storage][type='range']", function(){
		$.storage($(this).data("rplus-storage"), Number($(this).val()));
	});

	$.storage.on("set", function(key, val){
		if(key == "sound.volume"){
			Roblox.audio.buttons.forEach(function(button){
				button.volume = val / 100;
				if(button.playing){
					button.playing.volume(val / 100);
				}
			});
		}
		$("[data-rplus-storage='" + key + "']").val(val).trigger("change");
	});
	
	return {};
})();



// WebGL3D
