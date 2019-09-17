class About extends React.Component {
	constructor(props) {
		super(props);

		let about = this;
		this.state = {
			authenticatedUser: null,

			isPremium: false,
			premiumExpiration: null,
			premium: (<span class="spinner spinner-default"></span>),

			updateLog: (<span class="spinner spinner-default"></span>),
			updateLogDraft: "",
			updateLogPost: "",
			updateLogSaveStatus: "",

			featureList: [
				this.getFeatureRow("Game server pager", "On the game details page the load more servers button is turned into a pager with options to skip to the first or last page of servers."),
				this.getFeatureRow("Texture download", "A download option is added to Roblox created images."),
				this.getFeatureRow("Asset contents", "On item details pages a tab is added to view content the asset depends on."),
				this.getFeatureRow("Asset owners list", "A list of owners is added as a tab on item details pages depending on the asset type and creator."),
				this.getFeatureRow("Delete from inventory page", "Delete buttons are added to the inventory page for some asset types."),
				this.getFeatureRow("Avatar filter bar", "A text box is added to the avatar page to filter visible items down to items that match the text."),
				this.getFeatureRow("Roblox+ notification stream", "Clicking the extension browser icon while on a Roblox page will take over the notification stream with notifications from Roblox+."),
				this.getFeatureRow("Comment timer", "A timer is added to the asset comment button for how long until you can post another comment.", true),
				this.getFeatureRow("Trade and transaction counters", "Counters are added to the drop downs of the trades and transactions selections on the Money page.", true),
				this.getFeatureRow("Cancel all outbound trades button", "A button is added to the outbound trades tab on the Money page to cancel all outbound trades.", true),
				this.getFeatureRow("Unfollow all users button on Friends page", "A button is added to your friends page to unfollow all users you are not friends with.", true),
				this.getFeatureRow("Follow all friends button on Friends page", "A button is added to your friends page to follow all users you are friends with.", true),
				this.getFeatureRow("Profile sale statistics", "Buttons are added to the profile page to calculate sales of clothing with user stats.", true),
				this.getFeatureRow("JSON pretty printing", "This feature is really on its way out soon. You may never read this text because I'm planning to delete this feature. On a JSON API response when viewing it in a browser tab if you press enter it will format the JSON. It really only ended up here to make my debugging easier but it's been separated out of this extension.", true),
				this.getFeatureRow("Badge counter", "On the profile page you can calculate how many game badges a user has earned overall.", true),
			]
		};

		RPlus.settings.get().then((settings) => about.globalSettingsLoaded(settings)).catch((e) => about.globalSettingsLoadFailure(e));
		Roblox.users.getAuthenticatedUser().then((user) => about.authenticatedUserLoaded(user)).catch((e) => about.authenticatedUserLoadFailure(e));
	}

	getFeatureRow(name, description, deprecated) {
		return (
			<tr>
				<td><span class={"icon-warning" + (deprecated ? "" : " hidden")}></span></td>
				<td class="text-lead">{name}</td>
				<td class="text-description">{description}</td>
			</tr>
		);
	}

	authenticatedUserLoaded(authenticatedUser) {
		let premiumLoaded = this.premiumLoaded.bind(this);
		let premiumLoadFailure = this.premiumLoadFailure.bind(this);

		if (authenticatedUser) {
			RPlus.premium.getPremium(authenticatedUser.id).then(premiumLoaded).catch(premiumLoadFailure);
		}

		this.setState({
			authenticatedUser: authenticatedUser
		});
	}

	authenticatedUserLoadFailure(e) {
		console.error("authenticatedUserLoadFailure", e);

		this.premiumLoadFailure(e);
	}

	premiumLoaded(premium) {
		let hubLink = (
			<a class="text-link"
				target="_blank"
				href={Roblox.games.getGameUrl(258257446, "Roblox+ Hub")}>Roblox+ Hub</a>
		);

		let newState = {};

		if (premium) {
			newState.isPremium = true;

			if (premium.expiration) {
				newState.premiumExpiration = new Date(premium.expiration);
				newState.premium = (
					<div class="section-content">
						You have Roblox+ Premium, thanks for the support!
						<br />
						Your premium membership expires on: {newState.premiumExpiration.toLocaleDateString()}
						<br />
						To keep premium going after this date make sure you have automatic renewal for the VIP server turned on at the {hubLink}.
					</div>
				);
			} else {
				newState.premium = (
					<div class="section-content">
						You have a lifetime Roblox+ Premium membership! Nice!
						<br />
						You are either a friend of WebGL3D, or bought it when it was still a t-shirt.
						<br />
						Either way, thanks for sticking around!
					</div>
				);
			}
		} else {
			newState.premium = (
				<div class="section-content">
					To get Roblox+ Premium buy a VIP server from this place: {hubLink}
				</div>
			);
		}

		this.setState(newState);
	}

	premiumLoadFailure(e) {
		console.error("premiumLoadFailure", e);

		this.setState({
			premium: (<div class="section-content-off">Failed to load premium status.</div>)
		});
	}

	setUpdateLogDraft(event) {
		this.setState({
			updateLogDraft: event.target.value
		});
	}

	viewUpdateLog(settings, event) {
		let about = this;

		if (event.target.tagName !== "TEXTAREA") {
			this.globalSettingsLoaded(settings);

			if (this.state.updateLogDraft !== this.state.updateLogPost) {
				let post = btoa(this.state.updateLogDraft);
				RPlus.settings.set({
					updateLogPost: post
				}).then(function () {
					about.setState({
						updateLogPost: atob(post),
						updateLogSaveStatus: "Saved: " + (new Date().toLocaleString())
					});
				}).catch(function (e) {
					console.error(e);

					about.setState({
						updateLogSaveStatus: "Failed to save update log."
					});
				});
			}
		}
	}

	editUpdateLog(settings) {
		if (!this.state.authenticatedUser || this.state.authenticatedUser.id !== 48103520) {
			return;
		}

		this.setState({
			updateLog: (
				<div class="section-content rplus-update-log-section form-group form-has-feedback"
					onDoubleClick={this.viewUpdateLog.bind(this, settings)}>
					<textarea onChange={this.setUpdateLogDraft.bind(this)}
						defaultValue={this.state.updateLogDraft}></textarea>
					<p class="form-control-label">{this.state.updateLogSaveStatus}</p>
				</div>
			)
		});
	}

	globalSettingsLoaded(settings) {
		let decodedPost = atob(settings.updateLogPost);
		let newState = {
			updateLog: (
				<div class="section-content form-has-feedback"
					onDoubleClick={this.editUpdateLog.bind(this, settings)}>
					<pre>{this.state.updateLogPost || decodedPost}</pre>
					<p class="form-control-label">Version {ext.manifest.version}</p>
					<p class="form-control-label">Group: <a class="text-link" href={Roblox.groups.getGroupUrl(2518656, "Roblox+ Fan Group")}>Roblox+ Fan Group</a></p>
				</div>
			)
		};

		if (!this.state.updateLogDraft) {
			newState.updateLogDraft = decodedPost;
		}

		if (!this.state.updateLogPost) {
			newState.updateLogPost = decodedPost;
		}

		this.setState(newState);
	}

	globalSettingsLoadFailure(e) {
		console.error("globalSettingsLoadFailure", e);

		this.setState({
			updateLog: (<div class="section-content-off">Update log failed to load.</div>)
		});
	}

	reloadExtension() {
		ext.reload(function () {
			setTimeout(function () {
				window.location.reload(true);
			}, 1000);
		});
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Roblox+ Premium</h3>
					</div>
					{this.state.premium}
				</div>
				<div class="section rplus-premium-section">
					<div class="container-header">
						<h3>Update Log</h3>
					</div>
					{this.state.updateLog}
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Disaster Recovery</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Click button to "turn off and back on again".</span>
						<button class="btn-control-sm acct-settings-btn"
							type="button"
							onClick={this.reloadExtension}>Reload</button>
					</div>
				</div>
				<div class="section rplus-feature-list">
					<div class="container-header">
						<h3>Feature List</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Features listed are not configurable but are specified for transparency sake about what this extension is responsible for.</span>
						<table class="table table-striped">
							<tbody>
								{this.state.featureList}
							</tbody>
						</table>
						<div class="rbx-divider"></div>
						<p class="text-date-hint"><span class="icon-warning"></span> <span>Deprecated - These features are no longer supported. If they stop working they may not be fixed.</span></p>
					</div>
				</div>
			</div>
		);
	}
}