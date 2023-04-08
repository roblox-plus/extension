class SettingsTab extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isPremium: false,
			pills: {}
		};

		let settingsTab = this;
		RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(function (isPremium) {
			settingsTab.setState({
				isPremium: isPremium
			});
		}).catch(function (e) {
			console.error("Failed to load premium status", e);
		});
	}

	getPillValue(settingName, callBack) {
		let notificationSettings = this;

		let embeddedSetting = settingName.split(".");
		if (embeddedSetting.length === 2) {
			Extension.Storage.Singleton.get(embeddedSetting[0]).then(function (embeddedObject) {
				embeddedObject = embeddedObject || {};

				var value = embeddedObject[embeddedSetting[1]] || false;
				var pillOverride = {};
				pillOverride[settingName] = value;

				notificationSettings.setState({
					pills: Object.assign({}, notificationSettings.state.pills, pillOverride)
				});

				callBack(value);
			}).catch(err => {
				console.warn(embeddedSetting, err);
				callBack(false);
			});
			return;
		}

		switch (settingName) {
			case "groupShoutNotifier_mode":
				Extension.Storage.Singleton.get(settingName).then(function (value) {
					let enabled = value === "whitelist";

					var pillOverride = {};
					pillOverride.groupShoutWhitelistEnabled = enabled;

					notificationSettings.setState({
						pills: Object.assign({}, notificationSettings.state.pills, pillOverride)
					});

					callBack(enabled);
				}).catch(err => {
					console.warn(settingName, err);
					callBack(false);
				});
				break;
			default:
				Extension.Storage.Singleton.get(settingName).then(function (value) {
					var pillOverride = {};
					pillOverride[settingName] = !!value;

					notificationSettings.setState({
						pills: Object.assign({}, notificationSettings.state.pills, pillOverride)
					});

					callBack(!!value);
				}).catch(err => {
					console.warn(err);
					callBack(false);
				});
		}
	}

	setPillValue(settingName, value) {
		let notificationSettings = this;

		let embeddedSetting = settingName.split(".");
		if (embeddedSetting.length === 2) {
			Extension.Storage.Singleton.get(embeddedSetting[0]).then(function (embeddedObject) {
				embeddedObject = embeddedObject || {};
				embeddedObject[embeddedSetting[1]] = value;

				var pillOverride = {};
				pillOverride[settingName] = value;

				notificationSettings.setState({
					pills: Object.assign({}, notificationSettings.state.pills, pillOverride)
				});

				Extension.Storage.Singleton.blindSet(embeddedSetting[0], embeddedObject);
			}).catch(console.error);

			return;
		}

		switch (settingName) {
			case "groupShoutNotifier_mode":
				Extension.Storage.Singleton.blindSet(settingName, value ? "whitelist" : "all");

				var pillOverride = {};
				pillOverride.groupShoutWhitelistEnabled = value;

				notificationSettings.setState({
					pills: Object.assign({}, notificationSettings.state.pills, pillOverride)
				});

				break;
			default:
				Extension.Storage.Singleton.set(settingName, value).then(() => {
					var pillOverride = {};
					pillOverride[settingName] = value;

					notificationSettings.setState({
						pills: Object.assign({}, notificationSettings.state.pills, pillOverride)
					});
				}).catch(e => {
					console.warn(settingName, e);
				});
		}
	}
}