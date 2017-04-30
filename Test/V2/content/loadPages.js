var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

(function(){
	for (var pageName in RPlus.Pages) {
		if (RPlus.Pages.hasOwnProperty(pageName)) {
			if (typeof (RPlus.Pages[pageName]) != "function") {
				console.warn("Miss-indexed page value:", pageName);
			}

			if(!RPlus.Pages[pageName].hasOwnProperty("patterns") || !Array.isArray(RPlus.Pages[pageName].patterns)){
				console.warn("Missing pattern:", pageName);
				continue;
			}

			var patterns = RPlus.Pages[pageName].patterns;
			for (var i = 0; i < patterns.length; i++) {
				if (patterns[i].test(location.pathname)) {
					console.log("Page:", pageName);
					RPlus.Pages[pageName] = RPlus.Pages[pageName]();
					RPlus.Pages[pageName].patterns = patterns;
					break;
				}
			}
		}
	}
})();


// WebGL3D
