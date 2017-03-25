// preroblox.js [3/13/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
compact.cache = function (ret, cb) {
	var timeout = type(ret) == "number" ? ret : 5000;
	cb = fixCB(cb);
	return ret = {
		data: {},
		get: function (k) { return ret.data[k] && ret.data[k].v; },
		set: function (k, v, t) {
			if (ret.data[k] && ret.data[k].t) { clearTimeout(ret.data[k].t); }
			ret.data[k] = { v: v };
			if (timeout > 0 && t !== false) {
				ret.data[k].t = setTimeout(function () {
					delete ret.data[k];
				}, timeout);
			}
			cb(k, v);
		},
		remove: function (k) {
			delete ret.data[k];
		},
		clear: function () { ret.data = {}; }
	};
};


url.roblox = function (s, sub) { return "https://" + (sub || url.roblox.subdomain) + ".roblox.com" + url.send(s); };
url.roblox.subdomain = "www";
url.roblox.linkify = /(https?\:\/\/)?(?:www\.)?([a-z0-9\-]{2,}\.)*(((m|de|www|web|api|blog|wiki|help|corp|polls|bloxcon|developer|devforum|forum)\.roblox\.com|robloxlabs\.com)|(www\.shoproblox\.com))((\/[A-Za-z0-9-+&@#\/%?=~_|!:,.;]*)|(\b|\s))/gm;



brickColor = {
	colors: { "Br. yellowish green": { "r": 164, "g": 189, "b": 71, "number": 119 }, "Bright yellow": { "r": 245, "g": 205, "b": 48, "number": 24 }, "Bright orange": { "r": 218, "g": 133, "b": 65, "number": 106 }, "Bright red": { "r": 196, "g": 40, "b": 28, "number": 21 }, "Bright violet": { "r": 107, "g": 50, "b": 124, "number": 104 }, "Bright blue": { "r": 13, "g": 105, "b": 172, "number": 23 }, "Bright bluish green": { "r": 0, "g": 143, "b": 156, "number": 107 }, "Bright green": { "r": 75, "g": 151, "b": 75, "number": 37 }, "Institutional white": { "r": 248, "g": 248, "b": 248, "number": 1001 }, "White": { "r": 242, "g": 243, "b": 243, "number": 1 }, "Light stone grey": { "r": 229, "g": 228, "b": 223, "number": 208 }, "Mid gray": { "r": 205, "g": 205, "b": 205, "number": 1002 }, "Medium stone grey": { "r": 163, "g": 162, "b": 165, "number": 194 }, "Dark stone grey": { "r": 99, "g": 95, "b": 98, "number": 199 }, "Black": { "r": 27, "g": 42, "b": 53, "number": 26 }, "Really black": { "r": 17, "g": 17, "b": 17, "number": 1003 }, "Grime": { "r": 127, "g": 142, "b": 100, "number": 1022 }, "Br. yellowish orange": { "r": 226, "g": 155, "b": 64, "number": 105 }, "Light orange": { "r": 234, "g": 184, "b": 146, "number": 125 }, "Sand red": { "r": 149, "g": 121, "b": 119, "number": 153 }, "Lavender": { "r": 140, "g": 91, "b": 159, "number": 1023 }, "Sand blue": { "r": 116, "g": 134, "b": 157, "number": 135 }, "Medium blue": { "r": 110, "g": 153, "b": 202, "number": 102 }, "Sand green": { "r": 120, "g": 144, "b": 130, "number": 151 }, "Brick yellow": { "r": 215, "g": 197, "b": 154, "number": 5 }, "Cool yellow": { "r": 253, "g": 234, "b": 141, "number": 226 }, "Neon orange": { "r": 213, "g": 115, "b": 61, "number": 1005 }, "Medium red": { "r": 218, "g": 134, "b": 122, "number": 101 }, "Light reddish violet": { "r": 232, "g": 186, "b": 200, "number": 9 }, "Pastel Blue": { "r": 128, "g": 187, "b": 219, "number": 11 }, "Teal": { "r": 18, "g": 238, "b": 212, "number": 1018 }, "Medium green": { "r": 161, "g": 196, "b": 140, "number": 29 }, "Pastel brown": { "r": 255, "g": 204, "b": 153, "number": 1030 }, "Pastel yellow": { "r": 255, "g": 255, "b": 204, "number": 1029 }, "Pastel orange": { "r": 255, "g": 201, "b": 201, "number": 1025 }, "Pink": { "r": 255, "g": 102, "b": 204, "number": 1016 }, "Pastel violet": { "r": 177, "g": 167, "b": 255, "number": 1026 }, "Pastel light blue": { "r": 175, "g": 221, "b": 255, "number": 1024 }, "Pastel blue-green": { "r": 159, "g": 243, "b": 233, "number": 1027 }, "Pastel green": { "r": 204, "g": 255, "b": 204, "number": 1028 }, "Olive": { "r": 193, "g": 190, "b": 66, "number": 1008 }, "New Yeller": { "r": 255, "g": 255, "b": 0, "number": 1009 }, "Deep orange": { "r": 255, "g": 175, "b": 0, "number": 1017 }, "Really red": { "r": 255, "g": 0, "b": 0, "number": 1004 }, "Hot pink": { "r": 255, "g": 0, "b": 191, "number": 1032 }, "Really blue": { "r": 0, "g": 0, "b": 255, "number": 1010 }, "Toothpaste": { "r": 0, "g": 255, "b": 255, "number": 1019 }, "Lime green": { "r": 0, "g": 255, "b": 0, "number": 1020 }, "Brown": { "r": 124, "g": 92, "b": 70, "number": 217 }, "Nougat": { "r": 204, "g": 142, "b": 105, "number": 18 }, "Dark orange": { "r": 160, "g": 95, "b": 53, "number": 38 }, "Royal purple": { "r": 98, "g": 37, "b": 209, "number": 1031 }, "Alder": { "r": 180, "g": 128, "b": 255, "number": 1006 }, "Cyan": { "r": 4, "g": 175, "b": 236, "number": 1013 }, "Light blue": { "r": 180, "g": 210, "b": 228, "number": 45 }, "Camo": { "r": 58, "g": 125, "b": 21, "number": 1021 }, "Reddish brown": { "r": 105, "g": 64, "b": 40, "number": 192 }, "CGA brown": { "r": 170, "g": 85, "b": 0, "number": 1014 }, "Dusty Rose": { "r": 163, "g": 75, "b": 75, "number": 1007 }, "Magenta": { "r": 170, "g": 0, "b": 170, "number": 1015 }, "Deep blue": { "r": 33, "g": 84, "b": 185, "number": 1012 }, "Navy blue": { "r": 0, "g": 32, "b": 96, "number": 1011 }, "Dark green": { "r": 40, "g": 127, "b": 71, "number": 28 }, "Earth green": { "r": 39, "g": 70, "b": 45, "number": 141 }, "Grey": { "r": 161, "g": 165, "b": 162, "number": 2 }, "Light yellow": { "r": 249, "g": 233, "b": 153, "number": 3 }, "Light green (Mint)": { "r": 194, "g": 218, "b": 184, "number": 6 }, "Light orange brown": { "r": 203, "g": 132, "b": 66, "number": 12 }, "Med. reddish violet": { "r": 196, "g": 112, "b": 160, "number": 22 }, "Earth orange": { "r": 98, "g": 71, "b": 50, "number": 25 }, "Dark grey": { "r": 109, "g": 110, "b": 108, "number": 27 }, "Lig. Yellowich orange": { "r": 243, "g": 207, "b": 155, "number": 36 }, "Light bluish violet": { "r": 193, "g": 202, "b": 222, "number": 39 }, "Transparent": { "r": 236, "g": 236, "b": 236, "number": 40 }, "Tr. Red": { "r": 205, "g": 84, "b": 75, "number": 41 }, "Tr. Lg blue": { "r": 193, "g": 223, "b": 240, "number": 42 }, "Tr. Blue": { "r": 123, "g": 182, "b": 232, "number": 43 }, "Tr. Yellow": { "r": 247, "g": 241, "b": 141, "number": 44 }, "Tr. Flu. Reddish orange": { "r": 217, "g": 133, "b": 108, "number": 47 }, "Tr. Green": { "r": 132, "g": 182, "b": 141, "number": 48 }, "Tr. Flu. Green": { "r": 248, "g": 241, "b": 132, "number": 49 }, "Phosph. White": { "r": 236, "g": 232, "b": 222, "number": 50 }, "Light red": { "r": 238, "g": 196, "b": 182, "number": 100 }, "Light grey": { "r": 199, "g": 193, "b": 183, "number": 103 }, "Earth yellow": { "r": 104, "g": 92, "b": 67, "number": 108 }, "Bright bluish violet": { "r": 67, "g": 84, "b": 147, "number": 110 }, "Tr. Brown": { "r": 191, "g": 183, "b": 177, "number": 111 }, "Medium bluish violet": { "r": 104, "g": 116, "b": 172, "number": 112 }, "Tr. Medi. reddish violet": { "r": 228, "g": 173, "b": 200, "number": 113 }, "Med. yellowish green": { "r": 199, "g": 210, "b": 60, "number": 115 }, "Med. bluish green": { "r": 85, "g": 165, "b": 175, "number": 116 }, "Light bluish green": { "r": 183, "g": 215, "b": 213, "number": 118 }, "Lig. yellowish green": { "r": 217, "g": 228, "b": 167, "number": 120 }, "Med. yellowish orange": { "r": 231, "g": 172, "b": 88, "number": 121 }, "Br. reddish orange": { "r": 211, "g": 111, "b": 76, "number": 123 }, "Bright reddish violet": { "r": 146, "g": 57, "b": 120, "number": 124 }, "Tr. Bright bluish violet": { "r": 165, "g": 165, "b": 203, "number": 126 }, "Gold": { "r": 220, "g": 188, "b": 129, "number": 127 }, "Dark nougat": { "r": 174, "g": 122, "b": 89, "number": 128 }, "Silver": { "r": 156, "g": 163, "b": 168, "number": 131 }, "Neon green": { "r": 216, "g": 221, "b": 86, "number": 134 }, "Sand violet": { "r": 135, "g": 124, "b": 144, "number": 136 }, "Medium orange": { "r": 224, "g": 152, "b": 100, "number": 137 }, "Sand yellow": { "r": 149, "g": 138, "b": 115, "number": 138 }, "Earth blue": { "r": 32, "g": 58, "b": 86, "number": 140 }, "Tr. Flu. Blue": { "r": 207, "g": 226, "b": 247, "number": 143 }, "Sand blue metallic": { "r": 121, "g": 136, "b": 161, "number": 145 }, "Sand violet metallic": { "r": 149, "g": 142, "b": 163, "number": 146 }, "Sand yellow metallic": { "r": 147, "g": 135, "b": 103, "number": 147 }, "Dark grey metallic": { "r": 87, "g": 88, "b": 87, "number": 148 }, "Black metallic": { "r": 22, "g": 29, "b": 50, "number": 149 }, "Light grey metallic": { "r": 171, "g": 173, "b": 172, "number": 150 }, "Dark red": { "r": 123, "g": 46, "b": 47, "number": 154 }, "Tr. Flu. Yellow": { "r": 255, "g": 246, "b": 123, "number": 157 }, "Tr. Flu. Red": { "r": 225, "g": 164, "b": 194, "number": 158 }, "Gun metallic": { "r": 117, "g": 108, "b": 98, "number": 168 }, "Red flip/flop": { "r": 151, "g": 105, "b": 91, "number": 176 }, "Yellow flip/flop": { "r": 180, "g": 132, "b": 85, "number": 178 }, "Silver flip/flop": { "r": 137, "g": 135, "b": 136, "number": 179 }, "Curry": { "r": 215, "g": 169, "b": 75, "number": 180 }, "Fire Yellow": { "r": 249, "g": 214, "b": 46, "number": 190 }, "Flame yellowish orange": { "r": 232, "g": 171, "b": 45, "number": 191 }, "Flame reddish orange": { "r": 207, "g": 96, "b": 36, "number": 193 }, "Royal blue": { "r": 70, "g": 103, "b": 164, "number": 195 }, "Dark Royal blue": { "r": 35, "g": 71, "b": 139, "number": 196 }, "Bright reddish lilac": { "r": 142, "g": 66, "b": 133, "number": 198 }, "Lemon metalic": { "r": 130, "g": 138, "b": 93, "number": 200 }, "Dark Curry": { "r": 176, "g": 142, "b": 68, "number": 209 }, "Faded green": { "r": 112, "g": 149, "b": 120, "number": 210 }, "Turquoise": { "r": 121, "g": 181, "b": 181, "number": 211 }, "Light Royal blue": { "r": 159, "g": 195, "b": 233, "number": 212 }, "Medium Royal blue": { "r": 108, "g": 129, "b": 183, "number": 213 }, "Rust": { "r": 143, "g": 76, "b": 42, "number": 216 }, "Reddish lilac": { "r": 150, "g": 112, "b": 159, "number": 218 }, "Lilac": { "r": 107, "g": 98, "b": 155, "number": 219 }, "Light lilac": { "r": 167, "g": 169, "b": 206, "number": 220 }, "Bright purple": { "r": 205, "g": 98, "b": 152, "number": 221 }, "Light purple": { "r": 228, "g": 173, "b": 200, "number": 222 }, "Light pink": { "r": 220, "g": 144, "b": 149, "number": 223 }, "Light brick yellow": { "r": 240, "g": 213, "b": 160, "number": 224 }, "Warm yellowish orange": { "r": 235, "g": 184, "b": 127, "number": 225 }, "Dove blue": { "r": 125, "g": 187, "b": 221, "number": 232 }, "Medium lilac": { "r": 52, "g": 43, "b": 117, "number": 268 } },
	smallList: ["Br. yellowish green", "Bright yellow", "Bright orange", "Bright red", "Bright violet", "Bright blue", "Bright bluish green", "Bright green", "Institutional white", "White", "Light stone grey", "Mid gray", "Medium stone grey", "Dark stone grey", "Black", "Really black", "Grime", "Br. yellowish orange", "Light orange", "Sand red", "Lavender", "Sand blue", "Medium blue", "Sand green", "Brick yellow", "Cool yellow", "Neon orange", "Medium red", "Light reddish violet", "Pastel Blue", "Teal", "Medium green", "Pastel brown", "Pastel yellow", "Pastel orange", "Pink", "Pastel violet", "Pastel light blue", "Pastel blue-green", "Pastel green", "Olive", "New Yeller", "Deep orange", "Really red", "Hot pink", "Really blue", "Toothpaste", "Lime green", "Brown", "Nougat", "Dark orange", "Royal purple", "Alder", "Cyan", "Light blue", "Camo", "Reddish brown", "CGA brown", "Dusty Rose", "Magenta", "Deep blue", "Navy blue", "Dark green", "Earth green"],
	list: ["Br. yellowish green", "Bright yellow", "Bright orange", "Bright red", "Bright violet", "Bright blue", "Bright bluish green", "Bright green", "Institutional white", "White", "Light stone grey", "Mid gray", "Medium stone grey", "Dark stone grey", "Black", "Really black", "Grime", "Br. yellowish orange", "Light orange", "Sand red", "Lavender", "Sand blue", "Medium blue", "Sand green", "Brick yellow", "Cool yellow", "Neon orange", "Medium red", "Light reddish violet", "Pastel Blue", "Teal", "Medium green", "Pastel brown", "Pastel yellow", "Pastel orange", "Pink", "Pastel violet", "Pastel light blue", "Pastel blue-green", "Pastel green", "Olive", "New Yeller", "Deep orange", "Really red", "Hot pink", "Really blue", "Toothpaste", "Lime green", "Brown", "Nougat", "Dark orange", "Royal purple", "Alder", "Cyan", "Light blue", "Camo", "Reddish brown", "CGA brown", "Dusty Rose", "Magenta", "Deep blue", "Navy blue", "Dark green", "Earth green", "Grey", "Light yellow", "Light green (Mint)", "Light orange brown", "Med. reddish violet", "Earth orange", "Dark grey", "Lig. Yellowich orange", "Light bluish violet", "Transparent", "Tr. Red", "Tr. Lg blue", "Tr. Blue", "Tr. Yellow", "Tr. Flu. Reddish orange", "Tr. Green", "Tr. Flu. Green", "Phosph. White", "Light red", "Light grey", "Earth yellow", "Bright bluish violet", "Tr. Brown", "Medium bluish violet", "Tr. Medi. reddish violet", "Med. yellowish green", "Med. bluish green", "Light bluish green", "Lig. yellowish green", "Med. yellowish orange", "Br. reddish orange", "Bright reddish violet", "Tr. Bright bluish violet", "Gold", "Dark nougat", "Silver", "Neon green", "Sand violet", "Medium orange", "Sand yellow", "Earth blue", "Tr. Flu. Blue", "Sand blue metallic", "Sand violet metallic", "Sand yellow metallic", "Dark grey metallic", "Black metallic", "Light grey metallic", "Dark red", "Tr. Flu. Yellow", "Tr. Flu. Red", "Gun metallic", "Red flip/flop", "Yellow flip/flop", "Silver flip/flop", "Curry", "Fire Yellow", "Flame yellowish orange", "Flame reddish orange", "Royal blue", "Dark Royal blue", "Bright reddish lilac", "Lemon metalic", "Dark Curry", "Faded green", "Turquoise", "Light Royal blue", "Medium Royal blue", "Rust", "Reddish lilac", "Lilac", "Light lilac", "Bright purple", "Light purple", "Light pink", "Light brick yellow", "Warm yellowish orange", "Dove blue", "Medium lilac"],
	numList: { "1": "White", "2": "Grey", "3": "Light yellow", "5": "Brick yellow", "6": "Light green (Mint)", "9": "Light reddish violet", "11": "Pastel Blue", "12": "Light orange brown", "18": "Nougat", "21": "Bright red", "22": "Med. reddish violet", "23": "Bright blue", "24": "Bright yellow", "25": "Earth orange", "26": "Black", "27": "Dark grey", "28": "Dark green", "29": "Medium green", "36": "Lig. Yellowich orange", "37": "Bright green", "38": "Dark orange", "39": "Light bluish violet", "40": "Transparent", "41": "Tr. Red", "42": "Tr. Lg blue", "43": "Tr. Blue", "44": "Tr. Yellow", "45": "Light blue", "47": "Tr. Flu. Reddish orange", "48": "Tr. Green", "49": "Tr. Flu. Green", "50": "Phosph. White", "100": "Light red", "101": "Medium red", "102": "Medium blue", "103": "Light grey", "104": "Bright violet", "105": "Br. yellowish orange", "106": "Bright orange", "107": "Bright bluish green", "108": "Earth yellow", "110": "Bright bluish violet", "111": "Tr. Brown", "112": "Medium bluish violet", "113": "Tr. Medi. reddish violet", "115": "Med. yellowish green", "116": "Med. bluish green", "118": "Light bluish green", "119": "Br. yellowish green", "120": "Lig. yellowish green", "121": "Med. yellowish orange", "123": "Br. reddish orange", "124": "Bright reddish violet", "125": "Light orange", "126": "Tr. Bright bluish violet", "127": "Gold", "128": "Dark nougat", "131": "Silver", "134": "Neon green", "135": "Sand blue", "136": "Sand violet", "137": "Medium orange", "138": "Sand yellow", "140": "Earth blue", "141": "Earth green", "143": "Tr. Flu. Blue", "145": "Sand blue metallic", "146": "Sand violet metallic", "147": "Sand yellow metallic", "148": "Dark grey metallic", "149": "Black metallic", "150": "Light grey metallic", "151": "Sand green", "153": "Sand red", "154": "Dark red", "157": "Tr. Flu. Yellow", "158": "Tr. Flu. Red", "168": "Gun metallic", "176": "Red flip/flop", "178": "Yellow flip/flop", "179": "Silver flip/flop", "180": "Curry", "190": "Fire Yellow", "191": "Flame yellowish orange", "192": "Reddish brown", "193": "Flame reddish orange", "194": "Medium stone grey", "195": "Royal blue", "196": "Dark Royal blue", "198": "Bright reddish lilac", "199": "Dark stone grey", "200": "Lemon metalic", "208": "Light stone grey", "209": "Dark Curry", "210": "Faded green", "211": "Turquoise", "212": "Light Royal blue", "213": "Medium Royal blue", "216": "Rust", "217": "Brown", "218": "Reddish lilac", "219": "Lilac", "220": "Light lilac", "221": "Bright purple", "222": "Light purple", "223": "Light pink", "224": "Light brick yellow", "225": "Warm yellowish orange", "226": "Cool yellow", "232": "Dove blue", "268": "Medium lilac", "1001": "Institutional white", "1002": "Mid gray", "1003": "Really black", "1004": "Really red", "1005": "Neon orange", "1006": "Alder", "1007": "Dusty Rose", "1008": "Olive", "1009": "New Yeller", "1010": "Really blue", "1011": "Navy blue", "1012": "Deep blue", "1013": "Cyan", "1014": "CGA brown", "1015": "Magenta", "1016": "Pink", "1017": "Deep orange", "1018": "Teal", "1019": "Toothpaste", "1020": "Lime green", "1021": "Camo", "1022": "Grime", "1023": "Lavender", "1024": "Pastel light blue", "1025": "Pastel orange", "1026": "Pastel violet", "1027": "Pastel blue-green", "1028": "Pastel green", "1029": "Pastel yellow", "1030": "Pastel brown", "1031": "Royal purple", "1032": "Hot pink" },
	create: function (name) { name = tostring(name).autoCorrect(this.list) || "Medium stone grey"; var col = this.colors[name]; return { name: name, r: col.r, g: col.g, b: col.b, number: col.number }; },
	fromRGB: function (r, g, b) { r = toNumber(r); g = toNumber(g); b = toNumber(b); var closest = this.new(); var getDif = function (c) { return (math.max(c.r, r) - math.min(c.r, r)) + (math.max(c.g, g) - math.min(c.g, g)) + (math.max(c.b, b) - math.min(c.b, b)) }; for (var n in this.colors) { var o = this.colors[n]; var d = getDif(o); if (d == 0) { return o; } else if (d < getDif(closest)) { closest = o; } } return closest; },
	new: function (c, g, b) { var cs = tostring(c); if (cs.charAt(0) == "#") { c = hex.toRGB(c); return brickColor.new(c.r, c.g, c.b); } else if (typeof (c) == "object" && c.name) { return this.create(c.name); } else if (g != _ && b != _) { return this.create(this.numList[this.fromRGB(c, g, b).number]); } else if (cs.startsWith("rgb")) { var s = cs.split(","); return brickColor.new(round(s[0]), s[1], s[2]); } else if (toNumber(c) > 0) { return this.create(this.numList[round(c)] || "Medium stone grey"); } return this.create(c); },
	palette: function (n) { return this.create(this.smallList[math.bound(round(n), 0, this.smallList.length)]); },
	css: function (c, g, b) { c = this.new(c, b, g); return "rgb(" + c.r + "," + c.g + "," + c.b + ")"; }
};



users = {
	thumbnail: Roblox.thumbnails.getUserAvatarThumbnailUrl,
	toBC: function (i) {
		var list = ["NBC", "BC", "TBC", "OBC"];
		if (type(i) == "string") {
			i = i.toLowerCase();
			if (i.length < 4) {
				return i.autoCorrect(list) || "NBC";
			} else if (i.indexOf("turbo") >= 0) {
				return "TBC";
			} else if (i.indexOf("outrageous") >= 0) {
				return "OBC";
			} else if (i.indexOf("builders") >= 0) {
				return "BC";
			}
			var type2 = {
				"/4fc3a98692c7ea4d17207f1630885f68.png": "BC",
				"/461fe35725f9db0ece395301b7282df6.png": "BC",
				"/c8b53df0f5950ac4c2eb1af580b3236d.png": "TBC",
				"/c0eb8be1211d24fd1efdd36379423797.png": "TBC",
				"/693399abeaa6eebdc9f45aebc2b36bd8.png": "OBC",
				"/c208e0d81a53a19d3612d8078a3595e7.png": "OBC"
			};
			for (var n in type2) {
				if (i.indexOf(n) >= 0) {
					return type2[n];
				}
			}
			return "NBC";
		}
		return list[Math.min(pround(i), 3)];
	},

	currentId: function (callBack) {
		Roblox.users.getCurrentUserId().then(function (id) {
			callBack(id);
		}, function () {
			callBack(0);
		});
	},
	current: request.backgroundFunction("users.current", compact(function (callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var ret = { success: true, "username": "", "id": 0, "robux": 0, "messages": { "read": 0, "unread": 0, "total": 0 }, "friendRequests": 0, "bc": "NBC" };
		if (users.current.cache.get("json")) {
			callBack(users.current.cache.get("json"));
			return;
		}
		var cb = function (s) {
			if (ret.success = s) {
				if (ret.id) {
					users.getByUsername.cache.set(ret.username.toLowerCase(), ret.id);
				}
				users.current.cache.set("id", ret.id);
				users.current.cache.set("json", ret);
			} else {
				ret.id = 0;
			}
			callBack(ret);
		};
		$.get("https://www.roblox.com/messages/api/get-messages?messageTab=0&pageSize=1").success(function (r) {
			if (type(r) != "object") { cb(true); return; }
			$.get("https://api.roblox.com/incoming-items/counts").success(function (counts) {
				ret.messages.unread = counts.unreadMessageCount;
				ret.friendRequests = counts.friendRequestsCount;
				ret.messages.total = Math.max(round(r.TotalCollectionSize), ret.messages.unread);
				var o = r.Collection[0];
				if (o) {
					users.current.cache.set("id", ret.id = o.Recipient.UserId);
					ret.username = o.Recipient.UserName;
					ret.thumbnail = o.RecipientThumbnail.Url || users.thumbnail(ret.id, 3);
					$.get("https://api.roblox.com/currency/balance").success(function (r) {
						ret.robux = r.robux;
						cb(true);
					}).fail(function () {
						cb(false);
					});
				} else {
					$.get("https://www.roblox.com/mobileapi/userinfo").success(function (r) {
						users.current.cache.set("id", ret.id = r.UserID);
						ret.username = r.UserName;
						ret.robux = r.RobuxBalance;
						ret.thumbnail = r.ThumbnailUrl;
						if (r.IsAnyBuildersClubMember) {
							user.bc(ret.username, function (b) {
								ret.bc = b;
								cb(true);
							});
						} else {
							cb(true);
						}
					}).fail(function () {
						cb(false);
					});
				}
			}).fail(function () {
				cb(false);
			});
		}).fail(function () {
			cb(false);
		});
	})),
	getById: request.backgroundFunction("users.getById", compact(function (a, callBack) {
		Roblox.users.getByUserId(pround(a)).then(function (user) {
			callBack({
				id: user.id,
				username: user.username,
				bc: user.bc,
				success: true
			});
		}, function () {
			callBack({
				id: 0,
				username: "",
				bc: "NBC",
				success: false
			});
		});
	}, {
		queue: true
	})),
	getByUsername: request.backgroundFunction("users.getByUsername", compact(function (a, callBack) {
		var template = {
			id: 0,
			username: "",
			bc: "NBC",
			success: true
		};
		if (typeof (a) != "string") {
			callBack(template);
		}

		Roblox.users.getByUsername(a).then(function (user) {
			template.id = user.id;
			template.username = user.username;
			template.bc = user.bc;
			callBack(template);
		}, function () {
			template.success = false;
			callBack(template);
		});
	}, {
		queue: true
	})),

	inventory: (function () {
		var collectibleUserAssetTypeIds = [8, 18, 19, 41, 42, 43, 44, 45, 46, 47];

		var inventoryPages = compact.cache(60 * 1000);
		function loadInventoryPage(userId, assetTypeId, cursor, callBack) {
			var cacheKey = userId + "_" + assetTypeId + "_" + cursor;
			var cachedPage = inventoryPages.get(cacheKey);
			if (cachedPage) {
				callBack(cachedPage);
				return;
			}
			$.get("https://inventory.roblox.com/v1/users/" + userId + "/assets/collectibles?limit=100&sortOrder=Asc", { assetType: assetTypeId, cursor: cursor }).done(function (r) {
				inventoryPages.set(cacheKey, r);
				callBack(r);
			}).fail(function (e) {
				console.error(e);
				callBack({ data: [] });
			});
		}

		function loadInventoryAssetType(userId, assetTypeId, callBack, cursor) {
			var userAssets = [];
			loadInventoryPage(userId, assetTypeId, cursor, function (data) {
				data.data.forEach(function (ua) {
					userAssets.push({
						id: ua.assetId,
						name: ua.name,
						image: Roblox.thumbnails.getAssetThumbnailUrl(ua.assetId, 4),
						serial: pround(ua.serialNumber),
						stock: pround(ua.assetStock),
						rap: pround(ua.recentAveragePrice),
						originalPrice: pround(ua.originalPrice),
						userAssetId: ua.userAssetId,
						bc: users.toBC(ua.buildersClubMembershipType)
					});
				});
				if (data.nextPageCursor) {
					loadInventoryAssetType(userId, assetTypeId, function (moreUserAssets) {
						callBack(userAssets.concat(moreUserAssets));
					}, data.nextPageCursor);
				} else {
					callBack(userAssets);
				}
			});
		}


		return request.backgroundFunction("users.inventory", compact(function (arg, callBack) {
			if (typeof (callBack) != "function") {
				console.warn("callBack not function!");
				return;
			}

			var start = pnow();
			var ret = {
				id: 0,
				username: "",
				bc: "NBC",
				data: {},
				load: { hat: 0, gear: 0, face: 0, total: 0 },
				count: { hat: 0, gear: 0, face: 0, total: 0 },
				rap: 0,
				speed: 0,
				success: true
			};
			var uaid = {};

			if (typeof (arg) != "number" && typeof (aarg) != "string") {
				callBack(ret);
				return;
			}

			var doneLoading = [];
			function cb(assetTypeId) {
				doneLoading.push(assetTypeId);
				ret.load.gear = doneLoading.indexOf(19) >= 0 ? 100 : 0;
				ret.load.face = doneLoading.indexOf(18) >= 0 ? 100 : 0;
				var hats = doneLoading.length - (ret.load.gear ? 1 : 0) - (ret.load.face ? 1 : 0);
				ret.load.hat = Math.floor((hats / (collectibleUserAssetTypeIds.length - 2)) * 100);
				callBack(ret, true);
				ret.load.total = Math.floor((doneLoading.length / collectibleUserAssetTypeIds.length) * 100);
				if (doneLoading.length == collectibleUserAssetTypeIds.length) {
					ret.speed = pnow() - start;
					callBack(ret);
				}
			}

			function startLoading(userId) {
				collectibleUserAssetTypeIds.forEach(function (assetTypeId) {
					var assetType = assetTypeId == 18 ? "face" : (assetTypeId == 19 ? "gear" : "hat");
					loadInventoryAssetType(userId, assetTypeId, function (userAssets) {
						userAssets.forEach(function (ua) {
							ret.data[ua.id] = ret.data[ua.id] || {
								id: ua.id,
								name: ua.name,
								bc: ua.bc,
								type: assetType,
								originalPrice: ua.originalPrice,
								rap: ua.rap,
								stock: ua.stock,
								image: ua.image,
								userAssetId: {}
							};
							ret.data[ua.id].userAssetId[ua.userAssetId] = ua.serial;
							if (!uaid.hasOwnProperty(ua.userAssetId)) {
								ret.rap += ua.rap;
								ret.count[assetType]++;
								ret.count.total++;
								uaid[ua.userAssetId] = assetTypeId;
							}
						});
						cb(assetTypeId);
					}, "");
				});
			}

			users["getBy" + (typeof (arg) == "string" ? "Username" : "Id")](arg, function (u) {
				ret.success = u.success, ret.username = u.username, ret.bc = u.bc;
				if (ret.id = u.id) {
					if (users.inventory.cache.get(u.id)) {
						callBack(users.inventory.cache.get(u.id));
						return;
					}
					startLoading(u.id);
				} else {
					ret.load = { hat: 100, gear: 100, face: 100, total: 100 };
					callBack(ret);
				}
			});
		}, {
			multi: true,
			queue: true
		}));
	})()
};



catalog = {
	wearableAssetTypeIds: [2, 8, 11, 12, 17, 18, 19, 25, 26, 27, 28, 29, 30, 31, 41, 42, 43, 44, 45, 46, 47],
	assetOrder: ["Head", "Face", "Gear", "Hat", "T-Shirt", "Shirt", "Pants", "Decal", "Model", "Plugin", "Animation", "Place", "Game Pass", "Audio", "Badge", "Left Arm", "Right Arm", "Left Leg", "Right Leg", "Torso", "Package"],
	genre: { "All": 1, "Scary": 11, "Building": 19, "Horror": 11, "Town and City": 7, "Military": 17, "Comedy": 15, "Medieval": 8, "Adventure": 13, "Sci-Fi": 9, "Naval": 12, "FPS": 20, "RPG": 21, "Sports": 14, "Fighting": 10, "Western": 16 },

	calculateRAP: function (r, p) {
		r = Number(r) || 0, p = Number(p) || 0;
		if (!p) {
			return 0;
		} else if (!r || r == p) {
			return p;
		}
		return (r > p ? Math.floor : Math.ceil)((r * .9) + (p * .1));
	},
	afterTax: function (p) { return round(p - round(p * .3)); },

	info: request.backgroundFunction("catalog.info", compact(function (id, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}

		var ret = {
			assetType: "",
			assetTypeId: 0,
			bc: "NBC",
			created: 0,
			creator: { id: 0, name: "", creatorType: "" },
			description: "",
			editable: false,
			free: false,
			id: type(id) == "number" ? id : 0,
			limited: false,
			limitedUnique: false,
			lowestPrice: 0,
			name: "",
			"new": false,
			offsale: {},
			onsale: {},
			owner: false,
			privateSellers: [],
			productId: 0,
			rap: 0,
			remaining: 0,
			robuxPrice: 0,
			sales: 0,
			sound: "",
			speed: 0,
			success: true,
			thumbnail: "",
			timer: 0,
			wearing: false
		};
		ret.url = ret.id >= 1818 ? "https://www.roblox.com/item.aspx?id=" + ret.id : "";

		if (!ret.url) {
			callBack(ret);
			return;
		}

		var mcb = 1;
		var dcb = 0;
		var startTime = pnow();
		var fcb = function () {
			if (++dcb == mcb) {
				ret.speed = pnow() - startTime;
				callBack(ret);
			}
		};

		$.get("https://api.roblox.com/marketplace/productinfo?assetId=" + ret.id).done(function (r) {
			mcb++;

			ret.assetType = Roblox.catalog.assetTypes[ret.assetTypeId = r.AssetTypeId];
			ret.bc = users.toBC(r.MinimumMembershipLevel);
			ret.created = new Date(r.Created).getTime();
			ret.creator = {
				id: r.Creator.Id,
				name: r.Creator.Name,
				creatorType: r.Creator.CreatorType
			};
			ret.description = r.Description;
			ret.free = r.IsPublicDomain;
			ret.name = string.clean(r.Name);
			ret['new'] = r.IsNew;
			ret.productId = r.ProductId || 0;
			ret.remaining = Number(r.Remaining) || 0;
			ret.robuxPrice = Number(r.PriceInRobux) || 0;
			ret.sales = Number(r.Sales) || 0;
			ret.thumbnail = Roblox.thumbnails.getAssetThumbnailUrl(ret.id, 4);

			ret.url = "https://www.roblox.com/catalog/" + ret.id + "/" + (ret.name.replace(/\W+/g, "-").replace(/^-/, "").replace(/-$/, ""));

			if (ret.limited = r.IsLimited || (ret.limitedUnique = r.IsLimitedUnique)) {
				mcb += 2;
				catalog.limiteds(function (limiteds) {
					var lim = limiteds[ret.id];
					if (lim) {
						ret.rap = lim.rap;
					}
					fcb();
				});
				$.get("https://www.roblox.com/asset/resellers?maxRows=6&startIndex=0&productId=" + ret.productId).success(function (r) {
					(r.data && r.data.Resellers || []).forEach(function (seller) {
						if (!ret.lowestPrice) {
							ret.lowestPrice = seller.Price;
						}
						ret.privateSellers.push({
							price: seller.Price,
							seller: {
								id: seller.SellerId,
								username: seller.SellerName
							},
							userAssetId: seller.UserAssetId,
							serial: Number(seller.SerialNumber) || 0
						});
					});
				}).always(fcb);
			}
			if (ret.assetTypeId == 3 || ret.limited) {
				mcb++;
				$.get(ret.url).done(function (r) {
					ret.sound = (r.match(/data-mediathumb-url="(https:\/\/c\d\.rbxcdn\.com\/\w+)"/i) || ["", ""])[1];
					r = $._(r);
					r.find("#sell-modal-content .serial-dropdown>option").each(function () {
						ret.offsale[Number($(this).val())] = Number($(this).text().replace(/\D+/g, "")) || 0;
					});
					r.find("#take-off-sale-modal-content .serial-dropdown>option").each(function () {
						ret.onsale[Number($(this).val())] = Number($(this).text().replace(/\D+/g, "")) || 0;
					});
					ret.owner = (Object.keys(ret.onsale).length + Object.keys(ret.offsale).length) > 0;
					fcb();
				}).fail(function () {
					ret.success = false;
					fcb();
				});
			}
			users.currentId(function (cid) {
				if (cid) {
					if (ret.creator.id != 1) {
						mcb++;
						$.get("https://api.roblox.com/users/" + cid + "/canmanage/" + ret.id).success(function (r) {
							ret.editable = r.CanManage;
						}).always(fcb);
					}
					if (catalog.wearableAssetTypeIds.indexOf(ret.assetTypeId) >= 0) {
						mcb++;
						outfit.getAssetIds(cid, function (ids) {
							if (ids) {
								ret.wearing = ids.indexOf(ret.id) >= 0;
							}
							fcb();
						});
						if (!ret.limited) {
							catalog.hasAsset(ret.id, function (isOwner) {
								ret.owner = isOwner;
								fcb();
							});
						} else {
							fcb();
						}
					} else {
						fcb();
					}
				} else {
					fcb();
				}
			});
		}).fail(function () {
			ret.success = false;
		}).always(fcb);
	}, {
		queue: true
	})),
	purchase: request.backgroundFunction("catalog.purchase", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		} else if (type(arg.seller) != "number" || type(arg.productId) != "number" || type(arg.price) != "number") {
			callBack(false);
			return;
		}

		var speed = pnow();
		var fallback = function () {
			$.ajax({
				url: "https://www.roblox.com/API/Item.ashx?rqtype=purchase&expectedSellerID=" + arg.seller + "&productID=" + arg.productId + "&expectedCurrency=1&expectedPrice=" + arg.price + (type(arg.promotion) == "number" ? "&expectedPromoID=" + arg.promotion : "") + (type(arg.userAssetId) == "number" ? "&userAssetID=" + arg.userAssetId : ""),
				type: "POST",
				data: ""
			}).always(function (r) {
				if (r.status == 403) {
					if (arg.token = r.getResponseHeader("x-csrf-token")) {
						fallback();
					} else {
						callBack(0);
					}
				} else {
					callBack(!r.errorMsg && r.AssetID ? pnow() - speed : 0);
				}
			});
		};

		if (type(arg.commission) == "number" && arg.price >= 8) {
			users.currentId(function (id) {
				if (!id) { callBack(0); return; }
				$.get("https://www.roblox.com/presence/users?userIds=" + id).success(function (r) {
					if (r[0] && r[0].UserPresenceType != 2) {
						var tries = 0;
						var retry; retry = function () {
							if (tries++ < 30) {
								$.get("https://www.roblox.com/Game/PlaceLauncher.ashx?request=RequestGame&placeId=" + arg.commission).success(function (r) {
									if (r.joinScriptUrl) {
										$.get(r.joinScriptUrl).success(function (r) {
											r = JSON.parse(r.substring(r.indexOf("{")));
											if (r.PingUrl) {
												$.get(r.PingUrl).success(function () {
													var temp = pnow() - speed;
													$.ajax({
														url: "https://api.roblox.com/marketplace/purchase?productId=" + arg.productId + "&currencyTypeId=1&purchasePrice=" + arg.price + "&locationType=Game&locationId=" + arg.commission,
														type: "POST",
														data: "RobloxPurchaseRequest",
														headers: {
															"Roblox-Place-Id": tostring(arg.commission),
															"Roblox-Game-Id": tostring(r.GameId),
															"Roblox-Session-Id": tostring(r.SessionId)
														}
													}).success(function (r) {
														if (r.success || r.status == "AlreadyOwned") {
															callBack(temp);
														} else {
															fallback();
														}
													}).fail(fallback);
												}).fail(fallback);
											} else {
												fallback();
											}
										}).fail(fallback);
									} else {
										setTimeout(retry, 250);
									}
								}).fail(retry);
							} else {
								fallback();
							}
						};
						retry();
					} else {
						fallback();
					}
				}).fail(fallback);
			});
		} else {
			fallback();
		}
	})),
	update: request.backgroundFunction("catalog.update", function (arg, callBack) {
		if (type(arg) != "object" || typeof(arg.id) != "number" || typeof (callBack) != "function") {
			console.warn("callBack not function! (maybe)");
			return;
		}

		$.get("https://www.roblox.com/My/Item.aspx?ID=" + arg.id).success(function (r) {
			r = $._(r);
			if (r.find("#EditItem").length) {
				arg.robux = round(type(arg.robux) == "number" ? arg.robux : r.find("#ctl00_cphRoblox_RobuxPrice").val()) || 0;
				arg.genre = type(arg.genre) == "number" ? arg.genre : r.find("#ctl00_cphRoblox_actualGenreSelection").val();
				var data = {
					"ctl00$cphRoblox$NameTextBox": type(arg.name) == "string" && arg.name ? arg.name : r.find("#ctl00_cphRoblox_NameTextBox").val(),
					"ctl00$cphRoblox$DescriptionTextBox": type(arg.description) == "string" ? arg.description : r.find("#ctl00_cphRoblox_DescriptionTextBox").val(),
					"ctl00$cphRoblox$SellThisItemCheckBox": (arg.hasOwnProperty("free") && arg.free) || arg.robux > 0 ? "on" : "",
					"ctl00$cphRoblox$SellForRobux": arg.robux > 0 ? "on" : "",
					"ctl00$cphRoblox$RobuxPrice": arg.robux,
					"ctl00$cphRoblox$PublicDomainCheckBox": arg.hasOwnProperty("free") ? (arg.free ? "on" : "") : (r.find("#ctl00_cphRoblox_PublicDomainCheckBox").prop("checked") ? "on" : ""),
					"GenreButtons2": arg.genre,
					"ctl00$cphRoblox$actualGenreSelection": arg.genre,
					"ctl00$cphRoblox$EnableCommentsCheckBox": arg.hasOwnProperty("comments") ? (arg.comments ? "on" : "") : (r.find("#ctl00_cphRoblox_EnableCommentsCheckBox").prop("checked") ? "on" : ""),
					__EVENTTARGET: "ctl00$cphRoblox$SubmitButtonBottom",
					__PREVIOUSPAGE: r.find("#__PREVIOUSPAGE").val(),
					__EVENTVALIDATION: r.find("#__EVENTVALIDATION").val(),
					__VIEWSTATEGENERATOR: r.find("#__VIEWSTATEGENERATOR").val(),
					__VIEWSTATE: r.find("#__VIEWSTATE").val()
				};
				for (var n in data) { if (!r.find("*[name='" + n + "']").length) { delete data[n]; } };
				$.post("https://www.roblox.com/My/Item.aspx?ID=" + arg.id, data, function (r, s) { delete catalog.info.cache.remove(arg.id); callBack(s == "success"); });
			} else {
				callBack(false);
			}
		}).fail(function () {
			callBack(false);
		});
	}),

	hasAsset: request.backgroundFunction("catalog.hasAsset", compact(function (assetId, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}

		Roblox.users.getCurrentUserId().then(function (userId) {
			Roblox.inventory.userHasAsset(userId, assetId).then(function (hasAsset) {
				// TODO: stop this triple caching madness...
				var key = userId + "_" + assetId;
				catalog.hasAsset.confirm[key] = hasAsset;
				catalog.hasAsset.cache.set(key, hasAsset);
				callBack(hasAsset);
			}, function () {
				callBack(false);
			});
		}, function () {
			callBack(false);
		});
	}, {
		queue: true
	})),

	limiteds: request.backgroundFunction("catalog.limiteds", function (callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (catalog.limiteds.cache.data.hasOwnProperty("get")) {
			callBack(catalog.limiteds.cache.get("get"));
			return;
		}

		$.get("https://assetgame.roblox.com/asset/?id=317944503").success(function (r) {
			var ret = {};
			try {
				r = JSON.parse(decodeURIComponent((r.match(/\[\[([^\]]*)\]\]/) || ["", encodeURIComponent("{\"data\":[]}")])[1]));
				foreach(r.data, function (n, o) {
					ret[o.id] = {
						id: o.id,
						name: o.name,
						rap: o.rap,
						stock: o.stock
					};
				});
				catalog.limiteds.cache.set("get", ret);
			} catch (e) { }
			callBack(ret);
		}).fail(function () {
			callBack({});
		});
	})
};

