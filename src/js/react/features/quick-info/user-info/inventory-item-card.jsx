class UserInfoWidgetInventoryItemCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			collectible: props.collectible
		};
	}

	getSerialNumberTooltip() {
		let serialNumbers = this.state.collectible.serialNumbers;
		if (serialNumbers.length === 1 && serialNumbers[0]) {
			return `#${serialNumbers[0]}/${this.state.collectible.assetStock}`;
		}

		return "";
	}

	renderNumberContainer() {
		let serialNumbers = this.state.collectible.serialNumbers;
		if (serialNumbers.length > 1) {
			return (
				<span class="limited-number-container">
					<span class="font-caption-header">x</span>
					<span class="font-caption-header text-subheader limited-number">{global.addCommas(serialNumbers.length)}</span>
				</span>
			);
		}

		if (serialNumbers[0]) {
			return (
				<span class="limited-number-container">
					<span class="font-caption-header">#</span>
					<span class="font-caption-header text-subheader limited-number">{serialNumbers[0]}</span>
				</span>
			);
		}

		return (
			<span></span>
		);
	}

	render() {
		return (
			<li class="item-card list-item">
				<div class="item-card-container">
					<a class="item-card-link" href={Roblox.catalog.getAssetUrl(this.state.collectible.assetId, this.state.collectible.assetName)}>
						<div class="item-card-thumb-container">
							<Thumbnail thumbnailType={Roblox.thumbnails.types.asset} thumbnailTargetId={this.state.collectible.assetId}/>
							<span class="limited-icon-container" title={this.getSerialNumberTooltip()}>
								<span class="icon-shop-limited"></span>
								{this.renderNumberContainer()}
							</span>
						</div>
						<div class="item-card-name" title={this.state.collectible.assetName}>{this.state.collectible.assetName}</div>
					</a>
					<div class="item-card-caption">
						<div class="text-overflow item-card-price">
							<span class="icon icon-robux-16x16"></span>
							<span class="text-robux ng-binding">{(this.state.collectible.recentAveragePrice !== Infinity ? global.addCommas(this.state.collectible.recentAveragePrice) : "Priceless")}</span>
						</div>
					</div>
				</div>
			</li>
		);
	}
}
