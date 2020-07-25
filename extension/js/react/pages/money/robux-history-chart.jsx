class RobuxHistoryChart extends React.Component {
	constructor(props) {
		super(props);

		this.modes = {
			raw: "raw",
			hourly: "hourly",
			daily: "daily"
		};

		this.state = {
			chartName: "Robux History",
			days: Math.max(1, Math.min(props.days, 366)),
			minDays: 1,
			maxDays: 366,
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
				}
			},
			time: {
				useUTC: false
			}
		};

		this.loadRobuxHistory(props.currencyHolderType, props.currencyHolderId);
	}

	componentWillReceiveProps(nextProps) {
		this.setChartData(this.state.mode, Math.max(this.state.minDays, Math.min(nextProps.days, this.state.maxDays)));
	}

	getDateMinusDays(startDate, days) {
		var date = new Date(startDate);
		date.setDate(date.getDate() - days);

		return new Date(date);
	}

	translateRobuxHistory(robuxHistory, mode) {
		let translatedRobuxHistory = [];
		let robuxByDate = {};

		robuxHistory.forEach(robuxHistoryRecord => {
			let translatedRecord = {
				date: new Date(robuxHistoryRecord.robuxDate),
				value: robuxHistoryRecord.robux
			};

			switch (mode) {
				case this.modes.daily:
					translatedRecord.date = new Date(new Date(robuxHistoryRecord.robuxDate).setHours(0, 0, 0, 0));
					break;
				case this.modes.hourly:
					translatedRecord.date = new Date(new Date(robuxHistoryRecord.robuxDate).setMinutes(0, 0, 0));
					break;
			}

			let dateKey = translatedRecord.date.toString();
			let existingRecord = robuxByDate[dateKey];
			if (existingRecord) {
				existingRecord.value = Math.max(existingRecord.value, translatedRecord.value);
			} else {
				robuxByDate[dateKey] = translatedRecord;
				translatedRobuxHistory.push(translatedRecord);
			}
		});

		return translatedRobuxHistory;
	}

	setChartData(mode, days) {
		var maxDate = this.state.startDate;
		var minDate = this.getDateMinusDays(maxDate, days);

		var translatedRobuxHistory  = this.translateRobuxHistory(this.robuxHistory, mode);
		var chartData = Object.assign({
			series: [
				Highcharts.toHighchartsSeries(this.state.chartName, translatedRobuxHistory)
			]
		}, this.chartDataBase);

		chartData.xAxis.min = minDate.getTime();
		chartData.xAxis.max = maxDate.getTime();

		this.setState({
			mode: mode,
			days: days,
			chartData: chartData
		});
	}

	setMode(event) {
		this.setChartData(event.target.value, this.state.days);
	}

	loadRobuxHistory(currencyHolderType, currencyHolderId) {
		let startDateTime = this.getDateMinusDays(new Date(), this.state.maxDays);
		RPlus.robuxHistory.getRobuxHistory(currencyHolderType, currencyHolderId, startDateTime.getTime(), +new Date).then(this.robuxHistoryLoaded.bind(this)).catch(this.robuxHistoryLoadFailure.bind(this));
	}

	robuxHistoryLoaded(robuxHistory) {
		console.log(robuxHistory);

		this.robuxHistory = robuxHistory;
		this.setChartData(this.state.mode, this.state.days);
	}

	robuxHistoryLoadFailure(e) {
		console.error(e);
		this.setState({
			chartDataError: true
		});
	}

	getChartElement() {
		if (this.state.chartDataError) {
			return (<div class="message-banner">{this.state.chartName} data failed to load.</div>);
		}

		if (this.state.chartData) {
			return (<HighchartsReact options={this.state.chartData} />);
		}

		return (<span class="spinner spinner-default"></span>);
	}

	render() {
		return (
			<div>
				<h3>{this.state.chartName}</h3>
				<div class="section-content">
					<div class="robux-history-chart">
						{this.getChartElement()}
					</div>
				</div>
			</div>
		);
	}
}

// TODO: Move this somewhere else
RPlus.robuxHistory.isEnabled().then(robuxHistoryEnabled => {
	if (!robuxHistoryEnabled) {
		return;
	}

	let robuxHistoryContainer = $("<div id=\"rplus-robux-history\">");
	let summaryTab = $("#Summary_tab").append(robuxHistoryContainer);

	// This.... is a sin.......
	let modeContainer = $("<div class=\"SortsAndFilters\">");
	let modeLabel = $("<span class=\"form-label\">").text("Time Step:");
	let modeSelect = $("<select class=\"form-select\">");

	const getDays = () => {
		switch ($("#TimePeriod").val()) {
			case "day":
				return 1;
			case "week":
				return 7;
			case "year":
				return 366;
			case "month":
			default:
				return 30;
		}
	};

	(["Raw", "Hourly", "Daily"]).forEach(function(mode) {
		let option = $("<option>").val(mode.toLowerCase()).text(mode);
		modeSelect.append(option);
	});

	modeSelect.val("hourly");

	console.log("Render RobuxHistoryChart in #Summary_tab (" + summaryTab.length + ")");
	let robuxHistoryChart = ReactDOM.render(<RobuxHistoryChart currencyHolderType="User" currencyHolderId={Roblox.users.authenticatedUserId} days={getDays()} />, robuxHistoryContainer[0]);
	console.log(robuxHistoryChart);

	$("#TimePeriod").change(function() {
		robuxHistoryChart.componentWillReceiveProps({
			days: getDays()
		});
	});

	modeSelect.change(function(e) {
		robuxHistoryChart.setMode(e.originalEvent);
	});

	$("#TimePeriod").parent().after(modeContainer.append(modeLabel, modeSelect));
}).catch(console.warn);

// WebGL3D