catalog.limiteds.search = function (lims, phrase, exact) {
	phrase = phrase.toLowerCase();
	var possible = [];
	for (var n in lims) {
		var o = lims[n];
		var na = o.name.toLowerCase();
		if (phrase == na) {
			if (exact) {
				return [o];
			} else {
				possible.push(o);
			}
		} else if (na.indexOf(phrase) >= 0) {
			possible.push(o);
		} else {
			var ac = [];
			na.split(/\s+/).forEach(function (p) { p = p.replace(/\W+/g, ""); if (p) { ac.push(p.charAt(0)); } });
			if (ac.length && ac.join("") == phrase) {
				if (exact) {
					return [o];
				} else {
					possible.push(o);
				}
			} else if (ac.length && ac.join("").indexOf(phrase) >= 0) {
				possible.push(o);
			}
		}
	}
	return possible;
};

catalog.info.parse = function (hold) {
	hold = $._(hold);
	hold.find("#item-details-description>span").remove();
	var creator = hold.find(".item-name-container>div>span.text-label>a.text-name");

	var ret = {
		assetType: hold.find("#item-container").data("asset-type"),
		assetTypeId: 0,
		bc: users.toBC(hold.find("#item-container").data("bc-requirement")),
		creator: { id: Roblox.users.getIdFromUrl(creator.attr("href")), name: creator.text(), creatorType: creator.attr("href").indexOf("/users/") >= 0 ? "User" : "Group" },
		description: hold.find("#item-details-description").text().trim(),
		editable: false,
		free: hold.find(".text-robux-lg").text() == "Free",
		id: Number((hold.find("link[rel='canonical']").attr("href").match(/\/catalog\/(\d+)\//) || ["", 0])[1]),
		limited: hold.find("#AssetThumbnail .icon-limited-unique-label, #AssetThumbnail .icon-limited-label").length > 0,
		limitedUnique: hold.find("#AssetThumbnail .icon-limited-unique-label").length > 0,
		name: hold.find("#item-container").data("item-name"),
		"new": hold.find(".asset-status-icon.status-New").length > 0,
		offsale: {},
		onsale: {},
		owner: hold.find(".item-name-container>div>.label-checkmark").length > 0,
		productId: Number(hold.find(".PurchaseButton[data-product-id]").data("product-id")) || 0,
		robuxPrice: Number(hold.find(".icon-robux-price-container .text-robux-lg").text().replace(/\D+/g, "")) || 0,
		sound: (hold.html().match(/data-mediathumb-url="(https:\/\/c\d\.rbxcdn\.com\/\w+)"/i) || ["", ""])[1],
		thumbnail: hold.find("#AssetThumbnail>.thumbnail-span>img").attr("src"),
		url: hold.find("link[rel='canonical']").attr("href"),
		wearing: hold.find(".toggle-wear").text().trim() == "Wear"
	};
	ret.assetType = ret.assetType.replace("Accessory", " Accessory");

	ret.assetTypeId = Number(array.flip(Roblox.catalog.assetTypes)[ret.assetType]) || 0;
	hold.find("#sell-modal-content .serial-dropdown>option").each(function () {
		ret.offsale[Number($(this).val())] = Number($(this).text().replace(/\D+/g, "")) || 0;
	});
	hold.find("#take-off-sale-modal-content .serial-dropdown>option").each(function () {
		ret.onsale[Number($(this).val())] = Number($(this).text().replace(/\D+/g, "")) || 0;
	});

	return ret;
};



tradeSystem = {
	get: request.backgroundFunction("tradeSystem.get", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var ret = {
			type: type(arg.type) == "string" ? arg.type : "inbound",
			data: [],
			total: 0,
			page: type(arg.page) == "number" ? arg.page : 1,
			totalPages: 0,
			success: true
		};
		users.currentId(function (id) {
			if (id) {
				var key = id + "_" + ret.type + "_" + ret.page;
				if (tradeSystem.get.cache.get(key) && arg.cache !== false) { callBack(tradeSystem.get.cache.get(key)); return; }
				$.ajax({
					url: "https://www.roblox.com/My/Money.aspx/GetMyItemTrades",
					type: "POST",
					data: JSON.stringify({ startindex: 20 * (ret.page - 1), statustype: ret.type }),
					contentType: "application/json"
				}).success(function (r) {
					r = JSON.parse(r.d);
					ret.total = Number(r.totalCount) || 0;
					ret.totalPages = Math.ceil(ret.total / 20);
					foreach(r.Data, function (n, o) {
						o = JSON.parse(o);
						ret.data.push({
							id: Number(o.TradeSessionID),
							sent: new Date(o.Date).getTime(),
							expires: new Date(o.Expires).getTime(),
							status: o.Status,
							partner: {
								id: Number(o.TradePartnerID) || 0,
								usernmae: o.TradePartner
							}
						});
					});
					tradeSystem.get.cache.set(key, ret);
					callBack(ret);
				}).fail(function () {
					ret.success = false;
					callBack(ret);
				});
			} else {
				callBack(ret);
			}
		});
	}))
};



outfit = {
	get: request.backgroundFunction("outfit.get", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var ret = {
			id: 0,
			username: "",
			hats: []
		};
		foreach({ shirt: 0, pants: 0, face: 0, head: 1, leftLeg: 1, rightLeg: 1, leftArm: 1, rightArm: 1, tshirt: 0, torso: 1, gear: 0 }, function (n, o) {
			ret[n] = {
				id: 0,
				name: "",
				thumbnail: "",
				url: ""
			};
			if (o) {
				ret[n].color = "";
			}
		});
		users[type(arg) == "string" ? "getByUsername" : "getById"](arg, function (u) {
			ret.username = u.username;
			if (ret.id = u.id) {
				$.get("https://assetgame.roblox.com/Asset/AvatarAccoutrements.ashx?userId=" + u.id).success(function (r) {
					r = r.split(";");
					var mcb = r.length;
					var dcb = 0;
					var cb = function (s) { if (++dcb == mcb) { callBack(ret); } };
					$.get(r.shift()).success(function (r) {
						foreach({
							"LeftArmColor": "leftArm",
							"RightArmColor": "rightArm",
							"LeftLegColor": "leftLeg",
							"RightLegColor": "rightLeg",
							"TorsoColor": "torso",
							"HeadColor": "head"
						}, function (n, o) {
							ret[o].color = brickColor.new((r.match((n + "\">(\\\d+)").regex("i")) || ["", ""])[1]).name;
						});
					}).always(cb);
					for (var n in r) {
						catalog.info(Number(url.param("id", r[n])) || 0, function (info) {
							var push = {};
							info.assetType = ({ "right leg": "rightLeg", "left leg": "leftLeg", "right arm": "rightArm", "left arm": "leftArm" })[info.assetType.lower()] || info.assetType.lower();
							foreach(["id", "name", "thumbnail", "url"], function (n, o) { push[o] = info[o]; });
							if (info.assetType == "hat") {
								ret.hats.push(push);
							} else {
								ret[info.assetType] = push;
							}
							cb();
						});
					}
				}).fail(function () {
					callBack(ret);
				});
			} else {
				callBack(ret);
			}
		});
	}, {
		queue: true
	})),
	getAssetIds: request.backgroundFunction("outfit.getAssetIds", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (type(arg) != "number") {
			callBack();
			return;
		} else if (outfit.getAssetIds.cache.get(arg)) {
			callBack(outfit.getAssetIds.cache.get(arg));
			return;
		}
		$.get("https://assetgame.roblox.com/Asset/AvatarAccoutrements.ashx?userId=" + arg).success(function (r) {
			var ret = [];
			(r.match(/\?id=\d+/g) || []).forEach(function (id) {
				ret.push(Number(id.substring(4)));
			});
			outfit.getAssetIds.cache.set(arg, ret);
			callBack(ret);
		}).fail(function () {
			callBack();
		});
	})),
	bodyColor: request.backgroundFunction("outfit.bodyColor", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (type(arg) != "object" || type(arg.part) != "string" || !arg.hasOwnProperty("color")) { callBack(false); return; }
		$.get("https://avatar.roblox.com/v1/avatar").done(function (r) {
			r.bodyColors[arg.part + "ColorId"] = brickColor.new(arg.color).number;
			$.post("https://avatar.roblox.com/v1/avatar/set-body-colors", r.bodyColors).done(function (r) {
				callBack(r.success);
			}).fail(function () {
				callBack(false);
			});
		}).fail(function () {
			callBack(false);
		});
	}))
};


