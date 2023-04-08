class ItemOwners extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			loadError: false,
			assetId: props.assetId,
			sortOrder: "Asc",
			owners: []
		};

		this.itemOwnersPager = new CursorPager(100, 100, (pagingParameters) => { return this.loadPage(pagingParameters); });
	}

	init() {
		this.setState({
			loading: true
		});

		this.itemOwnersPager.loadFirstPage().then((data) => this.handlePageLoad(data)).catch((err) => {
			if (err.type === cursorPaginationConstants.errorType.getItemsFailure) {
				setTimeout(() => this.init(), 10 * 1000);
			} else {
				this.handleError(err);
			}
		});
	}

	loadPage(pagingParameters) {
		this.setState({
			loading: true,
			loadError: false
		});

		return new Promise((resolve, reject) => {
			Roblox.inventory.getAssetOwners(this.state.assetId, pagingParameters.cursor, this.state.sortOrder).then((data) => {
				resolve({
					nextPageCursor: data.nextPageCursor,
					items: data.data.map(ownershipRecord => {
						ownershipRecord.updated = new Date(ownershipRecord.updated);
						ownershipRecord.created = new Date(ownershipRecord.created);
						return ownershipRecord;
					})
				});
			}).catch(reject);
		});
	}

	changeSortOrder(event) {
		this.setState({
			sortOrder: event.target.value
		});

		setTimeout(() => this.loadFirstPage(), 10);
	}

	loadFirstPage() {
		this.itemOwnersPager.loadFirstPage().then((data) => this.handlePageLoad(data)).catch((err) => this.handleError(err));
	}

	loadNextPage() {
		this.itemOwnersPager.loadNextPage().then((data) => this.handlePageLoad(data)).catch((err) => this.handleError(err));
	}

	loadPreviousPage() {
		this.itemOwnersPager.loadPreviousPage().then((data) => this.handlePageLoad(data)).catch((err) => this.handleError(err));
	}

	handlePageLoad(data) {
		this.setState({
			loading: false,
			owners: data
		});
	}

	handleError(err) {
		if (err.type !== cursorPaginationConstants.errorType.getItemsFailure) {
			return;
		}

		this.setState({
			loading: false,
			loadError: true
		});

		console.error(err.data);
		setTimeout(() => {
			this.itemOwnersPager.getCurrentPage().then((data) => this.handlePageLoad(data)).catch((err) => this.handleError(err));
		}, 2000);
	}

	getSerialNumber(ownershipRecord) {
		if (!ownershipRecord.serialNumber) {
			return "";			
		}

		return (
			<span>
				<span class="separator">-</span>
				<span class="font-caption-body serial-number">{`Serial #${ownershipRecord.serialNumber}`}</span>
			</span>
		);
	}

	renderPager() {
		if (!this.itemOwnersPager.canLoadNextPage && !this.itemOwnersPager.canLoadPreviousPage) {
			return "";
		}

		return (
			<div class="pager">
				<div class="select-group rbx-select-group">
					<select class="input-field select-option rbx-select"
						value={this.state.sortOrder}
						onChange={this.changeSortOrder.bind(this)}>
						<option value="Asc">Ascending</option>
						<option value="Desc">Descending</option>
					</select>
					<span class="icon-arrow icon-down-16x16"></span>
				</div>
				<ul class="pager">
					<li class={"first" + (this.itemOwnersPager.canLoadPreviousPage ? "" : " disabled")} onClick={this.loadFirstPage.bind(this)}>
						<a>
							<span class="icon-first-page"></span>
						</a>
					</li>
					<li class={"pager-prev" + (this.itemOwnersPager.canLoadPreviousPage ? "" : " disabled")} onClick={this.loadPreviousPage.bind(this)}>
						<a>
							<span class="icon-left"></span>
						</a>
					</li>
					<li class="pager-count">
						<span>Page {this.itemOwnersPager.currentPageNumber}</span>
					</li>
					<li class={"pager-next" + (this.itemOwnersPager.canLoadNextPage ? "" : " disabled")} onClick={this.loadNextPage.bind(this)}>
						<a>
							<span class="icon-right"></span>
						</a>
					</li>
					<li class="last disabled">
						<a>
							<span class="icon-last-page"></span>
						</a>
					</li>
				</ul>
			</div>
		)
	}

	renderOwners() {
		return this.state.owners.map((ownershipRecord) => {
			let ownedSince = `${ownershipRecord.updated.toLocaleDateString()} ${ownershipRecord.updated.toLocaleTimeString()}`;
			if (!ownershipRecord.owner) {
				return (
					<li class="list-item">
						<span class="list-header">
							<Thumbnail thumbnailType={Roblox.thumbnails.types.userHeadshot} thumbnailTargetId={0} />
						</span>
						<div class="rplus-ownership-info">
							<span class="text-label username">Private Inventory</span>
							{this.getSerialNumber(ownershipRecord)}
							<br/>
							<span class="text-secondary">Owner since: {ownedSince}</span>
						</div>
					</li>
				);
			}

			return (
				<li class="list-item">
					<a class="list-header" href={Roblox.users.getProfileUrl(ownershipRecord.owner.userId)}>
						<Thumbnail thumbnailType={Roblox.thumbnails.types.userHeadshot} thumbnailTargetId={ownershipRecord.owner.userId} />
					</a>
					<div class="rplus-ownership-info">
						<a class="text-name username" href={Roblox.users.getProfileUrl(ownershipRecord.owner.userId)}>{ownershipRecord.owner.username}</a>
						{this.getSerialNumber(ownershipRecord)}
						<br/>
						<span class="text-secondary">Owner since: {ownedSince}</span>
					</div>
				</li>
			);
		});
	}

	render() {
		if (this.state.loading) {
			return (
				<div class="rplus-item-owners">
					<div class="section-content-off">Loading...</div>
				</div>
			);
		} else if (this.state.loadError) {
			return (
				<div class="rplus-item-owners">
					<div class="section-content-off">Failed to load owners, trying again...</div>
				</div>
			);
		}

		return (
			<div class="rplus-item-owners">
				{this.renderPager()}
				<ul class="vlist">
					{this.renderOwners()}
				</ul>
			</div>
		);
	}
}
