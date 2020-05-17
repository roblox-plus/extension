// prext.js [3/8/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
browser = (function (userAgentInfo) {
	var wholeVersion = userAgentInfo[2].split(".");
	return {
		name: userAgentInfo[1],
		version: userAgentInfo[2],
		wholeVersion: Number(wholeVersion[0]) || 0,
		userAgent: navigator.userAgent,
		userAgentMatch: userAgentInfo[0]
	};
})(navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)\/([\d.]+)/i) || ["Unknown", "0.0"]);

ext = (function () {
	let extension = Extension.Singleton;

	return {
		"id": extension.id,
		"manifest": extension.manifest,
		"incognito": extension.isIncognito,
		"isBackground": extension.executionContextType === Extension.ExecutionContextTypes.background,
		"isContentScript": extension.executionContextType === Extension.ExecutionContextTypes.tab,
		"isBrowserAction": extension.executionContextType === Extension.ExecutionContextTypes.browserAction,

		"getUrl": function(path) {
			return extension.getUrl(path);
		},

		"reload": function() {
			Extension.Reload().then(() => {
				// Reload successful
			}).catch(console.error);
		}
	};
})();

console.log(ext.manifest.name + " " + ext.manifest.version + " started" + (ext.incognito ? " in icognito" : ""));

// WebGL3D
