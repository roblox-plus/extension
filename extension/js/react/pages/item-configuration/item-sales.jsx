class ItemSales extends React.Component {
	constructor(props) {
		super(props);
	}

	loadSalesData(days) { 
		return RPlus.bucketedSales.getBucketedItemSales("Asset", this.props.assetId, days);
	}

	loadRevenueData(days) {
		return RPlus.bucketedSales.getBucketedItemRevenue("Asset", this.props.assetId, days);
	}

	render() {
		return (
			<div>
				<BucketedSalesChart loadSalesData={this.loadSalesData.bind(this)} name="Sales" />
				<BucketedSalesChart loadSalesData={this.loadRevenueData.bind(this)} name="Revenue" />
			</div>
		);
	}
}

Roblox.users.getAuthenticatedUser().then(function(user) {
	RPlus.premium.isPremium(user.id).then(function(premium) {
		if (!premium) {
			// TODO: Missed oppurtunity to upsell.
			return;
		}
		
		setInterval(function() {
			var assetId = Number($("item-configuration").attr("item-id"));
			if (isNaN(assetId) || assetId <= 0) {
				return;
			}
		
			var itemSalesTab = $("item-sales");
			if (itemSalesTab.length > 0){
				var itemSalesContainer = itemSalesTab.find("#rplus-item-sales");
				if (itemSalesContainer.length <= 0) {
					itemSalesContainer = $("<div id=\"rplus-item-sales\">");
					itemSalesTab.append(itemSalesContainer);
					
					console.log("Render ItemSales in #rplus-item-sales");
					ReactDOM.render(<ItemSales assetId={assetId} />, itemSalesContainer[0]);
				}
			}
		}, 500);
	}).catch(console.error);
}).catch(console.error);

// WebGL3D
