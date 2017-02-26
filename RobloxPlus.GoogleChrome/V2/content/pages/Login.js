var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Login = function () {
	var cid = 0;
	$("#LoginUsername,#Username").blur(function () {
		var el = $(this);
		var id = ++cid;
		if (el.val()) {
			storage.get("changedLogin", function (v) {
				if (v && el.val()) {
					users.getByUsername(el.val(), function (u) {
						console.log(u);
						if (cid == id && u.username) {
							el.val(u.username);
						}
					});
				}
			});
		}
	});

	return {};
};

RPlus.Pages.Login.patterns = [/^\/NewLogin/i, /^\/Login/i];


// WebGL3D
