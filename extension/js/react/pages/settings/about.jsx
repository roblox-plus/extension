class About extends React.Component {
	constructor(props) {
		super(props);

		let about = this;
		this.state = {
			isPremium: false,
			premiumExpiration: null,
			premium: (<span class="spinner spinner-default"></span>),

			updateLog: (<span class="spinner spinner-default"></span>)
		};

		RPlus.settings.get().then((settings) => about.globalSettingsLoaded(settings)).catch((e) => about.globalSettingsLoadFailure(e));
		Roblox.users.getAuthenticatedUser().then((user) => about.authenticatedUserLoaded(user)).catch((e) => about.authenticatedUserLoadFailure(e));
	}

	authenticatedUserLoaded(user) {
		let premiumLoaded = this.premiumLoaded.bind(this);
		let premiumLoadFailure = this.premiumLoadFailure.bind(this);

		if (user) {
			console.log("Load premium for", user);
			RPlus.premium.getPremium(user.id).then(premiumLoaded).catch(premiumLoadFailure);
		}
	}

	authenticatedUserLoadFailure(e) {
		console.error("authenticatedUserLoadFailure", e);

		this.premiumLoadFailure(e);
	}

	premiumLoaded(premium) {
		console.log(premium);
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

	globalSettingsLoaded(settings) {
		this.setState({
			updateLog: (
				<div class="section-content">
					<pre>{atob(settings.updateLogPost)}</pre>
				</div>
			)
		});
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