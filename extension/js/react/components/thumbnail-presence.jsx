class ThumbnailPresence extends React.Component {
	constructor(props) {
		super(props);

		this.lastUserId = null;
		this.state = {
			locationType: 0,
			locationLink: "",
			locationText: ""
		};

		this.componentWillReceiveProps(props);
	}

	loadPresence(userId) {
		if (this.lastUserId === userId) {
			return;
		}

		this.lastUserId = userId;

		if (!userId || userId <= 0) {
			return;
		}

		this.setState({
			locationType: 0,
			locationLink: "",
			locationText: ""
		});

		Roblox.users.getPresence([userId]).then(presences => {
			let presence = presences[userId];
			if (!presence || this.props.userId !== userId) {
				return;
			}

			let locationLink = "";
			let locationText = presence.locationName;

			if (presence.game) {
				locationText = presence.game.name || locationText;

				if (presence.game.placeId) {
					locationLink = Roblox.games.getGameUrl(presence.game.placeId, locationText);
				}
			}

			this.setState({
				locationType: presence.locationType,
				locationText: locationText,
				locationLink: locationLink
			});
		}).catch(err => {
			console.error(err);
		});
	}

	getPresenceIcon(locationType) {
		switch (locationType) {
			case 2:
				return "icon-online";
			case 3:
				return "icon-studio";
			case 4:
				return "icon-game";
		}

		return "";
	}

	componentWillReceiveProps(nextProps) {
		this.loadPresence(nextProps.userId);
	}

	render() {
		let icon = this.getPresenceIcon(this.state.locationType);
		let presenceClassName = "avatar-status " + icon;

		if (!icon) {
			return (
				<span></span>
			);
		}

		if (this.state.locationLink) {
			return (
				<a className={presenceClassName}
					href={this.state.locationLink}
					title={this.state.locationText}>
				</a>
			);
		}

		return (
			<span className={presenceClassName} 
				  title={this.state.locationText}></span>
		);
	}
}