foreach({
	"sell": true,
	"takeoff": false
}, function (n, o) {
	catalog[n] = request.backgroundFunction("catalog." + n, compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var assetId = Number(arg.id) || 0;
		var userAssetId = Number(arg.userAssetId) || 0;
		if (assetId <= 0) {
			callBack(false);
			return;
		}
		$.post("https://www.roblox.com/asset/toggle-sale", {
			assetId: assetId,
			userAssetId: userAssetId,
			sell: o,
			price: Number(arg.price) || 0
		}).done(function (r) {
			callBack(r.isValid);
		}).fail(function () {
			callBack(false);
		});
	}));
});



friendService = {
	get: request.backgroundFunction("friendService.get", function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var ret = {
			id: type(arg) == "number" ? arg : 0,
			data: [],
			success: true
		};
		if (friendService.get.cache.get(ret.id)) { callBack(friendService.get.cache.get(ret.id)); }
		$.get("https://www.roblox.com/users/friends/list-json?pageSize=48103520&imgWidth=100&imgHeight=100&imgFormat=png&userId=" + (ret.id || "")).success(function (r) {
			for (var n in r.Friends || []) {
				var o = r.Friends[n];
				ret.data.push({
					id: o.UserId,
					username: o.Username,
					thumbnail: o.AvatarUri || users.thumbnail(o.UserId, 3),
					online: o.IsOnline,
					game: {
						id: Number(o.PlaceId) || 0,
						name: o.PlaceId ? o.LastLocation || "" : "",
						url: o.AbsolutePlaceURL || ""
					}
				});
			}
			friendService.get.cache.set(ret.id, ret);
			ret.id = r.UserId;
			friendService.get.cache.set(ret.id, ret);
			callBack(ret);
		}).fail(function () {
			ret.success = false;
			callBack(ret);
		})
	}),
	creatorFriends: request.backgroundFunction("friendService.creatorFriends", compact(function (callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (friendService.creatorFriends.cache) { callBack(friendService.creatorFriends.cache); return; }
		friendService.creatorFriends.cache = {
			48103520: "WebGL3D"
		};
		friendService.get(48103520, function (friends) {
			friends.data.forEach(function (friend) {
				friendService.creatorFriends.cache[friend.id] = friend.username;
			});
			callBack(friendService.creatorFriends.cache);
		});
	}))
};



