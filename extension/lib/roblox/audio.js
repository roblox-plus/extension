/*
	roblox/audio.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).audio = (function () {
	var getSoundUrl = $.promise.cache(function (resolve, reject, assetId) {
		Roblox.content.getAssetContentUrl(assetId).then(resolve, reject);
	}, {
		resolveExpiry: 30 * 60 * 1000,
		rejectExpiry: 2 * 60 * 1000
	});

	
	if (ext.isContentScript) {
		var soundMap = {};
		$(function () {
			var dataName = ext.id + "-robloxsound";
			var attrName = "data-" + dataName;

			$("body").on("click", ".icon-play[" + attrName + "]", function () {
				var id = $(this).data(dataName);
				var volume = $(this).data("volume");
				var player = soundMap[id];
				var searchAttr = "[" + attrName + "='" + id + "']";

				if (typeof (volume) != "number") {
					volume = .5;
				}

				if (player) {
					player.play(volume);
				} else if (id <= 0) {
					return;
				} else {
					$(".icon-play" + searchAttr).addClass("icon-audio").removeClass("icon-play");
					Roblox.audio.getSoundPlayer(id).then(function (player) {
						soundMap[id] = player;
						player.play(function () {
							$("span" + searchAttr).addClass("icon-pause").removeClass("icon-play icon-audio");
						}).stop(function () {
							$("span" + searchAttr).addClass("icon-play").removeClass("icon-pause icon-audio");
						}).error(function () {
							$("span" + searchAttr).addClass("icon-brokenpage").removeClass("icon-play icon-audio icon-pause");
						});
						player.play(volume);
					}).catch(function(e) {
						console.error(e);
						$("span" + searchAttr).addClass("icon-brokenpage").removeClass("icon-play icon-audio icon-pause");
					});
				}
			}).on("click", ".icon-pause[" + attrName + "]", function () {
				var player = soundMap[$(this).data(dataName)];
				if (player) {
					player.pause();
				}
			});
		});
	}

	return {
		getSoundUrl: getSoundUrl,

		getSoundPlayer: function (assetId) {
			return new Promise(function(resolve, reject){
				getSoundUrl(assetId).then(function (url) {
					resolve(soundService(url));
				}, reject);
			});
		},

		createPlayButton: function (defaultVolume) {
			if (typeof (defaultVolume) != "number") {
				defaultVolume = .5;
			}

			var button = $("<span class=\"icon-play\">");
			button.setAudioId = function (assetId) {
				return button.attr("data-" + ext.id + "-robloxsound", assetId).addClass("icon-play").removeClass("icon-pause icon-audio icon-brokenpage");
			};
			button.setVolume = function (v) {
				return button.attr("data-volume", v);
			};

			button.setVolume(defaultVolume);
			return button;
		}
	};
})();

Roblox.audio = $.addTrigger($.promise.background("Roblox.audio", Roblox.audio));

// WebGL3D
