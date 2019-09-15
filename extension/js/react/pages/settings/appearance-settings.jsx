class AppearanceSettings extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Twemojis</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Replace emojis on the website with twemojis.</span>
						<PillToggle getValue={storage.get.bind(storage, "twemoji")}
							onToggle={storage.set.bind(storage, "twemoji")} />
					</div>
				</div>
			</div>
		);
	}
}