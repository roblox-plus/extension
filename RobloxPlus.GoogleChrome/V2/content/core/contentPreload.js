$.get(ext.getUrl("/css/rplus/images.css")).done(function (css) {
	css = css.replace(/url\(([^)]+)\)/gi, function (u) {
		return "url(" + ext.getUrl(u.substring(4, u.length - 1)) + ")";
	});
	var styleTag = $("<style>").html(css);
	$("head").append(styleTag);
}).fail(function () {
	console.error("Failed to load Roblox+ CSS");
});

// WebGL3D
