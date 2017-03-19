/*
	roblox/audio.js [03/18/2017]
*/
(window.Roblox || (Roblox = {})).audio = (function () {
	var soundMap = {};

	var getSoundUrl = $.promise.cache(function (resolve, reject, assetId) {
		if (typeof (assetId) != "number" || assetId <= 0) {
			reject([{
				code: 0,
				message: "Invalid assetId"
			}]);
			return;
		}

		if (soundMap.hasOwnProperty(assetId)) {
			resolve(soundMap[assetId]);
			return;
		}

		$.get("https://assetgame.roblox.com/asset/", { id: assetId, soundCheck: "RPlus" }).always(function () {
			if (soundMap.hasOwnProperty(assetId)) {
				resolve(soundMap[assetId]);
			} else {
				reject([{
					code: 0,
					message: "Lookup failed"
				}]);
			}
		});
	}, {
		resolveExpiry: 30 * 60 * 1000,
		rejectExpiry: 2 * 60 * 1000
	});



	if (ext.isBackground) {
		chrome.webRequest.onBeforeRedirect.addListener(function (details) {
			var id = Number((details.url.match(/id=(\d+)/i) || ["", 0])[1]);
			soundMap[id] = details.redirectUrl;
			return { cancel: true };
		}, { urls: ["https://assetgame.roblox.com/asset/?id=*&soundCheck=RPlus"], types: ["xmlhttprequest"] });
	} else if (ext.isContentScript) {
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
					Roblox.audio.getSoundPlayer(id, function (player) {
						soundMap[id] = player.play(function () {
							$("span" + searchAttr).addClass("icon-pause").removeClass("icon-play icon-audio");
						}).stop(function () {
							$("span" + searchAttr).addClass("icon-play").removeClass("icon-pause icon-audio");
						}).fail(function () {
							$("span" + searchAttr).addClass("icon-brokenpage").removeClass("icon-play icon-audio icon-pause");
						}).on("ready", function () {
							this.play(volume);
						});
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

		getSoundPlayer: function (assetId, callBack) {
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