gameService = {
	servers: request.backgroundFunction("gameService.servers", compact(function (placeId, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var ret = {
			id: type(placeId) == "number" && placeId > 0 ? placeId : 0,
			data: [],
			success: true
		};
		var got = {};
		if (!ret.id) {
			callBack(ret);
			return;
		}
		var load; load = function (page) {
			$.get("https://www.roblox.com/games/getgameinstancesjson?placeId=" + ret.id + "&startindex=" + ((page - 1) * 10)).success(function (r) {
				ret.loading = [];
				for (var n in r.Collection) {
					var o = r.Collection[n];
					var server = {
						id: o.Guid,
						players: [],
						ping: o.Ping,
						fps: o.Fps,
						slow: o.ShowSlowGameMessage,
						joinable: o.UserCanJoin,
						capacity: o.Capacity
					};
					if (got[server.id]) { continue; }
					for (var n in o.CurrentPlayers) {
						server.players.push({
							id: o.CurrentPlayers[n].Id,
							username: o.CurrentPlayers[n].Username,
							thumbnail: o.CurrentPlayers[n].Thumbnail.Url
						});
					}
					got[server.id] = server;
					ret.loading.push(server);
					ret.data.push(server);
				}
				callBack(ret, true);
				if (page >= Math.ceil(r.TotalCollectionSize / 10)) {
					delete ret.loading;
					callBack(ret);
				} else {
					load(page + 1);
				}
			}).fail(function () {
				ret.success = false;
				ret.data = [];
				ret.loaded = true;
				callBack(ret);
			});
		};
		load(1);
	}, { multi: true })),

	li: function (placeId, o) {
		var ret = $("<li class=\"section-content rbx-game-server-item\">").attr("data-gameid", o.id).prepend($("<div class=\"section-left rbx-game-server-details\">").prepend(
			"<div class=\"rbx-game-status rbx-game-server-status\">" + o.players.length + " of " + o.capacity + " Players Max</div>"
			+ "<div class=\"rbx-game-server-alert" + (o.slow ? "" : " hidden") + "\"><span class=\"icon-remove\"></span>Slow Game</div>"
		).append(
			$("<a class=\"btn-full-width btn-control-xs rbx-game-server-join\" data-placeid=\"" + placeId + "\">Join</a>").click(function () {
				console.log("heyhey");
				Roblox.games.launch({
					placeId: placeId,
					serverId: o.id
				});
			})
		));
		var playerList = $("<div class=\"section-right rbx-game-server-players\">");
		foreach(o.players, function (n, o) { playerList.append($("<span class=\"avatar avatar-headshot-sm player-avatar\">").append($("<a class=\"avatar-card-link\" href=\"/users/" + o.id + "/profile\">").attr("title", o.username).append($("<img class=\"avatar-card-image\">").attr("src", o.thumbnail)))); });
		return ret.append(playerList);
	}
};



