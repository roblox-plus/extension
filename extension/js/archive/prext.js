// prext.js [3/8/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
ext = (function () {
	let extension = Extension.Singleton;

	return {
		"reload": function() {
			Extension.Reload().then(() => {
				// Reload successful
			}).catch(console.error);
		}
	};
})();

// WebGL3D
