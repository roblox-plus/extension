class BucketedSalesChart extends React.Component {
	constructor(props) {
		super(props);

		this.modes = {
			hourly: "hourly",
			daily: "daily"
		};

		this.state = {
			dayOptions: [7, 30, 90, 180],
			startDate: new Date(),
			chartData: null,
			mode: this.modes.hourly
		};

		this.chartDataBase = {
			chart: {
				backgroundColor: "transparent",
				zoomType: "x"
			},
			credits: {
				enabled: false
			},
			title: {
				text: ""
			},
			legend: {
				enabled: false
			},
			xAxis: {
				"type": "datetime",
				"tickLength": 0,
				"labels": {
					format: "{value:%m/%d}"
				}
			},
			yAxis: {
				"title": {
					text: ""
				},
				"min": 0
			},
			time: {
				useUTC: false
			}
		};

		var days = this.state.days = this.state.dayOptions[this.state.dayOptions.length - 1];
		props.loadSalesData(days).then(this.salesDataLoaded.bind(this, days)).catch(this.salesDataLoadFailure.bind(this));
	}

	addSales(sales) {
		let saleCount = 0;

		sales.forEach(function(hourlySales) {
			saleCount += hourlySales;
		});

		return saleCount;
	}

	setDays(days) {
		this.setState({
			days: days
		});
	}

	getDateMinusDays(startDate, days) {
		var date = new Date(startDate);
		date.setDate(date.getDate() - days);

		return new Date(date);
	}

	filterItems(minDate, maxDate, salesData) {
		var filteredData = salesData.filter(function(item) {
			return item.date.getTime() >= minDate.getTime()
				&& item.date.getTime() <= maxDate.getTime();
		});

		return filteredData;
	}

	setChartDataForDays(days, mode) {
		var translatedSalesData = [];

		for (let date in this.salesData) {
			switch (mode) {
				case this.modes.daily:
					translatedSalesData.push({
						date: new Date(new Date(date).setHours(0, 0, 0, 0)),
						value: this.addSales(this.salesData[date])
					});

					break;
				case this.modes.hourly:
				default:
					this.salesData[date].forEach(function(hourlySales, i) {
						let hourlyDate = new Date(date);
						hourlyDate.setHours(i, 0, 0, 0);
		
						translatedSalesData.push({
							date: hourlyDate,
							value: hourlySales
						});
					});

					break;
			}
		}

		var maxDate = this.state.startDate;
		var minDate = this.getDateMinusDays(maxDate, days);

		var chartData = Object.assign({
			series: [
				Highcharts.toHighchartsSeries(this.props.name, this.filterItems(minDate, maxDate, translatedSalesData))
			]
		}, this.chartDataBase);

		chartData.xAxis.min = minDate.getTime();
		chartData.xAxis.max = maxDate.getTime();

		this.setState({
			days: days,
			mode: mode,
			chartData: chartData
		});
	}

	setMode(event) {
		this.setChartDataForDays(this.state.days, event.target.value);
	}

	salesDataLoaded(days, salesData) {
		console.log(salesData);

		this.salesData = salesData;
		this.setChartDataForDays(days, this.state.mode);
	}

	salesDataLoadFailure(e) {
		console.error(e);
		this.setState({
			chartDataError: true
		});
	}

	getChartElement() {
		if (this.state.chartDataError) {
			return (<div class="message-banner">{this.props.name} data failed to load.</div>);
		}

		if (this.state.chartData) {
			console.log(this.state);
			return (<HighchartsReact options={this.state.chartData} />);
		}

		return (<span class="spinner spinner-default"></span>);
	}

	render() {
		return (
			<div>
				<h3>{this.props.name}</h3>
				<div class="section-content">
					<div class="item-sales-controls">
						<div class="select-group rbx-select-group item-sales-mode">
							<select class="input-field select-option rbx-select"
								value={this.state.mode}
								onChange={this.setMode.bind(this)}
								disabled={!this.state.chartData}>
								<option value={this.modes.hourly}>Hourly</option>
								<option value={this.modes.daily}>Daily</option>
							</select>
							<span class="icon-arrow icon-down-16x16"></span>
						</div>
					</div>
					<div class="item-sales-chart">
						{this.getChartElement()}
					</div>
				</div>
			</div>
		);
	}
}

// WebGL3D
