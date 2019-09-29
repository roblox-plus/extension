class FeaturedCatalogItems extends React.Component {
	constructor(props) {
		super(props);

		this.filterQueryParameterNames = [
			"creatorname",
			"sorttype",
			"sortaggregation",
			"includenotforsale",
			"currencytype",
			"pxmin",
			"pxmax",
			"genres"
		];

		this.backgroundState = {
			loadId: 0,
			query: null,
			pageNumber: null
		};

		this.state = {
			sponsoredItems: []
		};

		let featuredCatalogItems = this;
		setInterval(function() {
			featuredCatalogItems.checkPageQuery();
		}, 100);
	}

	getPageNumber() {
		return Number(($(".pager span[ng-bind*='CurrentPage']").text().match(/(\d+)$/) || ["", ""])[1]);
	}

	checkPageQuery() {
		let pageNumber = this.getPageNumber();
		if (location.search !== this.backgroundState.query || pageNumber !== this.backgroundState.pageNumber) {
			this.backgroundState.query = location.search;
			this.backgroundState.pageNumber = pageNumber;
			this.loadSponsoredItems();
		}
	}

	loadSponsoredItems() {
		let id = ++this.backgroundState.loadId;
		let featuredCatalogItems = this;

		this.getSponsoredItems().then(function (sponsoredItems) {
			if (id !== featuredCatalogItems.backgroundState.loadId) {
				return;
			}

			if (sponsoredItems.length === 0) {
				featuredCatalogItems.setState({
					sponsoredItems: []
				});
				return;
			}

			let loadedItems = [];
			let finishedLoading = 0;

			let tryResolve = function () {
				if (id !== featuredCatalogItems.backgroundState.loadId) {
					return;
				}

				if (++finishedLoading === sponsoredItems.length) {
					featuredCatalogItems.setState({
						sponsoredItems: loadedItems
					});
				}
			};

			sponsoredItems.forEach(function (item) {
				featuredCatalogItems.translateItem(item).then(function (loadedItem) {
					loadedItems.push(loadedItem);
					tryResolve();
				}).catch(function (e) {
					console.error(e);
					tryResolve();
				});
			});
		}).catch(console.error);
	}

	shouldShowSponsoredItems() {
		let query = location.search.toLowerCase();
		for (var n = 0; n < this.filterQueryParameterNames.length; n++) {
			if (query.includes(this.filterQueryParameterNames[n] + "=")) {
				return false;
			}
		}

		let pageNumber = this.getPageNumber();
		if (isNaN(pageNumber) || pageNumber === 0 || pageNumber === 1) {
			return true;
		}

		return false;
	}

	getSponsoredItems() {
		let featuredCatalogItems = this;

		return new Promise(function (resolve, reject) {
			if (!featuredCatalogItems.shouldShowSponsoredItems()) {
				resolve([]);
				return;
			}

			let category = Number((location.search.match(/category=(\d+)/i) || ["", ""])[1]);
			let subcategory = Number((location.search.match(/subcategory=(\d+)/i) || ["", ""])[1]);
			RPlus.sponsoredItems.getSponsoredItems(category, subcategory).then(function(items) {
				console.log("Sponsored items for category", category, subcategory, items);
				resolve(items.sort(() => Math.random() - 0.5));
			}).catch(reject);
		});
	}

	translateItem(item) {
		return new Promise(function (resolve, reject) {
			switch (item.type) {
				case "Asset":
					Roblox.catalog.getAssetInfo(item.id).then(function (asset) {
						var creatorUrl = Roblox.users.getProfileUrl(asset.creator.id);
						if (asset.creator.type === "Group") {
							creatorUrl = Roblox.groups.getGroupUrl(asset.creator.id, asset.creator.name);
						}

						resolve({
							id: asset.id,
							name: asset.name,
							url: Roblox.catalog.getAssetUrl(asset.id, asset.name),

							price: asset.isForSale ? asset.robuxPrice : null,
							isFree: asset.isFree,

							creator: {
								name: asset.creator.name,
								url: creatorUrl
							},

							thumbnailUrl: Roblox.thumbnails.getAssetThumbnailUrl(asset.id, 4)
						});
					}).catch(reject);

					break;
				default:
					reject("Unsupport item type: " + item.type);
			}
		});
	}

	getItemCards() {
		return this.state.sponsoredItems.map(function (item) {
			return (
				<li class="list-item item-card">
					<a class="item-card-container"
						target="_self"
						href={item.url}>
						<div class="item-card-link">
							<div class="item-card-thumb-container">
								<img class="item-card-thumb"
									src={item.thumbnailUrl} />
							</div>
						</div>
						<div class="item-card-caption">
							<div class="item-card-name-link">
								<div class="item-card-name"
									title={item.name}>
									{item.name}
								</div>
							</div>
							<div class="item-card-secondary-info text-secondary">
								<div class="item-card-label">
									<span>
										By <a href={item.creator.url}
											target="_self"
											class="creator-name text-link">{item.creator.name}</a>
									</span>
								</div>
							</div>
							<div class="item-card-price text-overflow">
								<span className={item.price || item.isFree ? "hidden" : "text-label"}>Offsale</span>
								<span className={item.isFree ? "text-label" : "hidden"}>Free</span>
								<span className={item.price ? "icon-robux" : "hidden"}></span>
								<span className={item.price ? "text-robux-title" : "hidden"}>{item.price ? " " + global.addCommas(item.price) : ""}</span>
							</div>
						</div>
					</a>
				</li>
			);
		});
	}

	render() {
		return (
			<div className={this.state.sponsoredItems.length > 0 ? "results-container" : "hidden"}>
				<div class="section">
					<div class="container-header">
						<h5>Sponsored by Roblox+</h5>
					</div>
					<div>
						<ul class="item-cards-stackable">
							{this.getItemCards()}
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

RPlus.settings.get().then(function (settings) {
	if (!settings.sponsoredCatalogItemsEnabled) {
		return;
	}
	
	var container = $("<div id=\"rplus-featured-items\">");
	var results = $(".catalog-results").prepend(container);
	console.log("Render Roblox+ featured items in .catalog-results (" + results.length + ")");
	ReactDOM.render(<FeaturedCatalogItems />, container[0]);
}).catch(console.error);

// WebGL3D
