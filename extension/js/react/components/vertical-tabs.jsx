class VerticalTabs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab: props.defaultTab || props.tabs[0]
		};
	}

	selectTab(tab) {
		this.setState({
			activeTab: tab
		});
	}

	render() {
		let verticalTabs = this;
		let activeTab = this.state.activeTab;
		let tabListItems = [];
		let tabContentDivs = [];
		
		this.props.tabs.forEach(function(tab) {
			let tabContent = React.createElement(tab.class, tab.props || {});

			tabListItems.push(
				<li className={"rbx-tab" + (tab === activeTab ? " active" : "")}>
					<a class="rbx-tab-heading"
						onClick={ verticalTabs.selectTab.bind(verticalTabs, tab) }>
						<span class="text-lead">{ tab.label }</span>
					</a>
				</li>
			);

			tabContentDivs.push(
				<div className={"tab-pane" + (activeTab === tab ? " active" : "")}>
					{ tabContent }
				</div>
			);
		});

		return (
			<div class="rbx-tabs-vertical">
				<ul class="nav nav-tabs nav-stacked rbx-tabs-vertical">
					{ tabListItems }
				</ul>
				<div class="tab-content rbx-tab-content">
					{ tabContentDivs }
				</div>
			</div>	
		);
	}
}