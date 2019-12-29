Highcharts.constants = {
	lineDelimiter: "|",
	itemDelimiter: ","
};

// [{date:new Date("2013-09-05T01:37:38.3Z"), value: 1}, ...] -> col,row|1378345058300,1
Highcharts.toHighchartsData = function(chartDataArray) {
	var csv = chartDataArray.map(function(item) {
		return item.date.getTime() + Highcharts.constants.itemDelimiter + item.value;
	}).join(Highcharts.constants.lineDelimiter);
	return {
		csv: `col${Highcharts.constants.itemDelimiter}row${Highcharts.constants.lineDelimiter}${csv}`,
		itemDelimiter: Highcharts.constants.itemDelimiter,
		lineDelimiter: Highcharts.constants.lineDelimiter
	};
};

Highcharts.toHighchartsSeries = function(name, chartDataArray) {
	var data = chartDataArray.map(function(item) {
		return [item.date.getTime(), item.value];
	});

	return {
		name: name,
		data: data
	};
};
