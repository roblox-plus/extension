class Settings extends React.Component {
	render() {
		return (
			<About />
		);
	}
}

storage.get("settings-page-v2-enabled", function(enabled) {
	if (!enabled) {
		return;
	}
	
	var container = $("<div id=\"rplus-settings\">");
	$("#user-account").hide().after(container);
	ReactDOM.render(<Settings />, container[0]);
});

// WebGL3D
