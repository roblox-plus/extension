class OtherSettings extends SettingsTab {
	constructor(props) {
		super(props);
	}

	render() {
		// TODO: Remove groups page feature (doesn't work)
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Profile Page</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Display users RAP in header.</span>
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
						<span class="text-lead">Display member role on group wall posts.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "groupRoleDisplay")}
							onToggle={this.setPillValue.bind(this, "groupRoleDisplay")} />
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Trades</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Outbound asset checker.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "tradeChecker")}
							onToggle={this.setPillValue.bind(this, "tradeChecker")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Items currently in an outbound trade will be highlighted in the trade window.</span>
					</div>
					<div class="section-content">
						<span class="text-lead">Open trades in new tab (instead of new window).</span>
						<PillToggle getValue={this.getPillValue.bind(this, "tradeTab")}
							onToggle={this.setPillValue.bind(this, "tradeTab")} />
					</div>
					<div class="section-content">
						<span class="text-lead">Trade evaluator.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "tradePageRapAssist")}
							onToggle={this.setPillValue.bind(this, "tradePageRapAssist")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Loads trades on the trades page and evaluates who has higher value.</span>
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Item Details Page</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Live number remaining counter for limiteds.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "remainingCounter")}
							onToggle={this.setPillValue.bind(this, "remainingCounter")} />
					</div>
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Create Page</h3>
					</div>
					<div class="section-content">
						<span class="text-lead">Quick on/off sale buttons on the <a href="/develop">Create</a> page.</span>
						<PillToggle getValue={this.getPillValue.bind(this, "quickSell")}
							onToggle={this.setPillValue.bind(this, "quickSell")} />
						<div class="rbx-divider"></div>
						<span class="text-description">Note: When putting on sale it will put for sale at the lowest price possible.</span>
					</div>
				</div>
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
			</div>
		);
	}
}