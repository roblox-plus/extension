class NavigationSettings extends SettingsTab {
	constructor(props) {
		super(props);

		this.state.counterRoundAt = 1000;
		this.state.navigationLinks = [
			{ text: "Create", href: "/develop", textError: "", hrefError: "" },
			{ text: "Trade", href: "/my/money.aspx#/#TradeItems_tab", textError: "", hrefError: "" }
		];

		let navigationSettings = this;
		storage.get("navigation", function (navigation) {
			navigationSettings.setState({
				counterRoundAt: navigation ? navigation.counterCommas : 10000,
				navigationLinks: (navigation && navigation.buttons) || navigationSettings.state.navigationLinks
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

	updateNavigationLink(index, property, event) {
		let update = false;
		let navigationSettings = this;
		let value = event.target.value;
		let newState = {
			navigationLinks: this.state.navigationLinks.slice()
		};

		newState.navigationLinks[index][property] = value;

		if (property === "href") {
			if (value.startsWith("/") || value.startsWith("https://")) {
				newState.navigationLinks[index].hrefError = "";
				update = true;
			} else {
				newState.navigationLinks[index].hrefError = "Invalid URL - must start with '/' or 'https://'";
			}
		} else {
			if (/^\s*$/.test(value)) {
				newState.navigationLinks[index].textError = "Cannot be empty.";
			} else {
				newState.navigationLinks[index].textError = "";
				update = true;
			}
		}

		navigationSettings.setState(newState);

		if (!update) {
			return;
		}

		storage.get("navigation", function (navigation) {
			navigation = navigation || {};
			navigation.buttons = navigation.buttons || [{ "text": "Create", "href": "/develop" }, { "text": "Trade", "href": "/my/money.aspx#/#TradeItems_tab" }];

			navigation.buttons.forEach(function (button, i) {
				if (!newState.navigationLinks[i].hrefError) {
					button.href = newState.navigationLinks[i].href;
				}

				if (!newState.navigationLinks[i].textError) {
					button.text = newState.navigationLinks[i].text;
				}
			});

			storage.set("navigation", navigation);
		});
	}

	blur(event) {
		if (event.keyCode === 13) {
			$(event.target).blur();
		}
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
							<select class="input-field select-option rbx-select"
								value={this.state.counterRoundAt}
								onChange={this.updateCounterRoundAt.bind(this)}>
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
						<div class={"form-group form-has-feedback" + (this.state.navigationLinks[0].hrefError ? " form-has-error" : "")}>
							<span class="text-lead">Link 1</span>
							<input class="form-control input-field"
								placeholder="/develop"
								value={this.state.navigationLinks[0].href}
								onChange={this.updateNavigationLink.bind(this, 0, "href")}
								onKeyUp={this.blur} />
							<span class="form-control-label">{this.state.navigationLinks[0].hrefError}</span>
						</div>
						<div class="rbx-divider"></div>
						<div class={"form-group form-has-feedback" + (this.state.navigationLinks[0].textError ? " form-has-error" : "")}>
							<span class="text-lead">Link 1 text</span>
							<input class="form-control input-field"
								placeholder="Create"
								value={this.state.navigationLinks[0].text}
								onChange={this.updateNavigationLink.bind(this, 0, "text")}
								onKeyUp={this.blur} />
							<span class="form-control-label">{this.state.navigationLinks[0].textError}</span>
						</div>
					</div>
					<div class="section-content">
						<div class={"form-group form-has-feedback" + (this.state.navigationLinks[1].hrefError ? " form-has-error" : "")}>
							<span class="text-lead">Link 2</span>
							<input class="form-control input-field"
								placeholder="/upgrades/robux?ctx=nav"
								value={this.state.navigationLinks[1].href}
								onChange={this.updateNavigationLink.bind(this, 1, "href")}
								onKeyUp={this.blur} />
							<span class="form-control-label">{this.state.navigationLinks[1].hrefError}</span>
						</div>
						<div class="rbx-divider"></div>
						<div class={"form-group form-has-feedback" + (this.state.navigationLinks[1].textError ? " form-has-error" : "")}>
							<span class="text-lead">Link 2 text</span>
							<input class="form-control input-field"
								placeholder="Robux"
								value={this.state.navigationLinks[1].text}
								onChange={this.updateNavigationLink.bind(this, 1, "text")}
								onKeyUp={this.blur} />
							<span class="form-control-label">{this.state.navigationLinks[1].textError}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}