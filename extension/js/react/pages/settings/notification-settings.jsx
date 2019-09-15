class NotificationSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	getCurrentAudioId(settingName, callBack) {
		storage.get("notifierSounds", function(notifierSounds) {
			if (notifierSounds && notifierSounds[settingName] && typeof(notifierSounds[settingName]) === "number") {
				callBack(notifierSounds[settingName]);
				return;
			}

			switch (settingName) {
				case "item":
					callBack(205318910);
					return;
				default:
					callBack(0);
			}
		});

	}

	promptAudioModal(title, description, currentAudioId) {
		return new Promise(function(resolve, reject) {
			let newAudioId = currentAudioId;
			let formGroup = $("<div class=\"form-group form-has-feedback\">");
			let audioButton = Roblox.audio.createPlayButton();
			let audioInput = $("<input class=\"form-control input-field\"/>").change(function() {
				let tryParseNumber = Number($(this).val());
				if (isNaN(tryParseNumber)) {
					tryParseNumber = Roblox.catalog.getIdFromUrl($(this).val());
				}

				if (isNaN(tryParseNumber) || tryParseNumber < 0) {
					newAudioId = 0;
				} else {
					newAudioId = tryParseNumber;
				}

				if (newAudioId > 0) {
					$(this).val(Roblox.catalog.getAssetUrl(newAudioId, "Sound"));
				} else {
					$(this).val("");
				}

				audioButton.setAudioId(newAudioId);
				$(this).blur();
			}).attr("placeholder", "https://www.roblox.com/library/205318910/Sound");

			formGroup.append(audioInput);
			formGroup.append(audioButton);
			formGroup.append($("<span class=\"form-control-label\"/>").text("Put a link to a Roblox audio in the box."));

			audioButton.setAudioId(currentAudioId);
			audioInput.val(Roblox.catalog.getAssetUrl(newAudioId, "Sound"));

			Roblox.ui.confirm({
				header: title,
				bodyHtml: formGroup,
				footNoteText: description,
				yesButtonText: "Save",
				noButtonText: "Cancel"
			}).then(function(saved) {
				if (saved) {
					resolve(newAudioId);
				} else {
					resolve(originalAudioId);
				}
			}).catch(reject);
		});
	}

	promptChangeNotifierSound(settingName) {
		let title;
		let description;
		let notificationSettings = this;

		switch (settingName) {
			case "item":
				title = "Item Notifier Sound";
				description = "This is the sound that will play when an item notification pops up.";
				break;
			case "tradeInbound":
			case "tradeOutbound":
			case "tradeCompleted":
			case "tradeDeclined":
				title = "Trade Notifier Sound";
				description = "This is the sound that will play when you a trade status changes.";
				break;
			case "friend":
				title = "Friend Notifier Sound";
				description = "This is the sound that will play when a friend notification pops up."
				break;
			case "groupShout":
				title = "Group Shout Notifier Sound";
				description = "This is the sound that will play when a group shout changes.";
				break;
			default:
				title = "Notifier Sound";
				description = "What sound would you like to play when a notification pops up?";
		}

		this.getCurrentAudioId(settingName, function(originalAudioId) {
			notificationSettings.promptAudioModal(title, description, originalAudioId).then(function (audioId) {
				if (originalAudioId === audioId) {
					return;
				}

				console.log("Set audio id:", audioId);
				storage.get("notifierSounds", function (notifierSounds) {
					notifierSounds = notifierSounds || {};
					notifierSounds[settingName] = audioId;
					storage.set("notifierSounds", notifierSounds);
				});
			}).catch(function () {
				// The user cancelled.
			});
		});
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Catalog</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Roblox created item notifications</span>
						<PillToggle getValue={storage.get.bind(storage, "itemNotifier")}
							onToggle={storage.set.bind(storage, "itemNotifier")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Notifications when a Roblox created item comes out or gets updated.</span>
						<a class="icon-Musical" onClick={this.promptChangeNotifierSound.bind(this, "item")}></a>
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Friends</h3>
					</div>
					<div class="section-content">
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Groups</h3>
					</div>
					<div class="section-content">
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Trades</h3>
					</div>
					<div class="section-content">
					</div>
				</div>
			</div>
		);
	}
}