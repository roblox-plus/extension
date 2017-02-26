/*
	ROBLOX+ Account.js [11/25/2016]
*/
var pageContent = $("<div class=\"page-content\">");


function getExtensionJSONs(callBack){
	rplus.getFeatures(function(features){
		rplus.getSettings(function(settings){
			callBack(features, settings);
		});
	});
}


getExtensionJSONs(function(features, settings){
	console.log(features, settings);
	for(var settingsTitle in settings){
		var settingsList = $("<div class=\"col-sm-12\">");
		var slidUp = false;
		var settingContainer = $("<div class=\"rbx-tab-content\">").append(
			$("<h3>").text(settingsTitle).click(function(){
				var container = $(this).parent().find(">.section-content");
				if(container.data("slidup")){
					container.slideDown();
				}else{
					container.slideUp();
				}
				container.data("slidup", !container.data("slidup"));
			}),
			$("<div class=\"section-content\">").append(settingsList)
		);
		
		if(settingsTitle == "Basic"){
			settingsList.prepend($("<a class=\"btn-primary-sm\" id=\"rplus-updatelog\">").text("Update Log"));
			settingsList.prepend($("<a class=\"btn-alert-sm\" id=\"rplus-reload\">").text("Reload").attr("href", "javascript:;").click(function(){
				if(!this.hasAttribute("disabled")){
					$(this).attr("disabled", "").text("Reloading...");
					ext.reload();
					setTimeout(function(){ window.location.reload(true); }, 3000);
				}
			}));
		}
		
		settings[settingsTitle].forEach(function(setting){
			if(setting.key == "tts.usernamePronunciation"){
				setting.key += "." + Roblox.users.page.username;
				setting.defaultValue = Roblox.users.page.username;
			}
			
			var holdingContainer = $("<div>");
			var id = "rplus-storage-" + setting.key.replace(/\W+/g, "");
			var title = $("<label>").text(setting.title);
			
			if(typeof(setting.defaultValue) == "boolean"){
				var input = $("<input type=\"checkbox\">").attr({
					"data-rplus-storage": setting.key,
					"id": id
				});
				title.attr("for", id);
				$.storage(setting.key, function(value){
					input.prop("checked", typeof(value) == "boolean" ? value : setting.defaultValue);
				});
				holdingContainer.append(input, title).addClass("checkbox");
			}else if(typeof(setting.defaultValue) == "number" && setting.hasOwnProperty("minValue") && setting.hasOwnProperty("maxValue")){
				var input = $("<input type=\"range\">").attr({
					"id": id,
					"data-rplus-storage": setting.key,
					"max": setting.maxValue,
					"min": setting.minValue,
					"step": 1
				}).addClass("rplus-slider");
				$.storage(setting.key, function(value){
					input.val(typeof(value) == "number" ? value : setting.defaultValue).trigger("input");
				});
				holdingContainer.append(title, input);
			}else if(typeof(setting.defaultValue) == "number" && setting.hasOwnProperty("options")){
				var input = $("<select class=\"input-field rbx-select\">").attr({
					"data-rplus-storage": setting.key
				});
				title.addClass("text-label");
				for(var n in setting.options){
					input.append($("<option>").val(setting.options[n]).text(setting.options[n]));
				}
				$.storage(setting.key, function(value){
					input.val(typeof(value) == "string" ? value : setting.options[setting.defaultValue]);
				});
				holdingContainer.append(title, $("<div class=\"rbx-select-group\">").append(input)).addClass("form-group");
			}else if(typeof(setting.defaultValue) == "number"){
				var soundButton;
				var input = $("<input type=\"number\" class=\"form-control input-field\">").attr({
					"data-rplus-storage": setting.key,
					"id": id
				}).keyup(function(e){
					if(e.keyCode == 13){
						$(this).blur();
					}
				}).blur(function(){
					if(soundButton){
						soundButton.soundId = Number($(this).val()) || 0;
					}
				});
				title.addClass("text-label");
				$.storage(setting.key, function(value){
					input.val(typeof(value) == "number" ? value : setting.defaultValue);
					if(setting.isSound){
						$.storage("sound.volume", function(volume){
							soundButton = Roblox.audio.createPlayButton(volume / 100);
							soundButton.setAudioId(Number(input.val()) || 0);
							holdingContainer.append(soundButton);
						});
					}
				});
				holdingContainer.prepend(title, input).addClass("form-group");
			}else if(typeof(setting.defaultValue) == "string"){
				var input = $("<input type=\"text\" class=\"form-control input-field\">").attr({
					"data-rplus-storage": setting.key,
					"placeholder": setting.placeholder || "",
					"id": id,
					"maxlength": setting.maxLength || 128
				}).keyup(function(e){
					if(e.keyCode == 13){
						$(this).blur();
					}
				});
				title.addClass("text-label");
				$.storage(setting.key, function(value){
					input.val(typeof(value) == "string" ? value : setting.defaultValue);
				});
				holdingContainer.append(title, input).addClass("form-group");
			}
			settingsList.append(holdingContainer);
		});
		pageContent.append(settingContainer);
	}
	
	rplus.getGlobalSettings(function(global){
		$("#rplus-updatelog").attr("href", global.updateLog);
	});
});



$("<div class=\"content\">").insertAfter("#user-account").append(
	$("<h1>").text(ext.manifest.name + " Settings"),
	pageContent
);


// WebGL3D