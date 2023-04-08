class UserInfoWidget extends React.Component {
	constructor(props) {
		super(props);

		this.processingId = 0;
		this.state = {
			loading: false,
			user: null,
			errorMessage: ""
		};
	}

	show(userId) {
		let processingId = ++this.processingId;
		if (this.state.user && this.state.user.id === userId) {
			return;
		}

		this.setState({
			loading: true,
			errorMessage: ""
		});

		Roblox.users.getByUserId(userId).then(user => {
			if (this.processingId !== processingId) {
				return;
			}

			this.setState({
				loading: false,
				user: user
			});
		}).catch(err => {
			console.error(err);

			this.setState({
				loading: false,
				errorMessage: "Failed to load user data."
			});
		});
	}

	hide() {
		this.processingId++;
		this.setState({
			loading: false,
			errorMessage: "",
			user: null
		});
	}

	render() {
		if (this.state.loading) {
			return (
				<div class="rplus-quick-info-widget-user">
					<span class="spinner spinner-default"></span>
				</div>
			);
		}

		if (this.state.errorMessage) {
			return (
				<div class="rplus-quick-info-widget-user">
					<div class="section-content-off">{this.state.errorMessage}</div>
				</div>
			);
		}

		if (!this.state.user) {
			return (
				<div></div>
			);
		}

		return (
			<div class="rplus-quick-info-widget-user">
				<UserInfoWidgetUserCard user={this.state.user}/>
				<UserInfoWidgetInventory user={this.state.user}/>
			</div>
		);
	}
}
