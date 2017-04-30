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
	}
};



catalog = {
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
			privateSellers: [],
			productId: 0,
			rap: 0,
			remaining: 0,
			robuxPrice: 0,
			sales: 0,
			speed: 0,
			success: true,
			thumbnail: ""
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

			ret.url = Roblox.catalog.getAssetUrl(ret.id, ret.name);

			if (ret.limited = r.IsLimited || (ret.limitedUnique = r.IsLimitedUnique)) {
				mcb += 2;
				Roblox.resellers.getResaleData(ret.id).then(function (data) {
					ret.rap = data.averagePrice;
					fcb();
				}, fcb);
				Roblox.resellers.getResellers(ret.id).then(function (resellers) {
					if (resellers.data.length > 0) {
						ret.lowestPrice = resellers.data[0].price;
					}
					resellers.data.forEach(function (sale) {
						ret.privateSellers.push({
							price: sale.price,
							seller: {
								id: sale.seller.id,
								username: sale.seller.name
							},
							userAssetId: sale.userAssetId,
							serial: Number(sale.serialNumber) || 0
						});
					});
					fcb();
				}, fcb);
			}
			Roblox.develop.canManage(ret.id).then(function (canManage) {
				ret.editable = canManage;
				fcb();
			}, fcb);
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
			Roblox.users.getCurrentUserId().then(function (id) {
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
			}, fallback);
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
		productId: Number(hold.find(".PurchaseButton[data-product-id]").data("product-id")) || 0,
		robuxPrice: Number(hold.find(".icon-robux-price-container .text-robux-lg").text().replace(/\D+/g, "")) || 0,
		thumbnail: hold.find("#AssetThumbnail>.thumbnail-span>img").attr("src"),
		url: hold.find("link[rel='canonical']").attr("href")
	};
	ret.assetType = ret.assetType.replace("Accessory", " Accessory");

	ret.assetTypeId = Number(array.flip(Roblox.catalog.assetTypes)[ret.assetType]) || 0;

	return ret;
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


soundService.robloxSound = function (id, callBack) {
	if (!isCB(callBack)) { return; }
	Roblox.audio.getSoundUrl(Number(id)).then(function (url) {
		callBack(soundService(url, true));
	}, function () {
		callBack();
	});
};



if (ext.isBackground) {
	catalog.info.cache = compact.cache(3 * 1000);
	catalog.limiteds.cache = compact.cache(10 * 1000);
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
}


// WebGL3D
