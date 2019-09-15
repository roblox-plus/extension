class NavigationSettings extends SettingsTab {
	constructor(props) {
		super(props);

		this.state.counterRoundAt = 1000;

		let navigationSettings = this;
		storage.get("navigation", function (navigation) {
			navigationSettings.setState({
				counterRoundAt: navigation ? navigation.counterCommas : 10000
			});
		});
	}

	updateCounterRoundAt(event) {
		let roundAt = event.target.value;
		this.setState({
			counterRoundAt: roundAt
		});

		storage.get("navigation", function (navigation) {
			navigation = navigation || {};
			navigation.counterCommas = roundAt;
			storage.set("navigation", navigation);
		});
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Navigation bar</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Live navigation counters.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "navcounter")}
							onToggle={this.setPillValue.bind(this, "navcounter")} />
						<div class="rbx-divider"></div>
						<span class="text-lead">Side navigation bar always open.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "navigation.sideOpen")}
							onToggle={this.setPillValue.bind(this, "navigation.sideOpen")} />
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Navigation counters</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Counter rounding.</span>
						<div class="select-group rbx-select-group">
							<select class="input-field select-option rbx-select" defaultValue={this.state.counterRoundAt} onChange={this.updateCounterRoundAt.bind(this)}>
								<option value="1000">1,000</option>
								<option value="10000">10,000</option>
								<option value="100000">100,000</option>
								<option value="1000000">1,000,000</option>
								<option value="10000000">10,000,000</option>
								<option value="100000000">100,000,000</option>
							</select>
							<span class="icon-arrow icon-down-16x16"></span>
						</div>
						<div class="rbx-divider"></div>
						<span class="text-description">This is where Robux, private messages, friend requests, and trade request counts will stop displaying the full number.</span>
					</div>
				</div>
				<div class="section rplus-navigation-link-overrides">
					<div class="container-header">
						<h3>Navigation link overrides</h3>
					</div>
					<div class="section-content">
						<div>
							<span class="text-lead">Link 1</span>
							<input class="form-control input-field" placeholder="/develop" />
							<span class="form-control-label"></span>
						</div>
						<div class="rbx-divider"></div>
						<div>
							<span class="text-lead">Link 1 text</span>
							<input class="form-control input-field" placeholder="Create" />
							<span class="form-control-label"></span>
						</div>
					</div>
					<div class="section-content">
						<div class="form-group form-has-feedback">
							<span class="text-lead">Link 2</span>
							<input class="form-control input-field" placeholder="/upgrades/robux?ctx=nav" />
							<span class="form-control-label"></span>
						</div>
						<div class="rbx-divider"></div>
						<div class="form-group form-has-feedback">
							<span class="text-lead">Link 2 text</span>
							<input class="form-control input-field" placeholder="Robux" />
							<span class="form-control-label"></span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}