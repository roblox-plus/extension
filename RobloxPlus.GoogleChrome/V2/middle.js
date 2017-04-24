// middle.js [4/4/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
rplusSettings = {
	cache: compact.cache(10 * 1000),
	fields: { "updateLog": "", "serialTracker": true },
	get: request.backgroundFunction("rplusSettings.get", compact(function (callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (rplusSettings.cache.get("get")) {
			callBack(rplusSettings.cache.get("get"));
			return;
		}
		$.get("https://assetgame.roblox.com/asset/?id=311113112").success(function (r) {
			try {
				callBack(r = JSON.parse(decodeURIComponent(r.substring(7, r.length - 9))));
				rplusSettings.cache.set("get", r);
			} catch (e) {
				callBack({});
			}
		}).fail(function () {
			callBack({});
		});
	})),
	set: request.backgroundFunction("rplusSettings.set", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (type(arg) != "object") { callBack(0); return; }
		rplusSettings.get(function (oldSettings) {
			var ns = {};
			for (var n in rplusSettings.fields) {
				var o = rplusSettings.fields[n];
				if (type(o) == type(arg[n])) {
					ns[n] = arg[n];
				} else {
					ns[n] = oldSettings.hasOwnProperty(n) ? oldSettings[n] : o;
				}
			}
			rplusSettings.cache.set("get", ns);
			ns = "<roblox" + encodeURIComponent(JSON.stringify(ns)) + "</roblox>";
			$.post("https://data.roblox.com/Data/Upload.ashx?assetid=311113112&type=Model&length=" + ns.length, ns).success(function (r) {
				callBack(Number(r) || 0);
			}).fail(function () {
				callBack(0);
			});
		});
	}))
};


users.fullInventory = request.backgroundFunction("users.fullInventory", compact(function (arg, callBack) {
	if (typeof (callBack) != "function") {
		console.warn("callBack not function!");
		return;
	}
	var ret = {
		assetTypeId: 0,
		assetType: "",
		id: type(arg.id) == "number" ? arg.id : 0,
		data: []
	};
	if (type(arg.assetTypeId) == "number") {
		ret.assetType = Roblox.catalog.assetTypes[ret.assetTypeId = arg.assetTypeId];
	} else {
		ret.assetTypeId = Number(array.flip(Roblox.catalog.assetTypes)[ret.assetType = string.autoCorrect(arg.assetType, Roblox.catalog.assetTypes)]) || 0;
	}
	if (!ret.assetTypeId || !ret.id) {
		callBack(ret);
		return;
	} else if (compact.cache.callBack(users.fullInventory.cache, ret.id + "_" + ret.assetTypeId, callBack)) {
		return;
	}
	var items = {};
	var count = 0;
	var load; load = function (cursor) {
		$.get("https://www.roblox.com/users/inventory/list-json?assetTypeId=" + ret.assetTypeId + "&itemsPerPage=100&pageNumber=" + cursor + "&userId=" + ret.id + "&cursor=" + cursor).success(function (r) {
			ret.data = [];
			if (r.IsValid) {
				r = r.Data;
				foreach(r.Items, function (n, o) {
					if (!items[o.Item.AssetId] && o.Product) {
						items[o.Item.AssetId] = {
							id: o.Item.AssetId,
							name: o.Item.Name,
							robuxPrice: Number(o.Product.PriceInRobux) || 0,
							serial: Number(o.Product.SerialNumber) || 0,
							free: o.Product.IsPublicDomain,
							limited: o.Product.IsLimited || o.Product.IsLimitedUnique,
							limitedUnique: o.Product.IsLimitedUnique,
							expiration: o.UserItem.RentalExpireTime || "",
							thumbnail: o.Thumbnail.Final ? Roblox.thumbnails.getAssetThumbnailUrl(o.Item.AssetId, 4) : o.Thumbnail.Url
						};
					} else if (!o.Product) {
						//console.warn("Missing product",o);
					}
				});
				if (r.nextPageCursor) {
					load(r.nextPageCursor);
				} else {
					foreach(items, function (n, o) { ret.data.push(o); });
					users.fullInventory.cache.set(ret.id + "_" + ret.assetTypeId, ret);
					callBack(ret);
				}
			} else {
				callBack(ret);
			}
		}).fail(function () {
			setTimeout(load, 1000, cursor);
		});
	};
	load("");
}, {
	queue: true,
	multi: true
}));
users.fullInventory.cache = compact.cache(3 * 60 * 1000);



catalog.getAssetContents = request.backgroundFunction("catalog.getAssetContents", function (id, callBack) {
	if (typeof (callBack) != "function") {
		console.warn("callBack not function!");
		return;
	}
	var ret = {
		textures: [],
		meshes: [],
		contents: []
	};
	$.get("https://assetgame.roblox.com/asset?id=" + id).done(function (r) {
		window.temp1 = r;
		(r.match(/"TextureI?d?".*=\s*\d+/gi) || r.match(/"TextureI?d?".*rbxassetid:\/\/\d+/gi) || []).forEach(function (tex) {
			tex = Number(tex.match(/(\d+)$/)[1]);
			ret.textures.push(tex);
			ret.contents.push(tex);
		});
		(r.match(/"MeshId".*=\s*\d+/gi) || r.match(/MeshId.*rbxassetid:\/\/\d+/gi) || []).forEach(function (mesh) {
			mesh = Number(mesh.match(/(\d+)$/)[1]);
			ret.meshes.push(mesh);
			ret.contents.push(mesh);
		});
		if (r.match(/^\d+;?/)) {
			r.split(";").forEach(function (assetId) {
				assetId = Number(assetId);
				if (assetId) {
					ret.contents.push(assetId);
				}
			});
		} else {
			(r.match(/asset\/?\?\s*id\s*=\s*\d+/gi) || r.match(/rbxassetid:\/\/\d+/gi) || []).forEach(function (assetId) {
				assetId = Number(assetId.match(/(\d+)$/)[1]);
				if (assetId && ret.contents.indexOf(assetId) < 0) {
					ret.contents.push(assetId);
				}
			});
		}
		callBack(ret);
	}).fail(function () {
		callBack(ret);
	});
});



Roblox.trades.openSettingBasedTradeWindow = function (userId, counterTradeId) {
	return new Promise(function (resolve, reject) {
		storage.get("tradeTab", function (on) {
			if (on) {
				Roblox.trades.openTradeTab(userId).then(resolve, reject);
			} else {
				Roblox.trades.openTradeWindow(userId).then(resolve, reject);
			}
		});
	});
};



forumService.youtube = request.backgroundFunction("forumService.youtube", function (v, callBack) {
	if (typeof (callBack) != "function") {
		console.warn("callBack not function!");
		return;
	}
	if (forumService.youtube.cache.get(v)) {
		callBack(forumService.youtube.cache.get(v));
	} else {
		$.get("http://forum.roblox.plus/yt.php?v=" + v).success(function (r) {
			forumService.youtube.cache.set(v, r.title);
			callBack(r.title);
		}).fail(function () {
			callBack("");
		});
	}
});
forumService.youtube.cache = compact.cache(0);



// WebGL3D