privateMessage = {
	action: request.backgroundFunction("privateMessage.action", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		arg.id = type(arg.id) == "array" ? arg.id : [arg.id];
		var data = [];
		for (var n in arg.id) { if (type(arg.id[n]) == "number" && arg.id[n] > 0) { data.push(arg.id[n]); } }
		if (type(arg.action) != "string") { callBack(false); return; } else if (!data.length) { callBack(true); return; }
		$.ajax({
			type: "POST",
			url: "https://www.roblox.com/messages/api/" + arg.action,
			data: JSON.stringify({ messageIds: data }),
			contentType: "application/json",
			done: function () {
				callBack(true);
			},
			fail: function () {
				callBack(false);
			}
		});
	}, {
		queue: true
	})),
	read: function (id, callBack) { return privateMessage.action({ id: id, action: "mark-messages-read" }, callBack); },
	unread: function (id, callBack) { return privateMessage.action({ id: id, action: "mark-messages-unread" }, callBack); },
	archive: function (id, callBack) { return privateMessage.action({ id: id, action: "archive-messages" }, callBack); },
	unarchive: function (id, callBack) { return privateMessage.action({ id: id, action: "unarchive-messages" }, callBack); },
	send: request.backgroundFunction("privateMessage.send", function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		arg.id = type(arg.id) == "number" ? [arg.id] : (type(arg.id) != "array" ? [] : arg.id);
		var data = {
			subject: type(arg.subject) == "string" ? arg.subject : "",
			body: type(arg.body) == "string" ? arg.body : ""
		};
		if (type(arg.reply) == "number") {
			data.replyMessageId = arg.reply;
			data.includePreviousMessage = !!arg.includePreviousMessage;
		}
		var sent = {};
		var failure = function () {
			for (var n in arg.id) {
				sent[arg.id[n]] = false;
			}
			callBack(sent);
		};
		if ((!data.replyMessageId && !data.subject) || !data.body) {
			failure();
			return;
		}
		var send; send = function () {
			data.recipientId = arg.id.shift();
			if (!data.recipientId) {
				callBack(sent);
				return;
			}
			$.ajax({
				type: "POST",
				url: "https://www.roblox.com/messages/api/send-message",
				data: JSON.stringify(data),
				contentType: "application/json",
				success: function (r) {
					sent[data.recipientId] = !!r.success;
					send();
				},
				fail: failure
			});
		};
		send();
	}),
	search: request.backgroundFunction("privateMessage.search", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var ret = {
			data: [],
			loaded: 100
		};
		arg.subject = type(arg.subject) == "string" ? arg.subject.toLowerCase() : "";
		arg.body = type(arg.body) == "string" ? arg.body.toLowerCase() : "";
		arg.sender = type(arg.sender) == "number" ? arg.sender : 0;
		privateMessage.box(arg.box = (arg.box ? arg.box.toLowerCase() : "inbox"), function (data) {
			var dat = [];
			for (var n in data.page) {
				var o = data.page[n];
				if ((!arg.subject || o.subject.toLowerCase().indexOf(arg.subject) >= 0) &&
					(!arg.body || o.body.toLowerCase().indexOf(arg.body) >= 0) &&
					(!arg.sender || o[arg.box == "sent" ? "recipient" : "sender"].id == arg.sender)
				) {
					dat.push(o);
				}
			}
			callBack({ data: ret.data = ret.data.concat(dat), page: dat, loaded: data.loaded }, data.loaded < 100);
		});
	}, {
		queue: true,
		multi: true
	})),
	get: request.backgroundFunction("privateMessage.get", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		arg.tab = ({ "inbox": 0, "sent": 1, "archive": 3 })[type(arg.tab) == "string" ? arg.tab.toLowerCase() : "inbox"] || 0;
		arg.results = type(arg.results) == "number" ? arg.results : 20;
		var ret = {
			data: [],
			tab: (["inbox", "sent", "notifications", "archive"])[arg.tab],
			tabId: arg.tab,
			page: type(arg.page) == "number" ? arg.page : 1,
			totalPages: 0,
			results: 0,
			success: true
		};
		users.currentId(function (id) {
			var k = id + "_" + ret.page + "_" + arg.results + "_" + arg.tab;
			if (!id) {
				callBack(ret);
				return;
			} else if (privateMessage.get.cache.get(k) && arg.cache !== false) {
				callBack(privateMessage.get.cache.get(k));
				return;
			}
			$.get("https://www.roblox.com/messages/api/get-messages?messageTab=" + arg.tab + "&pageNumber=" + (ret.page - 1) + "&pageSize=" + arg.results).success(function (r) {
				ret.totalPages = r.TotalPages;
				ret.results = r.TotalCollectionSize;
				for (var n in r.Collection) {
					var o = r.Collection[n];
					o = {
						id: o.Id,
						subject: o.Subject,
						body: o.Body.replace(/<br\s*\/>/g, "\n"),
						read: o.IsRead,
						system: o.IsSystemMessage,
						sent: new Date(o.Created.replace(/\|\s*/g, "")).getTime(),
						reportAbuse: o.IsReportAbuseDisplayed ? o.AbuseReportAbsoluteUrl : "",
						sender: {
							id: o.Sender.UserId,
							username: o.Sender.UserName,
							bc: users.toBC(o.Sender.BuildersClubStatus),
							thumbnail: o.SenderThumbnail.Url || users.thumbnail(o.Sender.UserId, 3)
						},
						recipient: {
							id: o.Recipient.UserId,
							username: o.Recipient.UserName,
							bc: users.toBC(o.Recipient.BuildersClubStatus),
							thumbnail: o.RecipientThumbnail.Url || users.thumbnal(o.Recipient.UserId, 3)
						}
					};
					var cache = privateMessage.search.cache.get(id + "_" + arg.tab) || {};
					cache[o.id] = o;
					privateMessage.search.cache.set(id + "_" + arg.tab, cache);
					ret.data.push(o);
				}
				privateMessage.get.cache.set(k, ret);
				callBack(ret);
			}).fail(function () {
				ret.success = false;
				callBack(ret);
			});
		});
	}, {
		queue: true
	})),
	box: request.backgroundFunction("privateMessage.box", compact(function (tab, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var data = [];
		var load; load = function (page) {
			privateMessage.get({ tab: tab, page: page }, function (pdata) {
				if (pdata.success) {
					callBack({ data: data = data.concat(pdata.data), page: pdata.data, loaded: (page / pdata.totalPages) * 100, pages: pdata.totalPages }, page < pdata.totalPages);
					if (page < pdata.totalPages) {
						load(page + 1);
					}
				} else {
					setTimeout(load, 1000, page);
				}
			});
		}
		users.currentId(function (id) {
			if (!id) {
				callBack({ data: [], loaded: 100 });
				return;
			}
			privateMessage.get({ tab: tab }, function (x) {
				var c = privateMessage.search.cache.get(id + "_" + x.tabId) || {};
				if (Object.keys(c).length != x.results) {
					load(1);
				} else {
					var page = [];
					for (var n in c) {
						data.unshift(c[n]);
						page.unshift(c[n]);
						if (page.length % 20 == 0) {
							callBack({
								data: data,
								page: page,
								loaded: (data.length - 1) / Object.keys(c).length,
								pages: Math.ceil(Object.keys(c).length / 20)
							}, true);
							page = [];
						}
					}
					callBack({
						data: data,
						page: page,
						pages: Math.ceil(data.length / 20),
						loaded: 100
					});
				}
			});
		});
	}, {
		queue: true,
		multi: true
	}))
};



