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
				enabled: this.props.legend || false,
				useHTML: this.props.legend || false,
				labelFormatter: function() {
					var span = $("<span class=\"text-lead\">").text(this.name);
					return span[0].outerHTML;
				}
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
		
		setInterval(() => {
			props.getScanStatus().then(this.loadStatusSuccess.bind(this)).catch(this.loadStatusFailure.bind(this));
		}, 500);
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

	translateBucket(salesData, mode) {
		var translatedSalesData = [];

		for (let date in salesData) {
			switch (mode) {
				case this.modes.daily:
					translatedSalesData.push({
						date: new Date(new Date(date).setHours(0, 0, 0, 0)),
						value: this.addSales(salesData[date])
					});

					break;
				case this.modes.hourly:
				default:
					salesData[date].forEach(function(hourlySales, i) {
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

		return translatedSalesData;
	}

	setChartDataForDays(days, mode) {
		var maxDate = this.state.startDate;
		var minDate = this.getDateMinusDays(maxDate, days);

		if (this.props.seriesTranslator) {
			this.props.seriesTranslator(this.salesData, mode, this.translateBucket.bind(this)).then((translatedSalesDatas) => {
				var chartData = Object.assign({
					series: translatedSalesDatas.map((data) => {
						return Highcharts.toHighchartsSeries(data.name, this.filterItems(minDate, maxDate, data.data));
					})
				}, this.chartDataBase);
		
				chartData.xAxis.min = minDate.getTime();
				chartData.xAxis.max = maxDate.getTime();
		
				this.setState({
					days: days,
					mode: mode,
					chartData: chartData
				});
			}).catch(console.error);
		} else {
			var translatedSalesData = this.translateBucket(this.salesData, mode);
	
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

	loadStatusSuccess(status) {
		if (status) {
			var cursor = status.cursor || "loading";
			this.setState({
				loadStatus: (<span class="text-secondary">Data is actively being scanned... {`(transactions: ${status.count}, cursor: ${cursor.substring(0, 20)})`}</span>)
			});
		} else {
			this.setState({
				loadStatus: ""
			});
		}
	}

	loadStatusFailure() {
		this.setState({
			loadStatus: ""
		});
	}

	getChartElement() {
		if (this.state.chartDataError) {
			return (<div class="message-banner">{this.props.name} data failed to load.</div>);
		}

		if (this.state.chartData) {
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
					{this.state.loadStatus}
				</div>
			</div>
		);
	}
}

// WebGL3D
