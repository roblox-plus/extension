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
				<li className={"menu-option" + (tab === activeTab ? " active" : "")}
					onClick={ verticalTabs.selectTab.bind(verticalTabs, tab) }>
					<a class="rbx-tab-heading menu-option-content">
						<span class="font-caption-header">{ tab.label }</span>
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
			<div class="menu-vertical-container">
				<ul class="menu-vertical">
					{ tabListItems }
				</ul>
				<div class="tab-content rbx-tab-content">
					{ tabContentDivs }
				</div>
			</div>	
		);
	}
}