forumService = {
	thread: request.backgroundFunction("forumService.thread", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (type(arg) == "number") { arg = { id: arg }; }
		var ret = {
			id: type(arg.id) == "number" ? arg.id : 0,
			subject: "",
			posts: [],
			page: type(arg.page) == "number" ? arg.page : 1,
			maxPage: 0,
			success: true
		};
		$.get("https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + ret.id + "&PageIndex=" + ret.page + (arg.hide ? "&rplus=hide" : "")).success(function (r) {
			ret.subject = (r = $._(r)).find("#ctl00_cphRoblox_PostView1_ctl00_PostTitle").text();
			ret.maxPage = Number((r.find("#ctl00_cphRoblox_PostView1_ctl00_Pager .normalTextSmallBold").text().match(/^Page\s*[\d,]+\s*of\s*([\d,]+)/i) || ["", "1"])[1].replace(/,/g, "")) || 1;
			r.find("#ctl00_cphRoblox_PostView1_ctl00_PostList .forum-post").each(function () {
				var poster = $(this).find("a.normalTextSmallBold[href*='/users/']");
				var pid = $(this).find(".normalTextSmaller>a[name]");
				var body = $(this).find(".normalTextSmall.linkify");
				ret.posts.push({
					id: Number(pid.attr("name")),
					poster: {
						id: Roblox.users.getIdFromUrl(poster.attr("href")),
						username: poster.text(),
						joined: new Date(($(this).text().match(/Joined:\s*(\d+\s*\w+\s*\d+)/) || ["", 0])[1]).getTime(),
						posts: Number(($(this).text().match(/Total\s*Posts:\s*(\d+)/) || ["", 0])[1]) || 0
					},
					body: body.html(body.html().replace(/<\s*br\s*>/g, "\n")).text(),
					posted: new Date(pid.parent().text()).getTime()
				});
			});
			callBack(ret);
		}).fail(function () {
			ret.success = false;
			callBack(ret);
		});
	}, {
		queue: true
	})),
	mine: request.backgroundFunction("forumService.mine", compact(function (callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (forumService.cache.get("mine")) { callBack(forumService.cache.get("mine")); return; }
		var ret = {
			userId: 0,
			username: "",
			tracked: [],
			recent: [],
			success: true
		};
		$.get("https://forum.roblox.com/Forum/User/MyForums.aspx").success(function (r) {
			ret.userId = Roblox.users.getIdFromUrl((r = $._(r)).find("#navigation .text-overflow").attr("href"));
			ret.username = r.find("#navigation .text-overflow").text();
			if (ret.userId) {
				r.find("#ctl00_cphRoblox_MyForums1_ctl00_ThreadTracking .forum-table-row").each(function () { ret.tracked.push(forumService.parseRow($(this))); });
				r.find("#ctl00_cphRoblox_MyForums1_ctl00_ParticipatedThreads .forum-table-row").each(function () { ret.recent.push(forumService.parseRow($(this))); });
			}
			callBack(ret);
		}).fail(function () {
			ret.success = false;
			callBack(ret);
		});
	})),
	parseRow: function (el) {
		var nts = el.find(".normalTextSmaller");
		var status = (el.find("noimg,img").attr("title") || "").toLowerCase();
		return {
			id: Number(url.param("PostID", el.find(".post-list-subject").attr("href"))) || 0,
			subject: el.find(".post-list-subject").text().trim(),
			poster: {
				id: Roblox.users.getIdFromUrl(el.find(".post-list-author").attr("href")),
				username: el.find(".post-list-author").text().trim()
			},
			lastReply: {
				id: Number(url.hash(el.find(".last-post").attr("href"))) || 0,
				page: Number(url.param("PageIndex", el.find(".last-post").attr("href"))) || 1,
				date: new Date(el.find(".last-post span.normalTextSmaller").text()).getTime(),
				poster: (el.find(".last-post div.normalTextSmaller").text() || "").trim()
			},
			replies: Number((nts[1] || {}).innerText) || 0,
			views: Number((nts[2] || {}).innerText) || 0,
			popular: status.indexOf("popular") >= 0,
			read: status.indexOf("not read") < 0
		};
	}
};

