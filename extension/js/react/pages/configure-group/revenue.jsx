class GroupRevenue extends React.Component {
	constructor(props) {
		super(props);
	}

	loadSalesData(days) { 
		console.log("Load sales data", this.props.groupId);
		return RPlus.bucketedSales.getBucketedSellerSales("Group", this.props.groupId, days);
	}

	loadRevenueData(days) {
		console.log("Load revenue data", this.props.groupId);
		return RPlus.bucketedSales.getBucketedSellerRevenue("Group", this.props.groupId, days);
	}

	getItemScanStatus() {
		return Roblox.economyTransactions.getGroupScanStatus(this.props.groupId);
	}

	render() {
		return (
			<div>
				<BucketedSalesChart loadSalesData={this.loadSalesData.bind(this)} getScanStatus={this.getItemScanStatus.bind(this)} name="Sales" />
				<BucketedSalesChart loadSalesData={this.loadRevenueData.bind(this)} getScanStatus={this.getItemScanStatus.bind(this)} name="Revenue" />
			</div>
		);
	}
}

Roblox.users.getAuthenticatedUser().then(function(user) {
	var groupId = Roblox.groups.getIdFromUrl(location.href);
	if (isNaN(groupId) || groupId <= 0) {
		return;
	}

	RPlus.premium.isPremium(user.id).then(function(premium) {
		if (!premium) {
			// TODO: Missed oppurtunity to upsell.
			return;
		}

		setInterval(function() {
			var groupRevenueSummaryTab = $("group-revenue-summary");
			if (groupRevenueSummaryTab.length > 0){
				var rplusRevenueContainer = groupRevenueSummaryTab.find("#rplus-group-revenue");
				if (rplusRevenueContainer.length <= 0) {
					rplusRevenueContainer = $("<div id=\"rplus-group-revenue\">");
					groupRevenueSummaryTab.append(rplusRevenueContainer);
					
					console.log("Render GroupRevenue in #rplus-group-revenue");
					ReactDOM.render(<GroupRevenue groupId={groupId} />, rplusRevenueContainer[0]);
				}
			}
		}, 500);
	}).catch(console.error);
}).catch(console.error);

// WebGL3D
