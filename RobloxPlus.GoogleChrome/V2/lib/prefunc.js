// prefunc.js [3/8/2016]
/*
	For any questions message WebGL3D http://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
_ = undefined;

type = function (x) { x = Object.prototype.toString.call(x); return x.substring(8, x.length - 1).toLowerCase(); };

tostring = function (s) { return type(s) == "array" || type(s) == "object" ? JSON.stringify(s) : (s === 0 ? "0" : (s === false ? "false" : (s || ""))).toString(); };
toNumber = function (n) {
	var inf = 1.7976931348623157E+10308;
	if (n == inf || n == -inf) { return n; }
	n = tostring(n);
	n = n ? (n.match(/[\d\.-]/g) || []).join("") : "0";
	if (n.indexOf("-") == 0) {
		n = "-" + (n.replace(/-/g, ""));
	}
	if (n.indexOf(".") >= 0) {
		n = n.substring(0, n.indexOf(".")) + "." + (n.substring(n.indexOf(".")).replace(/\./g, ""));
	}
	n = parseFloat(n);
	return isNaN(n) ? 0 : n;
};

isCB = function (a) { return typeof (a) == "function"; };
fixCB = function (a) { return isCB(a) ? a : function () { }; };

foreach = function (a, c) { if (isCB(c)) { for (var n in typeof (a) == "object" ? a : {}) { if (c(n, a[n])) { return true; } } } };

getMil = function () { return +new Date; };

pnow = function () { return performance.now(); };

argarr = function () {
	var ar = [];
	for (var CN = 0; CN < arguments.length; CN++) {
		ar.push(arguments[CN]);
	}
	return ar;
};
argarr.profunc = function (x) {
	return function () {
		var ar = argarr.apply(this, arguments);
		ar.unshift(this);
		return x.apply(this, ar);
	};
};



math = {
	toNumber: toNumber,
	addComma: function (n) { n = toNumber(n); if (n == 0) { return "0"; }; n = tostring(n); while (/(\d+)(\d{3})/.test(n)) { n = n.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2'); } var d = n.indexOf("."); if (d !== -1) { var startN = n.substring(0, d); var endN = n.substring(d + 1).split(",").join(""); n = startN + "." + endN; } return n; },
	number: function (n) { return tostring(n) == tostring(toNumber(n)); },

	ceil: function (n, t) { n = toNumber(n); t = toNumber(t); return t ? Math.ceil(n / t) * t : Math.ceil(n); },
	floor: function (n, t) { n = toNumber(n); t = toNumber(t); return t ? Math.floor(n / t) * t : Math.floor(n); },

	min: function () { var r = math.huge; for (var n in arguments) { r = Math.min(toNumber(arguments[n]), r); } return r; },
	max: function () { var r = -math.huge; for (var n in arguments) { r = Math.max(toNumber(arguments[n]), r); } return r; },

	seed: function (x) {
		if (math.number(x)) {
			math.seed.n = x;
		} else {
			return math.seed.n ? math.seed.n++ : getMil() * Math.random();
		}
	},
	random: function (a, b) {
		var c = Math.sin(math.seed()) * 10000;
		c = c - Math.floor(c);
		var i = { a: a === 0 || a, b: b === 0 || b };
		if (i.a && i.b) {
			a = toNumber(a);
			b = toNumber(b);
			return math.floor(c * (b - a + 1) + a);
		} else if (i.a && !i.b) {
			return math.random(1, a);
		}
		return c;
	},

	rad: function (n) { return toNumber(n) * (math.pi / 180); },
	deg: function (n) { return toNumber(n) / (math.pi / 180); },
	bound: function (n, a, b) { return math.max(math.min(a, b), math.min(math.max(a, b), toNumber(n))); },

	closest: function (n, ar) { n = toNumber(n); if (typeof (ar) == "object" && Object.keys(ar).length) { if (Object.keys(ar).length > 1) { var r = n; var m = math.huge; for (var i in ar) { var o = toNumber(ar[i]); var d = math.abs(n - o); if (math.number(ar[i]) && (d < m || (m == d && o > r))) { r = o; m = d; } } return r; } else { return math.number(ar[0]) ? toNumber(ar[0]) : n; } } return n; },

	huge: 1.7976931348623157E+10308,
	pi: Math.PI
};
foreach(["abs", "acos", "asin", "atan", "atan2", "cos", "exp", "log", "pow", "sin", "sqrt", "tan", "min", "max"], function (n, o) {
	math[o] = function () {
		var arg = []; for (var n in arguments) { arg[n] = toNumber(arguments[n]); }
		return Math[o].apply(this, arg);
	};
});

addComma = math.addComma;


string = {
	tostring: tostring,
	lower: function (s) { return tostring(s).toLowerCase(); },
	upper: function (s) { return tostring(s).toUpperCase(); },
	byte: function (s) { return tostring(s).charCodeAt(0); },
	char: function (c) { return String.fromCharCode(toNumber(c)); },
	find: function (s, f, i) {
		if (i) {
			s = string.lower(s);
			f = string.lower(f);
		} else {
			s = tostring(s);
			f = tostring(f);
		}
		return s.indexOf(f) !== -1 ? [s.indexOf(f), s.indexOf(f) + f.length] : [-1, -1];
	},
	rep: function (s, r) { return new Array(toNumber(r) + 1).join(tostring(s)); },
	len: function (s) { return tostring(s).length; },
	sub: function (s, a, b) { return tostring(s).substring(toNumber(a), toNumber(b || string.len(s))); },
	match: function (s, m, i) {
		s = tostring(s);
		i = !!i;

		if (type(m) == "regexp") {
			i = i || m.ignoreCase;
			m = m.source;
		} else {
			m = tostring(m);
		}

		var ret = [];
		var mat = string.regex(m, "g" + (i ? "i" : ""));
		var r;

		while ((r = mat.exec(s)) != null) {
			ret.push([r[0], r.index, r.index + r[0].length]);
		}

		return ret;
	},
	clean: function (s) {
		var m = { "amp": "&", "quot": "\"", "lt": "<", "gt": ">" };
		var n = { 174: string.char(8482), 233: "é", 243: "ó", 172: "¬", 32: " ", 33: "!", 34: "\"", 35: "#", 36: "$", 37: "%", 38: "&", 39: "'", 40: "(", 41: ")", 42: "*", 43: "+", 44: "`", 45: "-", 46: ".", 47: "/" };
		s = tostring(s);
		for (var i in m) {
			s = s.replace(new RegExp("&" + i + ";", "g"), m[i]);
		}
		for (var i in n) {
			s = s.replace(new RegExp("&#" + i + ";", "g"), n[i]);
		}
		return s;
	},
	escapeHTML: function (s) { return tostring(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
	unescapeHTML: function (s) { return tostring(s).replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&apos;/gi, "'").replace(/&#39;/g, '\'').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>'); },
	scramble: function (s, nu) { var a = tostring(s).split(""); var a2 = tostring(s).split(""); var n = a.length; var nums = tostring(toNumber(s)).split(""); var moved = {}; for (var CN = n - 1; CN > 0; CN--) { var r = math.random(CN) - 1; var tmp = a[CN]; a[CN] = a[r]; a[r] = tmp; moved[CN] = CN; } if (nu) { var nums = []; var n2 = 0; for (var CN = 0; CN < a2.length; CN++) { if (math.isNumber(a2[CN])) { nums.push(a2[CN]); } } for (var CN = 0; CN < a.length; CN++) { if (math.isNumber(a[CN])) { a[CN] = nums[n2++]; } } } return a.join(""); },
	reverse: function (s) { return tostring(s).split("").reverse().join(""); },
	startsWith: function (s, a, i) {
		if (type(a) == "regexp") {
			return !!tostring(s).match(string.regex("^" + a.source, a.ignoreCase || i ? "i" : ""));
		} else {
			if (i) {
				s = string.lower(s);
				a = string.lower(a);
			} else {
				s = tostring(s);
				a = tostring(a);
			}
			return s.indexOf(a) === 0;
		}
	},
	endsWith: function (s, a, i) {
		if (type(a) == "regexp") {
			return !!tostring(s).match(string.regex(a.source + "$", a.ignoreCase || i ? "i" : ""));
		} else {
			if (i) {
				s = string.lower(s);
				a = string.lower(a);
			} else {
				s = tostring(s);
				a = tostring(a);
			}
			return s.substring(s.length - a.length) == a;
		}
	},
	autoCorrect: function (s, oar, tol) {
		s = tostring(s);
		if (s == "") { return ""; }
		oar = typeof (oar) == "object" ? oar : [oar];
		var ar = []; var arc = {}; for (var n in oar) { var str = tostring(oar[n]); if (!arc[str] && str.length) { arc[str] = ar.length + 1; ar.push(str); } }
		tol = tol === 0 || tol ? round(tol) : math.huge;
		var ret = { dif: 0, result: "" };
		for (var n in ar) {
			var o = ar[n];
			if (string.lower(o) == string.lower(s)) { return o; }
			var dif = math.max(s.length, o.length) - math.min(s.length, o.length);
			if (dif <= tol && (string.lower(o).indexOf(string.lower(s)) >= 0 || string.lower(s).indexOf(string.lower(o)) >= 0) && (ret.dif == 0 || ret.dif > dif)) {
				ret.dif = dif;
				ret.result = o;
			}
		}
		return ret.dif > 0 ? ret.result : "";
	},
	format: function () {
		var ar = arguments;
		return tostring(ar.shift()).replace(/{(\d+)}/g, function (m, n) {
			n = toNumber(n);
			return typeof (ar[n]) != 'undefined' ? tostring(ar[n]) : m;
		});
	},
	regex: function (s, c) { c = string.lower(c); return new RegExp(tostring(s), (c.indexOf("g") >= 0 ? "g" : "") + (c.indexOf("i") >= 0 ? "i" : "") + (c.indexOf("m") >= 0 ? "m" : "")); },
	replace: function (s, a, b) { return tostring(s).split(tostring(a)).join(tostring(b)); },
	equals: function (s, r, i) {
		s = tostring(s);
		if (i) { s = string.lower(s); }
		if (type(r) == "regexp") {
			var t = s.match(string.regex(r.source, i ? "i" : ""));
			return t ? t[0].length == s.length : false;
		} else {
			if (i) { r = string.lower(r); } else { r = tostring(r); }
			return r == s;
		}
	}
};
string.length = string.len;
Object.defineProperty(String.prototype, "format", {
	value: function () {
		var ar = arguments;
		return tostring(this).replace(/{(\d+)}/g, function (m, n) {
			n = Number(n);
			return typeof (ar[n]) != 'undefined' ? tostring(ar[n]) : m;
		});
	}
});
foreach(string, function (n, o) {
	if (((n == "startsWith" || n == "endsWith") || !String.prototype.hasOwnProperty(n)) && type(o) == "function") {
		Object.defineProperty(String.prototype, n, {
			value: argarr.profunc(o)
		});
	}
});

RegExp.escape = function (a) { return a.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&"); };
RegExp.change = function (data, reg, n, d, order) {
	if (data.match(reg)) {
		data = data.replace(reg.source.startsWith("\\n?") ? reg.source.substring(3).regex((reg.global ? "g" : "") + (reg.ignoreCase ? "i" : "") + (reg.multiline ? "m" : "")) : reg, n);
	} else {
		data = data + (data ? (type(d) == "string" ? d : "\n") : "") + n;
		if (isCB(order)) { data = order(data); }
	}
	return data;
};


math.round = round = function (n, t) {
	n = toNumber(n); return t ? (
		t == "odd" ? (n % 2 == 0 ? n + 1 : n[n.floor() % 2 == 0 ? "ceil" : "floor"]())
		: (t == "even" ? (n % 2 == 0 ? n : (n % 1 == 0 ? n + 1 : n[n.floor() % 2 != 0 ? "ceil" : "floor"]()))
		: math.floor((n / toNumber(t)) + .5) * toNumber(t))
	) : math.floor(n + .5);
};
math.posRound = pround = function (n, t, m) { return math.max(round(n, t), m || 0); }

foreach(math, function (n, o) {
	if ((["toNumber", "number"]).indexOf(n) < 0 && !Number.prototype.hasOwnProperty(n) && type(o) == "function") {
		Object.defineProperty(Number.prototype, n, {
			value: argarr.profunc(o)
		});
	}
});


array = {
	correct: function (a, t) { return typeof (a) == "object" ? a : (t ? [] : {}); },
	random: function (a) { a = array.correct(a); var k = Object.keys(a); return k.length ? a[k[math.random(0, k.length - 1)]] : undefined; },
	first: function (a) { a = array.correct(a); var k = Object.keys(a); return k.length ? a[k[0]] : undefined; },
	last: function (a) { a = array.correct(a); var k = Object.keys(a); return k.length ? a[k[k.length - 1]] : undefined; },
	keys: function (a) { return Object.keys(array.correct(a)); },
	correctKeys: function (a, k) {
		a = array.correct(a, true);
		var r = {};
		foreach(k, function (n, o) {
			var c = string.autoCorrect(o, Object.keys(a));
			if (c) {
				r[o] = a[c];
			}
		});
		return r;
	},
	flip: function (a) { var ret = {}; foreach(a, function (n, o) { ret[tostring(o)] = n; }); return ret; }
};



Object.defineProperty(Date.prototype, "format", {
	value: function (str) {
		var d = this;
		str = tostring(str);
		foreach([
			["getHours", function (v, k) {
				return k == "AMPM" ? (v >= 12 ? "PM" : "AM") : ((k == "MILHOUR" || k.startsWith("0")) && v < 10 && (v != 0 && k != "MILHOUR") ? "0" : "") + (k == "MILHOUR" || v <= 12 ? (k != "MILHOUR" && v == 0 ? 12 : v) : v - 12);
			}, "0HOUR", "HOUR", "MILHOUR", "AMPM"],
			["getMinutes", function (v, k) {
				return (k.startsWith("0") && v < 10 ? "0" : "") + v;
			}, "0MINUTE", "MINUTE"],
			["getSeconds", function (v, k) {
				return (k.startsWith("0") && v < 10 ? "0" : "") + v;
			}, "0SECOND", "SECOND"],
			["getFullYear", function (v, k) {
				return tostring(v).substring(k.startsWith("FULL") ? 0 : 2);
			}, "FULLYEAR", "YEAR"],
			["getDate", function (v, k) {
				return (k.startsWith("0") && v < 10 ? "0" : "") + v;
			}, "0DATE", "DATE"],
			["getMonth", function (v, k) {
				++v;
				return (k.startsWith("0") && v < 10 ? "0" : "") + (k == "MONTHNAME" ? (["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])[v - 1] : v);
			}, "0MONTH", "MONTH", "MONTHNAME"]
		], function (n, o) {
			for (var CN = 2; CN < o.length; CN++) {
				str = str.replace(o[CN].regex("gi"), function () {
					return o[1](d[o[0]](), o[CN]);
				});
			}
		});
		return str;
	}
});



url = {
	protocol: function (u, r) {
		if (type(u) != "string" || !u) { u = location.href; }
		var i = u.indexOf("://");
		return r ? (type(r) == "string" ? r + "://" : "") + (i >= 0 ? u.substring(i + 3) : u) : (i >= 0 ? u.substring(0, i) : "").trim();
	},
	host: function (u, v) {
		var p = url.protocol(u = u || location.href);
		u = url.protocol(u, true);
		var i = u.indexOf("/");
		return type(v) == "string" ? (p ? p + "://" : "") + v + (i >= 0 ? u.substring(i) : "") : (i >= 0 ? u.substring(0, i) : u);
	},
	port: function (u, v) {
		if (type(v) == "string") { v = url.port.key(v); } else if (type(v) == "number") { v = v.toString(); }
		if ((type(v) != "string" && v) || v === "0" || v === 0) { v = ""; }
		var p = url.protocol(u = u || location.href).lower();
		u = url.protocol(u, true);
		var i2 = u.indexOf("/");
		var i = u.substring(0, i2 >= 0 ? i2 : u.length).indexOf(":");
		if (type(v) == "string") {
			return (p ? p + "://" : "") + u.substring(0, math.max(0, i >= 0 ? i : (i2 >= 0 ? i2 : u.length))) + (v ? ":" + v : "") + (i2 >= 0 ? u.substring(i2) : "");
		}
		return i >= 0 ? url.port.key(u.substring(i, i2 >= 0 ? i2 : u.length)) || (p == "https" ? 443 : 80) : (p == "https" ? 443 : 80);
	},
	path: function (u, v) {
		var p = url.protocol(u = u || location.href).lower();
		u = url.protocol(u, true);
		var i = u.indexOf("/");
		var q = u.indexOf("?");
		var a = u.indexOf("&");
		if (a < q && a >= 0) { q = a; }
		var s = q < i && a >= 0 ? q : i;
		if (type(v) == "string") {
			v = v.startsWith("/") ? v.substring(1) : v;
		} else if (v) {
			v = "";
		}
		return type(v) == "string" ? (p ? p + "://" : "") + u.substring(0, s >= 0 ? s : u.length) + "/" + v + (q >= 0 ? u.substring(q) : "") : (i >= 0 ? u.substring(i, q >= 0 ? q : u.length) : "");
	},
	hash: function (u, v) {
		if (v && type(v) != "string") { v = ""; }
		var i = (u = u || location.href).indexOf("#");
		return type(v) == "string" ? u.substring(0, i >= 0 ? i : u.length) + (v ? "#" + v : "") : (i >= 0 ? u.substring(i + 1) : "");
	},
	send: function (u) { return url.host(url.protocol(u, true), ""); },
	params: function (u) {
		u = url.path(u = u || location.href, "").substring(1);
		var ret = {};
		var s;
		var reg = /[?&]?([^?&=#]+)=?([^&?#]*)/g;
		while (s = reg.exec(u)) {
			ret[decodeURIComponent(s[1].replace(/\+/g, " "))] = decodeURIComponent(s[2].replace(/\+/g, " "));
		}
		return ret;
	},
	param: function (k, u) {
		u = url.send(u = u || location.href);
		return (u.match(("[^?&]?" + encodeURIComponent(k) + "=([^&?#]*)").regex("i")) || ["", ""])[1];
	}
};
url.port.key = function (s, m) {
	if (type(s) == "number") {
		s = s.toString();
	} else if (type(s) != "string") {
		return s;
	}
	m = type(m) == "number" ? (m === 0 ? math.huge : m) : 65535;
	var n = -1;
	var ret = "";
	var list = {
		"a": 2, "b": 2, "c": 2,
		"d": 3, "e": 3, "f": 3,
		"g": 4, "h": 4, "i": 4,
		"j": 5, "k": 5, "l": 5,
		"m": 6, "n": 6, "o": 6,
		"p": 7, "q": 7, "r": 7, "s": 7,
		"t": 8, "u": 8, "v": 8,
		"w": 9, "x": 9, "y": 9, "z": 9
	};
	for (var CN = 0; CN < 10; CN++) { list[CN] = CN.toString(); }
	while (Number(ret || 0) <= m && ++n < s.length) {
		var c = s[n].lower();
		if (list[c]) {
			if (Number(ret + list[c]) > m) {
				break;
			} else {
				ret += list[c];
			}
		}
	}
	return ret ? Number(ret) : 0;
};



soundService = function (src, ret) {
	if (type(src) != "string") {
		return;
	} else if (!ret && soundService.cache[src]) {
		return soundService.cache[src];
	}

	var cbs = { "error": [] };
	var loaded = false;
	var playOnLoad = false;
	var errored = false;

	ret = {
		src: document.createElement("audio"),

		play: function (cb) {
			if (isCB(cb)) {
				cbs.play.push(cb);
			} else {
				if (loaded) {
					if (ret.src.duration) {
						ret.src.play();
					}
				} else {
					playOnLoad = true;
				}
			}
			return ret;
		},
		stop: function (cb) {
			if (isCB(cb)) {
				cbs.stop.push(cb);
			} else {
				playOnLoad = false;
				if (ret.playing()) {
					ret.src.load();
				}
				cbs.stop.forEach(function (cb) {
					cb();
				});
			}
			return ret;
		},
		pause: function (cb) {
			if (isCB(cb)) {
				cbs.pause.push(cb);
			} else {
				if (ret.playing()) {
					ret.src.pause();
				}
			}
			return ret;
		},
		error: function (cb) {
			if (isCB(cb)) {
				cbs.error.push(cb);
				if (errored) {
					cb();
				}
			}
			return ret;
		},

		playing: function () { return !ret.src.paused; },
		volume: function (v) {
			if (type(v) == "number") {
				ret.src.volume = Math.max(Math.min(v, 1), 0);
				return ret;
			} else {
				return ret.src.volume;
			}
		}
	};

	foreach({ "play": "play", "pause": "pause", "stop": "ended" }, function (n, e) {
		cbs[n] = [];
		ret.src.addEventListener(e, function () {
			foreach(cbs[n], function (i, o) {
				o();
			});
		});
	});
	ret.src.addEventListener("canplaythrough", function () {
		loaded = true;
		if (playOnLoad) {
			ret.play();
		}
	});
	ret.src.addEventListener("error", function () {
		loaded = errored = true;
		foreach(cbs.error, function (n, o) {
			o();
		});
	});

	return soundService.cache[ret.src.src = src] = ret;
};

soundService.cache = {};



// WebGL3D
