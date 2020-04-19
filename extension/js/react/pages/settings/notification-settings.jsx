class NotificationSettings extends SettingsTab {
	constructor(props) {
		super(props);

		this.state.whitelistedGroups = "";
		this.state.groupError = "";
		this.state.showAddGroup = false;

		this.reloadWhitelistedGroups();
	}

	getCurrentAudioId(settingName, callBack) {
		storage.get("notifierSounds", function (notifierSounds) {
			if (notifierSounds && notifierSounds[settingName] && typeof (notifierSounds[settingName]) === "number") {
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
		return new Promise(function (resolve, reject) {
			let newAudioId = currentAudioId;
			let formGroup = $("<div class=\"form-group form-has-feedback\">");
			let audioButton = Roblox.audio.createPlayButton();
			let audioInput = $("<input class=\"form-control input-field\"/>").change(function () {
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

			if (newAudioId > 0) {
				audioInput.val(Roblox.catalog.getAssetUrl(newAudioId, "Sound"));
			} else {
				audioInput.val("");
			}

			Roblox.ui.confirm({
				header: title,
				bodyHtml: formGroup,
				footNoteText: description,
				yesButtonText: "Save",
				noButtonText: "Cancel"
			}).then(function (saved) {
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

		this.getCurrentAudioId(settingName, function (originalAudioId) {
			notificationSettings.promptAudioModal(title, description, originalAudioId).then(function (audioId) {
				if (originalAudioId === audioId) {
					return;
				}

				console.log("Set audio id:", audioId);
				storage.get("notifierSounds", function (notifierSounds) {
					notifierSounds = notifierSounds || {};

					if (settingName === "tradeInbound") {
						notifierSounds.tradeInbound = audioId;
						notifierSounds.tradeOutbound = audioId;
						notifierSounds.tradeCompleted = audioId;
						notifierSounds.tradeDeclined = audioId;
					} else {
						notifierSounds[settingName] = audioId;
					}

					Extension.Storage.Singleton.blindSet("notifierSounds", notifierSounds);
				});
			}).catch(function () {
				// The user cancelled.
			});
		});
	}

	toggleAddWhitelistedGroup() {
		let newState = {
			showAddGroup: !this.state.showAddGroup
		};

		if (!newState.showAddGroup) {
			newState.groupError = "";
			this.clearGroupUrl();
		}

		this.setState(newState);
	}

	clearGroupUrl() {
		$("#rplus-groupshout-notifier-input").val("");
	}

	removeGroup(groupId) {
		let notificationSettings = this;

		storage.get("groupShoutNotifierList", function (whitelistedGroups) {
			if (typeof (whitelistedGroups) !== "object") {
				whitelistedGroups = {};
			}

			if (whitelistedGroups.hasOwnProperty(groupId)) {
				delete whitelistedGroups[groupId];
				Extension.Storage.Singleton.set("groupShoutNotifierList", whitelistedGroups).then(() => {
					notificationSettings.reloadWhitelistedGroups();
				}).catch((err) => {
					console.warn(err);
				});
			}
		});
	}

	reloadWhitelistedGroups() {
		let notificationSettings = this;

		storage.get("groupShoutNotifierList", function (whitelistedGroups) {
			if (typeof (whitelistedGroups) !== "object") {
				whitelistedGroups = {};
			}

			if (Object.keys(whitelistedGroups).length > 0) {
				let tableRows = [];
				for (var groupId in whitelistedGroups) {
					tableRows.push(
						<tr>
							<td><a href={Roblox.groups.getGroupUrl(groupId, whitelistedGroups[groupId])}>{whitelistedGroups[groupId]}</a></td>
							<td><a class="icon-alert" onClick={notificationSettings.removeGroup.bind(notificationSettings, groupId)}></a></td>
						</tr>
					);
				}

				notificationSettings.setState({
					whitelistedGroups: (
						<table class="table table-striped rplus-groupshout-whitelist">
							<tbody>
								{tableRows}
							</tbody>
						</table>
					)
				});
			} else {
				notificationSettings.setState({
					whitelistedGroups: (<div class="section-content-off rplus-groupshout-whitelist">No groups listed.</div>)
				});
			}
		});
	}

	tryAddGroup(event) {
		if (event.keyCode !== 13) {
			return;
		}

		let groupId = Roblox.groups.getIdFromUrl(event.target.value);
		let notificationSettings = this;

		if (groupId > 0) {
			Roblox.groups.getUserGroup(groupId, Roblox.users.authenticatedUserId).then(function (membership) {
				if (!membership) {
					notificationSettings.setState({
						groupError: "You must be in the group to recieve notifications for it."
					});
					return;
				}

				storage.get("groupShoutNotifierList", function (whitelistedGroups) {
					if (typeof (whitelistedGroups) !== "object") {
						whitelistedGroups = {};
					}

					whitelistedGroups[groupId] = membership.group.name;
					Extension.Storage.Singleton.set("groupShoutNotifierList", whitelistedGroups).then(() => {
						notificationSettings.setState({
							showAddGroup: false,
							groupError: ""
						});
						notificationSettings.clearGroupUrl();
						notificationSettings.reloadWhitelistedGroups();
					}).catch((err) => {
						console.warn(err);
					});
				});
			}).catch(function (e) {
				console.error(e);
				notificationSettings.setState({
					groupError: "Failed to check group status. Please try again."
				});
			});
		} else {
			this.setState({
				groupError: "You must put a group url in this box."
			});
		}
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
						<PillToggle getValue={this.getPillValue.bind(this, "itemNotifier")}
							onToggle={this.setPillValue.bind(this, "itemNotifier")} />
						<div class="rbx-divider"></div>
						<span class="text-description">
							- Notifications when a <a href="https://www.roblox.com/catalog/?Category=1&CreatorID=1&SortType=3&IncludeNotForSale" class="text-link">Roblox created item</a> comes out or gets updated.
							<br/>
							- Notifications for <a href="https://www.roblox.com/catalog/?Category=13" class="text-link">community creations</a> from creators you follow.
						</span>
						<a class="icon-Musical" onClick={this.promptChangeNotifierSound.bind(this, "item")}></a>
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Friends</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Notifications about your friends statuses</span>
						<PillToggle getValue={this.getPillValue.bind(this, "friendNotifier.on")}
							onToggle={this.setPillValue.bind(this, "friendNotifier.on")} />
						<div class="rbx-divider"></div>
						<span class="text-description">On/off switch for all the options for friends below.</span>
						<a class="icon-Musical" onClick={this.promptChangeNotifierSound.bind(this, "friend")}></a>
					</div>
					<div class="section-content">
						<span class="text-lead">Notify when your friends come online</span>
						<PillToggle getValue={this.getPillValue.bind(this, "friendNotifier.online")}
							onToggle={this.setPillValue.bind(this, "friendNotifier.online")}
							disabled={!this.state.pills["friendNotifier.on"]} />
						<div class="rbx-divider"></div>
						<span class="text-lead">Notify when your friends go offline</span>
						<PillToggle getValue={this.getPillValue.bind(this, "friendNotifier.offline")}
							onToggle={this.setPillValue.bind(this, "friendNotifier.offline")}
							disabled={!this.state.pills["friendNotifier.on"]} />
						<div class="rbx-divider"></div>
						<span class="text-lead">Notify when your friends join a game</span>
						<PillToggle getValue={this.getPillValue.bind(this, "friendNotifier.game")}
							onToggle={this.setPillValue.bind(this, "friendNotifier.game")}
							disabled={!this.state.pills["friendNotifier.on"]} />
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Groups</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Group shout notifications</span>
						<PillToggle getValue={this.getPillValue.bind(this, "groupShoutNotifier")}
							onToggle={this.setPillValue.bind(this, "groupShoutNotifier")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Notifications when a group you're in changes their shout.</span>
						<a class="icon-Musical" onClick={this.promptChangeNotifierSound.bind(this, "groupShout")}></a>
					</div>
					<div class="section-content">
						<span class="text-lead">Only notify for selected groups</span>
						<PillToggle getValue={this.getPillValue.bind(this, "groupShoutNotifier_mode")}
							onToggle={this.setPillValue.bind(this, "groupShoutNotifier_mode")}
							disabled={!this.state.pills.groupShoutNotifier} />
						<div class="rbx-divider"></div>
						<span class="text-description">When turned on only groups on this list will be notified for.</span>
						<a class={"icon-plus" + (this.state.pills.groupShoutWhitelistEnabled && this.state.pills.groupShoutNotifier ? "" : " hidden")} onClick={this.toggleAddWhitelistedGroup.bind(this)}></a>
						<div class={"form-group form-has-feedback" + (this.state.groupError ? " form-has-error" : "") + (this.state.showAddGroup ? "" : " hidden")}>
							<input class="form-control input-field" placeholder="https://www.roblox.com/groups/2518656/ROBLOX-Fan-Group" id="rplus-groupshout-notifier-input" onKeyUp={this.tryAddGroup.bind(this)} />
							<span class="form-control-label">{this.state.groupError}</span>
						</div>
						<div class={this.state.pills.groupShoutWhitelistEnabled && this.state.pills.groupShoutNotifier ? "" : "hidden"}>
							{this.state.whitelistedGroups}
						</div>
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Trades</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Trade status notifications</span>
						<PillToggle getValue={this.getPillValue.bind(this, "tradeNotifier")}
							onToggle={this.setPillValue.bind(this, "tradeNotifier")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Notifications when you get a trade, send one, or a trade closes.</span>
						<a class="icon-Musical" onClick={this.promptChangeNotifierSound.bind(this, "tradeInbound")}></a>
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Extension</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Notifications when Roblox+ starts or updates</span>
						<PillToggle getValue={this.getPillValue.bind(this, "startupNotification.on")}
							onToggle={this.setPillValue.bind(this, "startupNotification.on")} />
						<div class={this.state.pills["startupNotification.on"] ? "" : "hidden"}>
							<div class="rbx-divider"></div>
							<span class="text-lead">Only notify me when I first visit the website</span>
							<PillToggle getValue={this.getPillValue.bind(this, "startupNotification.visit")}
								onToggle={this.setPillValue.bind(this, "startupNotification.visit")} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}