foreach({ "track": "on", "untrack": "" }, function (n, o) {
	forumService[n] = request.backgroundFunction("forumService." + n, compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		if (type(arg) != "number") { callBack(false); return; }
		$.get(arg = "https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + arg).success(function (r) {
			r = $._(r);
			$.post(arg, {
				"ctl00$cphRoblox$PostView1$ctl00$TrackThread": o,
				__EVENTTARGET: "ctl00$cphRoblox$PostView1$ctl00$TrackThread",
				__VIEWSTATE: r.find("#__VIEWSTATE").val(),
				__EVENTVALIDATION: r.find("#__EVENTVALIDATION").val()
			}, function (r, s) { callBack(s == "success"); });
		}).fail(function () {
			callBack(false);
		});
	}));
});



groupService = {
	role: request.backgroundFunction("groupService.role", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		arg.group = Number(arg.group) || 0;
		arg.check = function (u) {
			$.get("https://assetgame.roblox.com/Game/LuaWebService/HandleSocialRequest.ashx?method=GetGroupRole&playerid=" + u + "&groupid=" + arg.group).success(function (r) {
				callBack(r);
			}).fail(function () {
				callBack("");
			});
		};
		if (type(arg.user) == "number" && arg.group) {
			arg.check(arg.user);
		} else if (type(arg.user) == "string" && arg.group) {
			users.getByUsername(arg.user, function (u) {
				if (u.id) {
					arg.check(u.id);
				} else {
					callBack("");
				}
			});
		} else {
			callBack("");
			return;
		}
	}, {
		queue: true
	})),
	rank: request.backgroundFunction("groupService.rank", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		arg.group = Number(arg.group) || 0;
		arg.id = Number(arg.id) || 0;
		arg.check = function (u) {
			if (arg.id) {
				$.post("https://www.roblox.com/groups/api/change-member-rank?groupId=2518656&newRoleSetId=" + arg.id + "&targetUserId=" + u).done(function (r) {
					callBack(r.success);
				}).fail(function () {
					callBack(false);
				});
			} else {
				$.get("https://assetgame.roblox.com/Game/LuaWebService/HandleSocialRequest.ashx?method=GetGroupRank&playerid=" + u + "&groupid=" + arg.group).success(function (r) {
					callBack(Number(r));
				}).fail(function () {
					callBack(0);
				});
			}
		};
		if (type(arg.user) == "number" && arg.group) {
			arg.check(arg.user);
		} else if (type(arg.user) == "string" && arg.group) {
			users.getByUsername(arg.user, function (u) {
				if (u.id) {
					arg.check(u.id);
				} else {
					callBack(arg.id ? false : 0);
				}
			});
		} else {
			callBack(arg.id ? false : 0);
			return;
		}
	}, {
		queue: true
	}))
};



serialTracker = {
	enabled: true,
	send: {},
	get: request.backgroundFunction("serialTracker.get", compact(function (arg, callBack) {
		if (typeof (callBack) != "function") {
			console.warn("callBack not function!");
			return;
		}
		var req;
		var tim = setTimeout(function () { req.abort(); }, 20 * 1000);
		req = $.get("https://inventory.roblox.com/v1/assets/" + arg.id + "/owners?sortOrder=Asc", { limit: arg.resultsPerPage || 100, cursor: arg.cursor || "" }).success(function (r) {
			r.success = true;
			callBack(r);
		}).fail(function () {
			callBack({
				nextPageCursor: "",
				previousPageCursor: "",
				success: false,
				data: []
			});
		});
	}, {
		queue: true
	}))
};



soundService.robloxSound = function (id, callBack) {
	if (!isCB(callBack)) { return; }
	catalog.info(Number(id), function (i) {
		if (i.sound) {
			callBack(soundService(i.sound, true));
		} else {
			callBack();
		}
	});
};



