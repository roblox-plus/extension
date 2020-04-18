/*
	roblox/audio.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Audio = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.audio");

		this.register([
			this.getSoundUrl
		]);
	}
	
	getSoundUrl(assetId) {
		return CachedPromise("Roblox.audio.getSoundUrl", (resolve, reject) => {
			Roblox.content.getAssetContentUrl(assetId).then(resolve).catch(reject);
		}, [assetId], {
			resolveExpiry: 30 * 60 * 1000,
			rejectExpiry: 2 * 60 * 1000
		});
	}

	getSoundPlayer(assetId) {
		return new Promise((resolve, reject) => {
			this.getSoundUrl(assetId).then((url) => {
				resolve(soundService(url));
			}).catch(reject);
		});
	}

	createPlayButton(defaultVolume) {
		if (typeof (defaultVolume) != "number") {
			defaultVolume = .5;
		}

		let button = $("<span class=\"icon-play\">");

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

Roblox.audio = new Roblox.Services.Audio();

if (Extension.Singleton.executionContextType == Extension.ExecutionContextTypes.tab) {
	$(function () {
		let soundMap = {};
		let dataName = ext.id + "-robloxsound";
		let attrName = "data-" + dataName;

		$("body").on("click", ".icon-play[" + attrName + "]", function () {
			let id = Number($(this).attr(attrName));
			let volume = Number($(this).attr("data-volume"));
			let player = soundMap[id];
			let searchAttr = "[" + attrName + "='" + id + "']";

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
			var player = soundMap[$(this).attr(attrName)];
			if (player) {
				player.pause();
			}
		});
	});
}

// WebGL3D
