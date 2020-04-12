class Extension {
	constructor() {
		this.manifest = chrome.runtime.getManifest();
	}

	get id() {
		return chrome.runtime.id;
	}

	get name() {
		return this.manifest.name;
	}

	get version() {
		return this.manifest.version;
	}

	get icon() {
		let largestIconSize = 0;
		let largestIcon = "";

		for (let size in this.manifest.icons) {
			if (Number(size) > largestIconSize) {
				largestIconSize = Number(size);
				largestIcon = this.manifest.icons[size];
			}
		}

		if (!largestIcon) {
			return;
		}

		return {
			imageUrl: this.getUrl(largestIcon)
		};
	}

	get executionContextType() {
		if (this.manifest.background && this.manifest.background.page && this.getUrl(this.manifest.background.page) === location.href) {
			return Extension.ExecutionContextTypes.background;
		}

		if (location.protocol.startsWith("chrome-extension")) {
			return Extension.ExecutionContextTypes.browserAction;
		}

		return Extension.ExecutionContextTypes.tab;
	}

	get isIncognito() {
		return chrome.extension.inIncognitoContext;
	}

	getUrl(path) {
		return chrome.extension.getURL(path);
	}
}

Extension.ExecutionContextTypes = {
	"background": "background",
	"tab": "tab",
	"browserAction": "browserAction"
};

Extension.Singleton = new Extension();
