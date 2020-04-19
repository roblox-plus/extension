var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Login = function () {
	var cid = 0;
	$("#LoginUsername,#Username").blur(function () {
		var el = $(this);
		var id = ++cid;
		if (el.val()) {
			Extension.Storage.Singleton.get("changedLogin").then(function (v) {
				if (v && el.val()) {
					Roblox.users.getByUsername(el.val()).then(function (u) {
						console.log(u);
						if (cid == id) {
							el.val(u.username);
						}
					});
				}
			}).catch(console.warn);
		}
	});

	return {};
};

RPlus.Pages.Login.patterns = [/^\/NewLogin/i, /^\/Login/i];


// WebGL3D
