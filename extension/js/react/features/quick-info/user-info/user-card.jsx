class UserInfoWidgetUserCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: props.user,
			premiumIcon: (<span></span>),
			canFollowInGame: false,
			inventoryData: null
		};

		this.componentWillReceiveProps(props);
	}

	loadPremiumIcon(userId) {
		this.setState({
			premiumIcon: (<span></span>)
		});

		RPlus.premium.getPremium(userId).then((premium) => {
			if (this.props.user.id === userId && premium) {
				let expiration = "Lifetime";
				if (premium.expiration) {
					let expirationDate = new Date(premium.expiration);
					expiration = expirationDate.toLocaleDateString();
				}

				this.setState({
					premiumIcon: (<span class="rplus-icon-32x32" title={"Expiration: " + expiration}></span>)
				});
			}
		}).catch(err => {
			console.error(err);
		});
	}

	loadPresence(userId) {
		this.setState({
			canFollowInGame: false
		});

		Roblox.users.getPresence([userId]).then(presences => {
			let presence = presences[userId];
			if (presence 
				&& presence.game 
				&& presence.locationType === 4 
				&& userId !== Roblox.users.authenticatedUserId
				&& this.props.user.id === userId) {
				this.setState({
					canFollowInGame: true
				});
			}
		}).catch(err => {
			console.error(err);
		});
	}

	loadInventoryData(userId) {
		this.setState({
			inventoryData: null
		});

		Roblox.inventory.getCollectibles(userId).then((collectibles) => {
			if (this.props.user.id !== userId) {
				return;
			}

			console.log(collectibles);

			this.setState({
				inventoryData: collectibles
			});
		}).catch(err => {
			if (this.props.user.id !== userId) {
				return;
			}

			let privateInventory = Array.isArray(err) && err[0] && err[0].code === 11;
			if (!privateInventory) {
				console.error(err);
			}
		});
	}

	joinGame() {
		Roblox.games.launch({
			followUserId: this.state.user.id
		}).then(() => {
			// followed the user
		}).catch(err => {
			console.error(err);
		});
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			user: nextProps.user
		});

		this.loadPremiumIcon(nextProps.user.id);
		this.loadPresence(nextProps.user.id);
		this.loadInventoryData(nextProps.user.id);
	}

	renderLabels() {
		if (!this.state.inventoryData) {
			return (
				<div>
				</div>
			);
		}

		return (
			<div>
				<div class="avatar-card-label">Collectibles: {this.state.inventoryData.collectibles.length}</div>
				<div class="avatar-card-label">RAP: {global.addCommas(this.state.inventoryData.combinedValue)}</div>
			</div>
		);
	}

	renderButtons() {
		if (!this.state.canFollowInGame) {
			return (
				<div>
				</div>
			);
		}

		return (
			<div class="avatar-card-btns">
				<button class="btn-primary-md" onClick={this.joinGame.bind(this)}>Join Game</button>
			</div>
		);
	}

	render() {
		return (
			<div class="avatar-card-container">
				<div class="avatar-card-content">
					<div class="avatar-card-fullbody">
						<a class="avatar-card-link"
							href={Roblox.users.getProfileUrl(this.state.user.id)}>
							<div class="avatar-card-image">
								<Thumbnail thumbnailType={Roblox.thumbnails.types.userHeadshot} thumbnailTargetId={this.state.user.id}/>
							</div>
							<ThumbnailPresence userId={this.state.user.id}/>
						</a>
					</div>
					<div class="avatar-card-caption">
						<div class="text-overflow avatar-name">{this.state.user.username}</div>
						{this.state.premiumIcon}
						{this.renderLabels()}
					</div>
				</div>
				{this.renderButtons()}
			</div>
		);
	}
}
