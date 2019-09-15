class AppearanceSettings extends SettingsTab {
	constructor(props) {
		super(props);

		let activeTheme = RPlus.style.getActivatedThemes()[0];
		this.state.theme = (activeTheme && activeTheme.type) || "";
	}

	changeTheme() {
		this.setState({
			theme: event.target.value
		});
		RPlus.style.setTheme(RPlus.style.themeTypes[event.target.value]);
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Twemojis</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Replace emojis on the website with twemojis.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "twemoji")}
							onToggle={this.setPillValue.bind(this, "twemoji")} />
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Theme</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Replaces the website theme with a custom one.</span>
						<div class="select-group rbx-select-group">
							<select class="input-field select-option rbx-select" defaultValue={this.state.theme} onChange={this.changeTheme.bind(this)}>
								<option value="">Default</option>
								<option value="obc">OBC</option>
								<option value="easter" disabled={!this.state.isPremium}>Easter</option>
								<option value="darkblox" disabled={!this.state.isPremium}>Darkblox [Experimental]</option>
							</select>
							<span class="icon-arrow icon-down-16x16"></span>
						</div>
						<div class="rbx-divider"></div>
						<span class="text-description">The Easter and Darkblox themes are only available to Roblox+ Premium subscribers.</span>
					</div>
				</div>
			</div>
		);
	}
}