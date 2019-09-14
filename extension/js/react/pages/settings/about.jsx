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
			updateLogSaveStatus: ""
		};

		RPlus.settings.get().then((settings) => about.globalSettingsLoaded(settings)).catch((e) => about.globalSettingsLoadFailure(e));
		Roblox.users.getAuthenticatedUser().then((user) => about.authenticatedUserLoaded(user)).catch((e) => about.authenticatedUserLoadFailure(e));
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
				}).then(function() {
					about.setState({
						updateLogPost: atob(post),
						updateLogSaveStatus: "Saved: " + (new Date ().toLocaleString())
					});
				}).catch(function(e) {
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
				<div class="section-content"
						onDoubleClick={this.editUpdateLog.bind(this, settings)}>
					<pre>{this.state.updateLogPost || decodedPost}</pre>
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
			</div>
		);
	}
}