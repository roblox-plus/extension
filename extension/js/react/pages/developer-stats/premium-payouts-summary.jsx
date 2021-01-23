class PremiumPayoutsSummary extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			errorMessage: "",
			actualRobuxEarned: 0,
			projectedRobuxEarned: 0
		};

		this.componentWillReceiveProps(props);
	}

	init(universeId, startDate, endDate) {
		this.setState({
			loading: true,
			errorMessage: ""
		});

		Roblox.economy.getPremiumPayouts(universeId, startDate, endDate).then(data => {
			let actualRobuxEarned = 0;
			let projectedRobuxEarned = 0;

			data.forEach(payout => {
				switch (payout.type) {
					case "Projected":
						projectedRobuxEarned += payout.payoutInRobux;
						return;
					case "Actual":
						actualRobuxEarned += payout.payoutInRobux;
						return;
					default:
						console.warn("Unknown payout type", payout);
						return;
				}
			});

			this.setState({
				loading: false,
				errorMessage: "",
				actualRobuxEarned: actualRobuxEarned,
				projectedRobuxEarned: projectedRobuxEarned
			});
		}).catch(err => {
			console.error(err);

			this.setState({
				loading: false,
				errorMessage: "Failed to load premium payout summary. Please try again later."
			});
		});
	}

	componentWillReceiveProps(nextProps) {
		const startDate = new Date(nextProps.startDate);
		const endDate = new Date(nextProps.endDate);
		this.init(nextProps.universeId, this.formatDate(startDate), this.formatDate(endDate));
	}

	formatDate(date) {
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
	}

	render() {
		if (this.state.loading) {
			return (
				<div>
					<h3 class="payout-title">Summary</h3>
					<span class="spinner spinner-default"></span>
				</div>
			);
		}

		if (this.state.errorMessage) {
			return (
				<div>
					<h3 class="payout-title">Summary</h3>
					<div class="section-content-off">{this.state.errorMessage}</div>
				</div>
			);
		}

		return (
			<div>
				<h3 class="payout-title">Summary</h3>
				<table class="table summary">
					<thead>
						<tr>
							<th class="text-label">Category</th>
							<th class="text-label">Amount</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Actual Robux Earned</td>
							<td>
								<span class="icon-robux-16x16"></span>
								<span class="text-robux"> {global.addCommas(this.state.actualRobuxEarned)}</span>
							</td>
						</tr>
						<tr>
							<td>Projected Robux</td>
							<td>
								<span class="icon-robux-16x16"></span>
								<span class="text-robux"> {global.addCommas(this.state.projectedRobuxEarned)}</span>
							</td>
						</tr>
						<tr>
							<td>Estimated Total</td>
							<td>
								<span class="icon-robux-16x16"></span>
								<span class="text-robux"> {global.addCommas(this.state.actualRobuxEarned + this.state.projectedRobuxEarned)}</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}
};