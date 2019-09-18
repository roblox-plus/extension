class Settings extends React.Component {
	render() {
		let tabs = [
			{
				label: "About",
				class: About
			},
			{
				label: "Navigation",
				class: NavigationSettings
			},
			{
				label: "Notifications",
				class: NotificationSettings
			},
			{
				label: "Other",
				class: OtherSettings
			}
		];

		return (
			<div class="section">
				<div class="container-header">
					<h1>Roblox+ Settings</h1>
				</div>
				<div>
					<VerticalTabs tabs={tabs} />
				</div>
			</div>
		);
	}
}

if (location.search.includes("rplus")) {
	var container = $("<div id=\"rplus-settings\" class=\"page-content\">");
	var userAccount = $("#user-account").hide().after(container);
	console.log("Render Settings in #user-account (" + userAccount.length + ")");
	ReactDOM.render(<Settings />, container[0]);
} else {
	var li = $("<li class=\"menu-option\">");
	var a = $("<a class=\"rbx-tab-heading\">").append($("<span class=\"font-caption-header\">").text(ext.manifest.name)).attr("href", ext.manifest.homepage_url);
	$("#vertical-menu").append(li.append(a));
}

// WebGL3D
