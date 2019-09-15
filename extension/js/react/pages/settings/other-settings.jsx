class OtherSettings extends SettingsTab {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Profile Page</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Display users RAP in header.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "profileRAP")}
							onToggle={this.setPillValue.bind(this, "profileRAP")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Calculates total user value in items and displays it as profile header stat.</span>
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Groups Page</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Display member role on group wall posts</span>
						<PillToggle getValue={this.getPillValue.bind(this, "groupRoleDisplay")}
							onToggle={this.setPillValue.bind(this, "groupRoleDisplay")} />
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Create Page</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Quick on/off sale buttons on the <a href="/develop">Create</a> page.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "quickSell")}
							onToggle={this.setPillValue.bind(this, "quickSell")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Note: When putting on sale it will put for sale at the lowest price possible.</span>
					</div>
				</div>
			</div>
		);
	}
}