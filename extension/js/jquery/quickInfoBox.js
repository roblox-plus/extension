/* quickInfoBox.js [5/18/2017] */
var RPlus = RPlus || {};

RPlus.quickInfo = RPlus.quickInfo || (function () {
	let quickInfoWidget = null;
	let icon = (function () {
		let navbarItem = $("<li id=\"navbar-rplus\" class=\"navbar-icon-item\">");
		let navbarAnchor = $("<a class=\"rplus-icon-32x32\">");
		navbarItem.append(navbarAnchor);
		return navbarItem;
	})();

	icon.click(function () {
		quickInfoWidget.toggle();
	}).on("dragenter", function (e) {
		quickInfoWidget.open();
	}).on("dragover", function (e) {
		e.preventDefault();
	}).on("drop", function (e) {
		quickInfoWidget.processInput(e.originalEvent.dataTransfer.getData("text"));
	});

	const addIconToHeader = () => {
		if ($("#header").length <= 0) {
			return;
		}

		let container = $("<div>");
		quickInfoWidget = ReactDOM.render(React.createElement(QuickInfoWidget), container[0]);

		$("#header").append(container);

		var settingsIcon = $("#navbar-setting");
		if (settingsIcon.length <= 0) {
			settingsIcon = $("#navbar-settings");
		}

		settingsIcon.after(icon);
	};

	$(document).ready(function() {
		// This fix sucks.
		setTimeout(addIconToHeader, 250);
	});

	return {
		trigger: function(input) {
			quickInfoWidget.processInput(input);
		}
	};
})();


// WebGL3D