if (ext.isBackground) {
	catalog.hasAsset.confirm = {};

	users.current.cache = compact.cache(3 * 1000);
	users.getById.cache = compact.cache(60 * 1000);
	users.getByUsername.cache = compact.cache(0);
	users.inventory.cache = compact.cache(3 * 60 * 1000);
	catalog.info.cache = compact.cache(3 * 1000);
	catalog.limiteds.cache = compact.cache(10 * 1000);
	catalog.hasAsset.cache = compact.cache(60 * 1000);
	tradeSystem.get.cache = compact.cache(5 * 1000);
	friendService.get.cache = compact.cache(5 * 1000);
	privateMessage.get.cache = compact.cache(5 * 1000);
	privateMessage.search.cache = compact.cache(0);
	outfit.getAssetIds.cache = compact.cache(15 * 1000);
	forumService.cache = compact.cache(5 * 1000);


	/* Load BC statuses */
	// TODO: Delete. Make sure I know where to find these again first.
	foreach({ "NBC": "/Thumbs/BCOverlay.ashx?username=1Topcop&rbxp=48103520", "BC": "/images/icons/overlay_bcOnly.png", "TBC": "/images/icons/overlay_tbcOnly.png", "OBC": "/images/icons/overlay_obcOnly.png" }, function (n, o) { $.get("https://www.roblox.com" + o); });

	/* Though not in use, the below code was used for commissions */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
		if (/^https:\/\/api\.roblox\.com\/marketplace\/purchase\?/i.test(details.url)) {
			var newHeaders = [
				{ name: "Accept-Encoding", value: "gzip" },
				{ name: "Content-Length", value: "21" },
				{ name: "Host", value: "api.roblox.com" },
				{ name: "User-Agent", value: "Roblox/WinInet" },
				{ name: "Requester", value: "Client" }
			];
			for (var n in details.requestHeaders) {
				var na = details.requestHeaders[n].name;
				if (na == "Cookie" || na == "Roblox-Place-Id" || na == "Roblox-Game-Id" || na == "Roblox-Session-Id") {
					newHeaders.push(details.requestHeaders[n]);
				}
			}
			return { requestHeaders: newHeaders };
		}
	}, { urls: ["https://api.roblox.com/marketplace/*"], types: ["xmlhttprequest"] }, ["requestHeaders", "blocking"]);

	/* Upload models with a post request */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
		if (url.path(details.url) == "/Data/Upload.ashx") {
			var headers = {
				"User-Agent": "Roblox/WinInet",
				"Host": "data.roblox.com",
				"Accept": "*/*",
				"Accept-Encoding": "deflate, gzip",
				"Cookie": "",
				"Content-Type": "application/xml",
				"Requester": "Client",
				"Content-Length": url.param("length", details.url)
			};
			var newhead = [];
			for (var n in details.requestHeaders) {
				var na = details.requestHeaders[n].name;
				if (headers.hasOwnProperty(na)) {
					newhead.push({ name: na, value: headers[na] || details.requestHeaders[n].value });
					delete headers[na];
				}
			}
			for (var n in headers) {
				newhead.push({ name: n, value: headers[n] });
			}
			return { requestHeaders: newhead };
		}
	}, { urls: ["*://data.roblox.com/Data/*"] }, ["requestHeaders", "blocking"]);

	/* Private message caching */
	if (browser.name == "Chrome") { // requestBody added to onBeforeRequest in Firefox causes silent error, stopping the script
		chrome.webRequest.onBeforeRequest.addListener(function (details) {
			var p = url.path(details.url).substring(14);
			var data = details.requestBody && details.requestBody.raw;
			if ((p == "archive-messages" || p == "unarchive-messages") && (data && data[0] && type(data[0].bytes) == "arraybuffer")) {
				p = p.startsWith("un");
				data = String.fromCharCode.apply(null, new Uint8Array(data[0].bytes));
				users.currentId(function (id) {
					var inbox = privateMessage.search.cache.get(id + "_0") || {};
					var archive = privateMessage.search.cache.get(id + "_3") || {};
					try {
						foreach(JSON.parse(data).messageIds, function (n, o) {
							if (archive[o] && p) {
								privateMessage.search.cache.set(id + "_0", archive[o]);
								delete archive[o];
							} else if (!p && inbox[o]) {
								privateMessage.search.cache.set(id + "_3", inbox[o]);
								delete inbox[o];
							}
						});
					} catch (e) { }
				});
			}
		}, { urls: ["*://*.roblox.com/messages/api/*"], types: ["xmlhttprequest"] }, ["requestBody"]);
	}

	/* Get forum thread without marking as read */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
		if (url.param("rplus", details.url) == "hide") {
			var nh = [];
			for (var n in details.requestHeaders) {
				if (details.requestHeaders[n].name != "Cookie") {
					nh.push(details.requestHeaders[n]);
				}
			}
			return { requestHeaders: nh };
		}
	}, { urls: ["*://*.roblox.com/Forum/*"], types: ["xmlhttprequest"] }, ["requestHeaders", "blocking"]);
} else if (ext.isContentScript && document.contentType == "text/html") {
	siteUI = {
		version: !!document.querySelector(".container-main>.content") ? 2 : 1,

		modal: function (arg) {
			var modal = {}, callbacks;
			callbacks = function (e) {
				callbacks[e].forEach(function (o) { o(); });
				if (e == "close") {
					callbacks("nextClose");
					callbacks.nextClose = [];
				}
			};
			callbacks.close = [];
			callbacks.nextClose = [];
			var v2id = {};
			var v2f = function (x, y) { // version 2 fade
				if (siteUI.version == 2) {
					if (v2id[x]) { clearTimeout(v2id[x]); delete v2id[x]; }
					if (y) {
						modal[x].css("display", "block");
						v2id[x] = setTimeout(function () {
							delete v2id[x];
							modal[x].addClass("in").removeClass("out");
						}, 50);
					} else {
						modal[x].addClass("out").removeClass("in");
						v2id[x] = setTimeout(function () {
							delete v2id[x];
							modal[x].css("display", "none");
						}, 200);
					}
				} else {
					modal[x][y ? "show" : "hide"]();
				}
			};
			var ret = {
				close: function (cb) {
					if (isCB(cb)) {
						callbacks.close.push(cb);
					} else {
						v2f("backdrop", false);
						v2f("container", false);
						callbacks("close");
					}
				},
				open: function () {
					v2f("backdrop", true);
					v2f("container", true);
				},
				nextClose: function (cb) { callbacks.nextClose.push(cb); },
				setHeader: function (txt) { modal.header.text(txt || ""); },
				setBody: function (html) { modal.body.html(html || ""); },
				setFoot: function (html) { modal.foot.html(html || ""); },
				setFootNote: function (txt) { modal.footNote.text(txt || "")[txt ? "show" : "hide"](); }
			};
			if (siteUI.version == 2) {
				modal.container = $("<div class=\"modal fade out\" role=\"dialog\">").hide().attr("id", arg.id).append($("<div class=\"modal-dialog\">").append(modal.content = $("<div class=\"modal-content\">")
					.append($("<div class=\"modal-header\">").append(modal.close = $("<button class=\"close\" data-dismiss=\"modal\"><span><span class=\"icon-close\"></span></span></button>").click(ret.close)).append(modal.header = $("<h5>").text(arg.header)))
					.append(modal.body = (arg.body || $("<div>")).attr("class", "modal-body"))
					.append(modal.foot = (arg.footer || $("<div>")).attr("class", "modal-footer"))
					.append(modal.footNote = $("<p class=\"small modal-footer-note\">").text(arg.footnote || "")[arg.hasOwnProperty("footnote") ? "show" : "hide"]())
				)).click(ret.close);
				$("body").append(modal.backdrop = $("<div class=\"modal-backdrop fade out\" style=\"z-index: 1040;\">").hide());
			} else {
				$("body").append(modal.backdrop = $("<div class=\"simplemodal-overlay\" style=\"opacity: 0.8; height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 1001; background-color: rgb(0, 0, 0);\">").hide().click(ret.close));
				modal.container = $("<div class=\"simplemodal-container\" style=\"position: fixed; z-index: 1002; height: 280px; width: 439px; left: 50%; top: 50%; margin-left: -220px; margin-top: -140px;\">").append($("<div tabindex=\"-1\" class=\"simplemodal-wrap\" style=\"height: 100%; outline: 0px; width: 100%; overflow: visible;\">").append(modal.content = $("<div class=\"ConfirmationModal unifiedModal smallModal simplemodal-data\">")
					.append(modal.close = $("<a class=\"genericmodal-close ImageButton closeBtnCircle_20h\">").click(ret.close))
					.append(modal.header = $("<div class=\"Title\">").text(arg.header))
					.append($("<div class=\"GenericModalBody\">")
						.append(modal.body = (arg.body || $("<div>")).attr("class", "TopBody"))
						.append($("<div class=\"ConfirmationModalFooter\">")
							.append(modal.foot = arg.footer || $("<div>"))
							.append(modal.footNote = $("<span>"))
						)
					)
				)).hide();
			}
			ret.modal = modal;
			$("body").append(modal.container);
			return ret;
		},

		feedback: function (arg) {
			if (siteUI.version != 2) {
				console.error("No support for siteUI.feedback on this page.");
				return;
			}
			arg = type(arg) == "string" ? { text: arg } : arg;
			arg.type = type(arg.type) == "string" ? arg.type : "loading"; // success, warning, loading
			var cbs = { show: [], hide: [], destroy: [] };
			var id = 0;
			var ret; ret = {
				show: function (timeout) {
					if (isCB(timeout)) { cbs.show.push(timeout); return ret; }
					var i = ++id;
					if (!ret.container.find(".alert").hasClass("on")) {
						for (var n in cbs.show) { cbs.show[n](ret); }
					}
					ret.container.find(".alert").addClass("on");
					if (timeout !== false) {
						setTimeout(function () {
							if (id == i) {
								ret.hide();
							}
						}, timeout || arg.timeout || 5000);
					}
				},
				hide: function (cb) {
					if (isCB(cb)) { cbs.hide.push(cb); return ret; } else if (cb == "destroy") { cbs.hide.push(ret.destroy); return ret; }
					if (ret.container.find(".alert").hasClass("on")) {
						setTimeout(function () {
							for (var n in cbs.hide) { cbs.hide[n](ret); }
						}, 250);
						ret.container.find(".alert").removeClass("on");
					}
				},
				destroy: function (cb) {
					if (isCB(cb)) { cbs.hide.push(cb); return ret; }
					if (ret.container.find(".alert").hasClass("on")) {
						ret.hide("destroy").hide();
					} else {
						ret.container.remove();
						for (var n in cbs.destroy) { cbs.destroy[n](ret); }
					}
				}
			};

			$("body").append(ret.container = $("<div class=\"sg-system-feedback\">").append(
				$("<div class=\"alert-system-feedback\">").append(
					$("<div class=\"alert alert-" + arg.type + "\">").append($("<span class=\"alert-content\">")[arg.html ? "html" : "text"](arg.html || arg.text)).append($("<span class=\"icon-close-white\"></span>").click(ret.hide))
				)
			));

			return ret;
		}
	};


	confirm.modal = compact(function (text, callBack) {
		var answer = false;
		confirm.modalObj.nextClose(function () {
			setTimeout(function () {
				callBack(answer);
			}, 100);
		});
		confirm.modal.queue.push(function (a) { answer = a; confirm.modalObj.close(); });
		confirm.modalObj.setFootNote((text = type(text) == "string" ? { text: text } : text).foot);
		confirm.modal.message.text(text.text);
		confirm.modalObj.open();
	}, {
		queue: true
	});

	confirm.modal.queue = [];
	confirm.modal.yes = function () { while (confirm.modal.queue.length) { confirm.modal.queue.shift()(true); } };
	confirm.modal.no = function () { while (confirm.modal.queue.length) { confirm.modal.queue.shift()(false); } };

	confirm.modalObj = siteUI.modal({
		id: "rplusConfirmModal",
		header: "Confirm Action",
		body: $("<div>").append(confirm.modal.message = $("<p style=\"text-align: center;\">")),
		footer: siteUI.version == 2 ? $("<div>").append($("<button class=\"btn-primary-md\">Yes</button>").click(confirm.modal.yes).css("margin-right", "5px")).append($("<button class=\"btn-control-md\">Cancel</button>").click(confirm.modal.no).css("margin-left", "5px")) : ""
	});
	if (siteUI.version == 1) {
		confirm.modalObj.modal.body.after($("<div class=\"ConfirmationModalButtonContainer\">").append($("<a class=\"btn-large btn-primary\">Yes</a>").click(confirm.modal.yes)).append($("<a class=\"btn-large btn-negative\">Cancel</a>").click(confirm.modal.no)));
	}
	confirm.modalObj.close(confirm.modal.no);
}



// WebGL3D
