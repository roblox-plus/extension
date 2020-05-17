Extension.ReloadService = class extends Extension.BackgroundService {
	constructor(extension) {
		super("Extension.ReloadService");

		this.extension = extension;

		this.register([
			this.reload
		])
	}

	reload() {
		setTimeout(() => {
			if (this.extension.manifest.permissions.includes("contextMenus")) {
				chrome.contextMenus.removeAll(() => chrome.runtime.reload());
			} else {
				chrome.runtime.reload();
			}
		}, 500);

		return Promise.resolve({});
	}
};

Extension.ReloadService.Singleton = new Extension.ReloadService(Extension.Singleton);

Extension.Reload = function() {
	return Extension.ReloadService.Singleton.reload();
};

var ext = ext || {};
ext.reload = function() {
	Extension.Reload().then(() => {
		// Reload successful
	}).catch(console.error);
};
