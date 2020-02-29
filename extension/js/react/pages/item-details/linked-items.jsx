class LinkedItems extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: 2,
			assetId: props.assetId,
			dependentAssets: [],
			assetBundles: [],
			dependentAssetsError: false,
			assetBundlesError: false
		};
	}

	init() {
		let loading = 2;

		Roblox.content.getDependentAssets(this.state.assetId).then((assets) => {
			this.setState({
				dependentAssets: assets,
				loading: --loading
			});
		}).catch(err => {
			console.error(err);
	
			this.setState({
				dependentAssetsError: true,
				loading: --loading
			});
		});
		
		Roblox.catalog.getAssetBundles(this.state.assetId).then((bundles) => {
			this.setState({
				assetBundles: bundles,
				loading: --loading
			});
		}).catch(err => {
			console.error(err);
	
			this.setState({
				assetBundlesError: true,
				loading: --loading
			});
		});
	}

	renderDependentAssets() {
		if (this.state.dependentAssets.length < 1) {
			return "";
		}

		return (
			<div>
				<div class="container-header">
					<h3>Dependencies</h3>
				</div>
				<ul class="hlist item-cards">
					{this.state.dependentAssets.map(asset => {
						return (
							<li class="item-card list-item">
								<div class="item-card-container">
									<a class="item-card-link" href={Roblox.catalog.getAssetUrl(asset.id, asset.name)}>
										<div class="item-card-thumb-container">
											<Thumbnail thumbnailType={Roblox.thumbnails.types.asset} thumbnailTargetId={asset.id}/>
										</div>
										<div class="item-card-name" title={asset.name}>{asset.name}</div>
									</a>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	renderAssetBundles() {
		if (this.state.assetBundles.length < 1) {
			return "";
		}

		return (
			<div>
				<div class="container-header">
					<h3>Bundles</h3>
				</div>
				<ul class="hlist item-cards">
					{this.state.assetBundles.map(bundle => {
						return (
							<li class="item-card list-item">
								<div class="item-card-container">
									<a class="item-card-link" href={Roblox.catalog.getBundleUrl(bundle.id, bundle.name)}>
										<div class="item-card-thumb-container">
											<Thumbnail thumbnailType={Roblox.thumbnails.types.bundle} thumbnailTargetId={bundle.id}/>
										</div>
										<div class="item-card-name" title={bundle.name}>{bundle.name}</div>
									</a>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	render() {
		if (this.state.loading > 0) {
			return (
				<div class="section-content-off">Loading...</div>
			);
		}

		if (this.state.dependentAssets.length < 1 && this.state.assetBundles.length < 1) {
			return (
				<div class="section-content-off">This item has no linked content.</div>
			);
		}

		return (
			<div class="rplus-linked-items">
				{this.renderDependentAssets()}
				{this.renderAssetBundles()}
			</div>
		);
	}
}
