class NavigationSettings extends SettingsTab {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Navigation bar</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Live navigation counters.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "navcounter")}
							onToggle={this.setPillValue.bind(this, "navcounter")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Side navigation bar always open.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "navigation.sideOpen")}
							onToggle={this.setPillValue.bind(this, "navigation.sideOpen")} />
					</div>
				</div>
			</div>
		);
	}
}