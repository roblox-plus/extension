class ItemDetailsTabs extends React.Component {
	constructor(props) {
		super(props);

		let tabs = [];
		let resellersContent = $("asset-resale-pane");
		let recommendationsContent = $("recommendations");

		if (resellersContent.length > 0) {
			tabs.push(ItemDetailsTabs.tabTypes.resellers);
		} else if (recommendationsContent.length > 0) {
			tabs.push(ItemDetailsTabs.tabTypes.recommendations);
		}

		tabs = tabs.concat(props.tabTypes);

		this.state = {
			assetId: props.assetId,
			selectedTab: tabs[0],
			tabs: tabs,
			resellersContent: resellersContent,
			recommendationsContent: recommendationsContent
		};

		this.childRefs = {
			owners: React.createRef()
		};

		this.initRefs = {};
	}

	selectTab(tabType) {
		if (tabType === ItemDetailsTabs.tabTypes.resellers) {
			this.state.resellersContent.show();
		} else {
			this.state.resellersContent.hide();
		}

		if (tabType === ItemDetailsTabs.tabTypes.recommendations) {
			this.state.recommendationsContent.show();
		} else {
			this.state.recommendationsContent.hide();
		}

		if (!this.initRefs[tabType] && this.childRefs[tabType]) {
			this.initRefs[tabType] = true;
			this.childRefs[tabType].current.init();
		}

		this.setState({
			selectedTab: tabType
		});
	}

	getTabTitle(tabType) {
		switch (tabType) {
			case ItemDetailsTabs.tabTypes.owners:
				return "Owners";
			case ItemDetailsTabs.tabTypes.recommendations:
				return "Recommendations";
			case ItemDetailsTabs.tabTypes.resellers:
				return "Resellers";
			default:
				return tabType;
		}
	}

	getTabPaneClassName(tabType) {
		let className = "tab-pane";
		if (tabType === this.state.selectedTab) {
			className += " active";
		}

		return className;
	}

	getTabs() {
		return this.state.tabs.map(tabType => {
			let className = "rbx-tab";
			if (tabType === this.state.selectedTab) {
				className += " active";
			}

			return (
				<li class={className}>
					<a class="rbx-tab-heading" onClick={this.selectTab.bind(this, tabType)}>
						<span class="text-lead">{this.getTabTitle(tabType)}</span>
					</a>
				</li>
			);
		});
	}

	getTabsHeader() {
		if (this.state.tabs.length === 1) {
			return (
				<div class="container-header">
					<h3>{this.getTabTitle(this.state.tabs[0])}</h3>
				</div>
			);
		}

		return (
			<div class="rbx-tabs-horizontal">
				<ul class="nav nav-tabs" rplus-tab-count={this.state.tabs.length}>
					{this.getTabs()}
				</ul>
			</div>
		);
	}

	getTabContent() {
		return this.props.tabTypes.map(tabType => {
			switch (tabType) {
				case ItemDetailsTabs.tabTypes.owners:
					return (
						<div class={this.getTabPaneClassName(tabType)}>
							<ItemOwners ref={this.childRefs.owners} assetId={this.state.assetId}/>
						</div>
					);
				default:
					return (
						<div class="tab-pane"></div>
					);
			}
		});
	}

	render() {
		if (this.state.tabs.length <= 0) {
			return (
				<div class="rplus-item-details-tabs"></div>
			);
		}

		return (
			<div class="rplus-item-details-tabs">
				{this.getTabsHeader()}
				<div class="tab-content">
					{this.getTabContent()}
				</div>
			</div>
		);
	}
}

ItemDetailsTabs.tabTypes = {
	owners: "owners",
	recommendations: "recommendations",
	resellers: "resellers"
};
