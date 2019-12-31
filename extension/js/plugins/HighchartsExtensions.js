Highcharts.toHighchartsSeries = function(name, chartDataArray) {
	var data = chartDataArray.map(function(item) {
		return [item.date.getTime(), item.value];
	});

	return {
		name: name,
		data: data
	};
};
