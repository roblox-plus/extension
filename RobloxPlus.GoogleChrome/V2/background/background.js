// background.js [3/30/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
foreach({
	"friendNotifier": {
		on: false,
		online: true,
		offline: true,
		game: true,
		blocked: []
	},
	"notificationVolume": .5,
	"notifierSounds": {
		items: 205318910,
		tradeInbound: 0,
		tradeOutbound: 0,
		tradeCompleted: 0,
		tradeDeclined: 0,
		friend: 0,
		forum: 0,
		messages: 0,
		groupShout: 0
	},
	"changedLogin": ext.incognito,
	"startupNotification": {
		on: !ext.incognito,
		visit: browser.name != "Chrome",
		names: {}
	},
	"forums": {
		last: 0,
		floodcheck: 0,
		signature: "",
		lines: 3,
		blacklist: [],
		postIds: false,
		rap: false,
		blocking: false,
		embedding: false,
		embedSize: 75
	},
	"changedLogin": ext.incognito,
	"groupShoutNotifierList": { 2518656: "Roblox+ Fan Group" },
	"navigation": {
		"sideOpen": false,
		"counterCommas": 100000000,
		"buttons": [
			{ text: "Develop", href: "/develop" },
			{ text: "Forums", href: "/forum" }
		]
	},
	"userSince": getMil()
}, function (n, o) {
	if (type(storage.get(n)) != type(o)) {
		storage.set(n, o);
	}
});



/* Notifications, and notifiers */
function setupNotifier(run, arg, ret) {
	arg = type(arg) == "object" ? arg : {};
	arg.timeout = arg.timeout || 60000;
	arg.interval = arg.interval || 5000;
	return ret = {
		id: 0,
		run: function (id) {
			if (id == undefined) { id = ++ret.id; } else if (id != ret.id) { return; }
			var tim = setTimeout(function () {
				ret.run(++ret.id);
			}, arg.timeout);
			var go = function (loop) {
				if (!tim) { return; }
				clearTimeout(tim);
				tim = 0;
				loop = loop || arg.interval;
				setTimeout(ret.run, loop, id);
			};
			if (type(arg.storage) != "string" || storage.get(arg.storage)) {
				Roblox.users.getCurrentUserId().then(function (uid) {
					if (!arg.userId || uid) {
						run(go, uid);
					} else {
						go();
					}
				}, go);
			} else {
				go();
			}
		}
	};
}

notification.properties.robloxSound = function (a, note) {
	if (!Number(a)) { return notification.properties.speak(note.header + "\n" + note.lite, note); }
	soundService.robloxSound(a, function (s) {
		if (s && !note.closed) {
			s.volume(Number(storage.get("notificationVolume")) || .5).play(function () {
				if (note.closed) {
					s.stop();
				}
			}).play();
			note.close(function () { s.stop(); });
		}
	});
};

if (!ext.incognito) {
	setInterval(function () {
		chrome.browserAction.setBadgeText({ text: (Object.keys(notification.server).length || "").toString() });
	}, 250);
}

if (browser.name == "Chrome") {
	chrome.contextMenus.create({
		id: "clearNotifications", title: "Clear Notifications", contexts: ["browser_action"], onclick: function () {
			notification.clear();
		}
	});

	chrome.contextMenus.create({
		id: "mainContext",
		documentUrlPatterns: ["*://*.roblox.com/*"],
		title: ext.manifest.name,
		contexts: ["link"],
		targetUrlPatterns: ["*://*.roblox.com/users/*/profile"]
	});

	chrome.contextMenus.create({
		id: "sendTrade",
		title: "Trade",
		contexts: ["link"],
		targetUrlPatterns: ["*://*.roblox.com/users/*/profile"],
		documentUrlPatterns: ["*://*.roblox.com/*"],
		parentId: "mainContext",
		onclick: function (e) {
			var id = Roblox.users.getIdFromUrl(e.linkUrl);
			var u = "https://www.roblox.com/Trade/TradeWindow.aspx?TradePartnerID=" + id;
			$.get(u).done(function (r) {
				if (($._(r).find("#aspnetForm[action]").attr("action") || "").endsWith("TradePartnerID=" + id)) {
					Roblox.trades.openSettingBasedTradeWindow(id);
				}
			});
		}
	});
};



/* Item Notifier */
(function () {
	// Users who bought https://www.roblox.com/catalog/133970575/Old-New-Limited-Buy-Button
	var oldButtonOwners = [48103520, 49584642, 25708286, 2533795, 10695496, 16133422, 25457952, 29022659, 1565828, 10903234, 60684695, 28270350, 9738642, 4214261, 441825, 68728334, 13779106, 33374257, 34763167, 22486576, 30380671, 23078326, 22025583, 23387029, 26061794, 3994876, 6377064, 23368512, 60603007, 30651579, 53314481, 41107875, 13060661, 7812548, 45601875, 849088, 15478033, 37259264, 30456580, 16397457, 20093911, 16031105, 8237417, 3055965, 34454923, 6285620, 18118194, 1784593, 24107314, 68085132, 24788066, 17312289, 25214736, 18981862, 21555770, 42974107, 66820270, 14309811, 16261346, 10422851, 67700356, 28384148, 32627573, 13759873, 19190222, 46541288, 25814658, 15753405, 35935158, 71062368, 43925717, 51297402, 22933337, 6452092, 1236145, 64453771, 7320896, 44058635, 66930185, 1720707, 39673518, 9691717, 24996494, 2150653, 38647142, 22787256, 36070193, 771417, 18910710, 7225118, 19503260, 52623138, 7180198, 8737833, 338277, 24843220, 23942741, 621731, 19576094, 38325661, 3062094, 6059675, 15163535, 3080234, 11114008, 21486880, 22540798, 19005753, 47087354, 3052771, 5745, 9047922, 1081692, 13837849, 72801929, 63478293, 13292817, 19717956, 3163315, 8958670, 31415649, 14369683, 14872477, 14990937, 13435821, 17196398, 23313558, 14713397, 32172098, 61369874, 17693175, 46826994, 3489260, 37540446, 7744317, 11551579, 43884443, 16610221, 16900854, 20212681, 40710800, 19977967, 15763111, 27538722, 20293810, 4215776, 63354548, 20532808, 5267274, 67840068, 25138867, 9469221, 16593385, 3673286, 22365670, 16828310, 2930505, 31611367, 3992144, 32251935, 46277413, 14750020, 5566075, 22167222, 14743806, 36561766, 15992424, 56794190, 6802494, 70998839, 7874437, 19357824, 4686858, 40842434, 49207141, 2672463, 20776279, 8022155, 53398904, 33623753, 11415980, 33712225, 5550155, 45478781, 11044605, 57275457, 15805140, 34252185, 32136988, 39626635, 10776079, 21976403, 10490099, 8051145, 5210581, 17678155, 9089937, 15352323, 71397460, 562368, 16393884, 3151171, 57515128, 15889996, 20963, 19256410, 1237666, 7841486, 65405656, 2687074, 11174532, 8922312, 2448802, 31913385, 16684710, 20970102, 68244533, 4035424, 56054144, 25661233, 19085230, 40804613, 15652784, 45825644, 68523927, 3965809, 39381885, 18768949, 61713432, 11077829, 37412564, 360016, 734945, 6229713, 22595889, 22940107, 7397713, 8482809, 62105686, 38083724, 21945330, 14052130, 6999364, 21661548, 50747821, 13330258, 48017023, 45286379, 17688712, 19067325, 52269463, 29662728, 57307948, 28558742, 46329117, 9544246, 9544183, 5551429, 886870, 13179097, 27057428, 17695930, 38465805, 3439659, 29584121, 648842, 29371917, 10294651, 20883524, 1310377, 33249292, 4056828, 22815054, 712819, 17016147, 20598136, 56441769, 9433499, 74777205, 3555595, 20466411, 9435875, 14693216, 16192883, 28287022, 8681389, 6952932, 9324346, 4094524, 373950, 8885463, 41896804, 29825299, 17253583, 53544682, 34417436, 15862988, 2803337, 8703083, 21532027, 60696194, 18948555, 30528357, 10525748, 16879423, 13042729, 6503173, 33417669, 5276962, 4309939, 32729470, 8064278, 21875616, 69820279, 19599756, 60138201, 2897149, 24319589, 18000731, 9770984, 1856863, 16505559, 20986719, 68270035, 29109991, 56791789, 1000717, 38670894, 21495152, 27497305, 22640993, 17897891, 54499326, 25057974, 22235653, 23378817, 9438438, 52777576, 71674857, 25043732, 6064318, 1527248, 23441688, 20967858, 11816529, 51475463, 16492520, 5193371, 2108078, 288737, 18033125, 14438549, 16333943, 1912087, 3713161, 35543468, 44566002, 59064427, 4996293, 30925849, 6735009, 32644022, 14188665, 34788690, 1210210, 24330496, 34253782, 22618843, 23473447, 30009973, 19598936, 1208414, 63349413, 76951730, 9472109, 23021243, 6465519, 67115845, 25330072, 15058317, 61042340, 3779383, 13693182, 9560567, 58267314, 5012801, 38099137, 54942543, 40656243, 25154705, 36384321, 17506380, 76747092, 23297026, 14189334, 29291029, 7023834, 20252180, 1857025, 61108888, 13349712, 1629606, 33412125, 71202651, 36180631, 66795138, 19693775, 23558637, 52931885, 16763647, 55457343, 58902408, 1113446, 4934881, 35782289, 36740759, 32807065, 43636900, 19206605, 26330685, 27842645, 63731661, 2207291, 19318799, 3927, 2182958, 4812582, 52945829, 25838502, 76340411, 10929008, 736588, 840236, 19546792, 32914047, 50533904, 40848272, 515323, 31790662, 19566737, 5700900, 9791113, 50774350, 44164830, 28705662, 13574281, 18445142, 32506856, 34383177, 23889807, 15205965, 7533622, 76991785, 3173565, 5911037, 20649127, 5946366, 21342231, 858276, 2585370, 52391352, 68568878, 50740098, 44165, 5243496, 13855208, 56218771, 9981083, 26661026, 47143359, 5466003, 66234025, 24665531, 23856938, 17184396, 43307253, 23619542, 9858770, 960552, 14775533, 18044898, 11470857, 31820308, 78255285, 21137670, 61240383, 73730445, 14368562, 73601813, 78352050, 7243885, 9066972, 29391484, 42644199, 6312538, 58202812, 31512764, 109490, 37167128, 12014954, 2402019, 17174670, 13203163, 18976373, 39268591, 27988172, 23701121, 39834595, 7589682, 32912452, 34404570, 10438595, 847202, 14058779, 7122864, 20518724, 28133031, 43613559, 41658733, 71572927, 20992404, 10491342, 6422764, 15853457, 21646772, 18460794, 44916127, 23690437, 16678128, 8975156, 39293813, 14689716, 23879103, 2009831, 64485712, 4387565, 42376516, 74849896, 20377125, 21793507, 6361510, 8734631, 11064792, 35701860, 24793480, 773506, 1907051, 17618206, 10585217, 31251228, 30542393, 9849433, 2839546, 41004713, 10359367, 1572288, 36203282, 32425968, 17102107, 13127035, 78629022, 37998759, 6220197, 37943641, 670603, 28282149, 26626414, 16206073, 31025122, 17820096, 25234821, 6580, 27863148, 54293556, 23809117, 6339923, 2384684, 30765917, 75630878, 6616321, 17040016, 28642356, 6534426, 14069257, 57447210, 361738, 6643751, 45118430, 1244016, 44526609, 9245235, 4356411, 27656, 65476983, 4038863, 51364061, 6479158, 28681063, 64337870, 5960219, 15631081, 4288991, 21469330, 321352, 6683808, 17903155, 15174910, 8283698, 6726672, 23327427, 16686027, 9777151, 49585637, 46591508, 15716112, 18053857, 42421023, 57602054, 18231176, 5302288, 21780378, 1880161, 11088025, 713793, 81658599, 46074285, 38293247, 30144435, 20921875, 7107738, 42584380, 13041557, 44047712, 34368866, 53714647, 445454, 51356179, 54134064, 34615722, 7252081, 27710614, 9000604, 74173407, 9598691, 3778038, 29172986, 50978966, 56538839, 13797102, 19305571, 17774821, 28436805, 75831600, 37998055, 9960695, 17768673, 70556831, 80929794, 56730270, 69780436, 19099943, 1367612, 76967868, 53252113, 29901803, 64315104, 48223461, 44052422, 30435257, 72726917, 44097012, 25030905, 63823686, 20726279, 9721904, 80682868, 127780, 8186640, 24067716, 5311175, 6465281, 41753892, 38246881, 79328144, 1693236, 37330692, 40431034, 81047425, 11348402, 33983819, 37261311, 41286421, 35239082, 32126600, 3297865, 1458153, 20887656, 31030421, 21104829, 83868196, 7058943, 81448555, 8913531, 78748986, 29585647, 28341131, 28877678, 2004690, 64818317, 47776918, 15538410, 53217485, 53072308, 37296749, 2738735, 13894759, 14043632, 60171211, 18387459, 10816443, 24296607, 80762715, 38712208, 413000, 31913717, 27967165, 14433470, 46188958, 14744551, 10901169, 3484465, 13992341, 5414629, 2632362, 10064852, 79783576, 13262157, 84267270, 22360380, 52940600, 83973784, 25238253, 60016262, 2033570, 59331690, 28245291, 40397833, 9553783, 1593163, 23153577, 13271738, 61292461, 45433838, 54234378, 5589408, 73139450, 11154735, 19536244, 1206688, 27504257, 32147273, 51686081, 55714828, 77388679, 36087799, 26478306, 20096385, 75830432, 69028942, 797270, 9769187, 35582568, 34978, 9933671, 39009067, 5749622, 75868492, 31827822, 14949389, 84053248, 57893847, 34898673, 61416390, 60458161, 10225798, 5227701, 46091939, 73130220, 37353905, 21949146, 45063537, 20453041, 62601473, 2166584, 608536, 8895155, 7405505, 29919693, 52563597, 26120607, 20925099, 4321389, 34698174, 6059858, 984511, 41340401, 50453773, 35573599, 69556907, 39253497, 78878460, 34629480, 18071525, 43068978, 13294739, 51819111, 84251004, 12009250, 77917629, 61905306, 36628732, 21128420, 36177873, 22769439, 26510441, 31761830, 9842503, 20334246, 32007412, 21612714, 11471636, 75801315, 57616587, 28050431, 73721574, 20691393, 65705966, 15920638, 58823944, 21974470, 15767056, 9668202, 5017950, 28383577, 53235797, 28218228, 20321970, 1984078, 36010373, 2301754, 11463582, 3495119, 50295162, 16135344, 32420831, 24091669, 73072929, 167795, 27840619, 13405461, 31318463, 24499173, 15886356, 35784797, 37833873, 51143671, 21059405, 10662840, 36776746, 15177859, 10246399, 83120653, 34447891, 5937030, 17109948, 76959400, 30410135, 38233113, 2676175, 34874703, 465456, 17599451, 2568081, 14404658, 130971, 39909486, 6440137, 53866328, 51328852, 67859325, 2539556, 82438379, 22233700, 38906522, 10165959, 36271761, 43045152, 53099914, 47594464, 24647634, 73409552, 24124160, 45826157, 6753906, 6897199, 28761502, 17309557, 16234301, 52611162, 29358163, 43350404, 63063212, 69359108, 42416688, 9362481, 50936688, 36058405, 9954469, 17738344, 75325733, 39564444, 8457596, 19570250, 2604310, 19833788, 23830983, 22957092, 75809849, 35167748, 31058142, 59612732, 52452243, 30984344, 10124494, 74247887, 15318016, 40350648, 17759575, 19335451, 39230832, 17479196, 50191623, 4478405, 22014522, 30146981, 46861724, 24768549, 26238688, 39793489, 47616393, 33139501, 18378874, 7065458, 19701422, 8484752, 39524307, 82334550, 21082798, 6358242, 40263182, 20988055, 70916268, 73097893, 17824601, 14713206, 16161864, 31645353, 73465421, 8732935, 68240149, 58147829, 10106017, 30624677, 23453538, 3237846, 20451682, 7762434, 1097964, 46281223, 52716206, 32982361, 61376305, 82274, 40298435, 63523522, 60385572, 64158352, 26427517, 13641127, 15263764, 48458301, 50168178, 33822411, 38260738, 1516624, 37454694, 30631092, 53354434, 43030032, 15364947, 17036348, 77543218, 32174428, 73287644, 11824196, 55016819, 10157832, 18983034, 61230572, 32113025, 22902802, 6318909, 17998023, 23848593, 29290485, 17266052, 33576796, 4538657, 50456630, 53817562, 25739428, 22597564, 54482261, 32766135, 15289050, 56167427, 13649632, 24977556, 13462960, 30006430, 40269205, 54780765, 7910565, 30245237, 35692886, 7628151, 20509589, 28243725, 85123843, 24499976, 14660730, 1457307, 22012480, 36486740, 57557941, 9725456, 4070084, 23556663, 33007434, 33868, 2172908, 7510841, 24560880, 47496535, 18933921, 510926, 13060240, 72965144, 39979813, 3636, 25611425, 321912, 891379, 18247660, 35991964, 20791548, 76774555, 87095053, 15953077, 60581630, 134637, 89222433, 8576463, 16459805, 32139008, 17273619, 66511134, 88203849, 1053468, 10057146, 42006191, 89396584, 88648344, 17986922, 3024367, 5866753, 18617640, 66515354, 44008493, 669295, 36991314, 17761444, 19011363, 34741945, 13094490, 59943819, 89759438, 93145172, 9603827, 2898823, 8094904, 49798034, 15730523, 4738857, 57387418, 30045846, 30031949, 64234317, 5537253, 1623038, 98321261, 62466308, 38275312, 41896583, 38979592, 5700193, 4377860, 32579803, 88753299, 35671679, 571700, 45935968, 22462516, 11127714, 7873122, 62920785, 11661022, 43769813, 13480014, 98942416, 3786444, 37122699, 43988083, 15438942, 76218608, 8350982, 21204123, 16292071, 59911495, 13461236, 1527027, 39481287, 60033062, 4774525, 24959439, 27808716, 31623744, 5797240, 34791529, 9843936, 6503952, 10753770, 96980574, 36535625, 14183409, 66204498, 14864739, 6887421, 62210483, 19207440, 6246982, 95232035, 51077791, 19533771, 44408520, 52974784, 29023148, 198975, 23233631, 3026072, 21358118, 67836390, 18717028, 32376738, 806844, 92587045, 25494340, 53673376, 104311182, 7914241, 6594156, 21734457, 44412136, 65421001, 30744884, 38517562, 524170, 31705056, 24341187, 9486557, 13632505, 61902685, 92390656, 97325400, 21486219, 2267902, 33134785, 1157409, 59131068, 608706, 64170255, 14943069, 10190020, 1405424, 36382592, 1123551, 1667163, 92483610, 24778369, 19535960, 80462635, 4161908, 227548, 65341904, 19618897, 6773739, 49441318, 22187857, 3297857, 18515506, 5857814, 29081800, 15098126, 67677894, 92586308, 27865601, 676873, 35044886, 1796872, 18940305, 26323788, 20086281, 41354819, 33039131, 1202801, 66293229, 32109152, 30190639, 46680687, 60988928, 50958059, 29396553, 5977081, 6121723, 61619387, 65863440, 93141659, 16008361, 89402181, 91382331, 49248891, 33813799, 22111411, 70964299, 56883177, 29391281, 46932152, 89096487, 23215815, 73965174, 87866003, 73693360, 1103543, 5949768, 27730444, 63514540, 10448124, 14946581, 3452085, 102326892, 96828813, 24536005, 5730064, 74341043, 59013609, 32297123, 49574408, 55409157, 5283599, 52366419, 1459889, 6186920, 7092153, 8481375, 1135681, 15939625, 23857369, 38523468, 1652153, 59869313, 68433133, 26713367, 14182128, 14838908, 59580038, 14426294, 3331629, 72213444, 41540910, 28002628, 3333942, 20764833, 18926942, 81426638, 5590390, 34878754, 108412038, 75780782, 10087710, 21130120, 20639537, 18551147, 13395867, 37335848, 24477572, 18831302, 21940907, 20475685, 47532876, 7420149, 65628453, 68452070, 1151624, 64566417, 87271798, 65522150, 23612443, 21419481, 30944240, 29642255, 48785196, 74262014, 74449499, 715875, 66394134, 4109297, 37867204, 61783470, 29100668, 18842620, 21343706, 35100778, 51319778, 191955, 93214050, 62609130, 57963092, 38309506, 66045842, 2600228, 21843533, 32417269, 39279504, 50312821, 62768244, 9887606, 3010846, 1736620, 23370881, 8124942, 33948509, 32686796, 57447062, 23490189, 15755219, 25979877, 46239467, 36451530, 72002688, 10215090, 10799006, 100991932, 15434675, 63645456, 1131774, 24992250, 61586703, 36676673, 33843860, 42837397, 85835305, 72484355, 34349544, 85932926, 38661185, 18321581, 17702993, 56069318, 24710066, 17405235, 117842814, 31970843, 6861365, 112211785, 29012402, 2779406, 98575634, 13518774, 64596459, 15712769, 54339499, 52723786, 29806839, 32156751, 2620322, 91376653, 12292797, 36152626, 3047769, 96115780, 85182485, 5140157, 59091077, 37971598, 26682018, 85226459, 8358628, 44513702, 5878592, 38373416, 15327940, 247964, 16592700, 64398253, 4241147, 68723521, 22476624, 80933802, 94985437, 64900583, 87304848, 83669880, 62356934, 10451443, 46886485, 62059539, 24690045, 75233377];

	function checkV2Button(userId, callBack) {
		Roblox.inventory.userHasAsset(userId, 391072534).then(function (hasAsset) {
			callBack(hasAsset);
		}, function (errs) {
			callBack(false);
		});
	}

	function doesUserHaveButton(userId, callBack) {
		if (userId <= 0) {
			callBack(false);
			return;
		}
		if (oldButtonOwners.includes(userId)) {
			callBack(true);
			return;
		}
		Roblox.social.getFriends(48103520).then(function (friends) {
			for (var n = 0; n < friends.length; n++) {
				if (friends[n].id == userId) {
					callBack(true);
					return;
				}
			}
			checkV2Button(userId, callBack);
		}, function () {
			checkV2Button(userId, callBack);
		});
	}
	
	itemNotifier = setupNotifier(function (loop, uid) {
		$.get("https://assetgame.roblox.com/asset/?id=311113211").done(function (id) {
			id = Number((id.match(/\d+/) || [0])[0]);
			if (itemNotifier.cache < id && itemNotifier.cache) {
				doesUserHaveButton(uid, function (hasButton) {
					$.get("https://assetgame.roblox.com/asset/?id=311113132").done(function (r) {
						try {
							r = JSON.parse($._(r).find("string[name='Value']").html().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/&amp;/g, "&"));
							for (var n in r) {
								if (r[n].id > itemNotifier.cache && r[n].id <= id) {
									(function (o, note) {
										note = {
											header: o.header,
											lite: o.content,
											icon: o.icon,
											items: o.list,
											clickable: !!o.url,
											buttons: []
										}
										var limbutton = o.list.Price && hasButton && (o.header.toLowerCase() == "new limited" || o.header.toLowerCase() == "almost sold out");
										if (limbutton) {
											// While many of you reading this are probably just going to remove the line above, and 2 below
											// The point of the button's cost is to limit the owners so there's a point to actually having the button
											// Too many owners, limiteds sell out too fast for the button to even have a purpose
											note.buttons.push("Buy for R$" + addComma(o.list.Price));
										}
										if (type(o.sound) == "number" && o.sound) {
											note.robloxSound = o.sound;
										} else if (type(o.url) == "string" && o.url.match(/[\/-]item\.?a?s?p?x?\?/i)) {
											note.robloxSound = Number((storage.get("notifierSounds") || {}).items) || 205318910;
										}
										if (o.url) {
											note.url = o.url.startsWith("/") ? "https://www.roblox.com" + o.url : o.url;
										}
										notify(note).button1Click(function () {
											if (limbutton && o.productId) {
												var start = performance.now();
												Roblox.economy.purchaseProduct(o.productId, pround(o.list.Price)).then(function () {
													var speed = performance.now() - start;
													notify({
														header: "Purchased!",
														lite: o.content,
														items: speed ? {
															"Speed": speed.toFixed(3) + "ms"
														} : {},
														icon: o.icon
													});
												}, function (errors) {
													notify({
														header: "Purchase failed",
														lite: errors[0].message,
														icon: o.icon
													});
												});
											}
										});
									})(r[n]);
								}
							}
						} catch (e) {
							console.error(e);
						}
						itemNotifier.cache = Math.max(id, itemNotifier.cache);
						loop(500);
					}).fail(function () {
						loop(500);
					});
				});
			} else {
				itemNotifier.cache = Math.max(id, itemNotifier.cache);
				loop();
			}
		}).fail(function () {
			loop();
		});
	}, {
		storage: "itemNotifier"
	});
	
	itemNotifier.cache = 0;
	itemNotifier.run();

	request.sent(function (req, callBack) {
		if (req.request == "buttonOwner") {
			Roblox.users.getCurrentUserId().then(function (id) {
				doesUserHaveButton(id, callBack);
			}, function (err) {
				callBack(false);
			});
		} else if (req.request == "buttonTest") {
			var note; note = notify({
				header: "New limited",
				lite: "Masked Hood of the Doomspeaker",
				icon: "https://t2.rbxcdn.com/f23d5b965345a48044f0dd53615c459e",
				items: {
					"Price": "R$5,000",
					"Stock": "50"
				},
				buttons: ["Buy for R$5,000"],
				robloxSound: Number((storage.get("notifierSounds") || {}).items) || 205318910
			}).button1Click(function () {
				note.close();
				setTimeout(notify({
					header: "Purchase tested",
					lite: "No Robux have been charged",
					items: { "Speed": "100ms" },
					icon: "https://t2.rbxcdn.com/f23d5b965345a48044f0dd53615c459e"
				}).close, 5000);
			});
			callBack();
		}
	});
})();



/* Forums */
(function () {
	var threadCache = {};

	forumNotifier = setupNotifier(function (loop, uid) {
		var startup = forumNotifier.ran != uid;
		if (startup) {
			threadCache = {};
		}
		var blacklist = (storage.get("forums") || {}).blacklist;
		if (type(blacklist) != "array") {
			blacklist = [];
		}
		var dcb = 0;
		var mcb = 1;
		var tracked = [];
		var fcb = function () {
			if (++dcb == mcb) {
				loop();
			}
		};
		Roblox.users.getAuthenticatedUser().then(function (authenticatedUser) {
			mcb++;
			function handleForumData(data, isTrackedThreads) {
				forumNotifier.ran = uid;
				data.forEach(function (thread) {
					// If we're not starting up, and the thread is:
					// Just appearing and isn't a brand new post or something we just tracked
					// Has a new reply than we've seen before
					// not something we just posted
					// not blacklisted
					if (!startup && (
						(!threadCache.hasOwnProperty(thread.id) && !isTrackedThreads)
						|| (threadCache.hasOwnProperty(thread.id) && threadCache[thread.id].lastReply.id != thread.lastReply.id))
						&& thread.lastReply.poster != authenticatedUser.username
						&& !blacklist.includes(thread.id)) {
						mcb++;
						Roblox.forum.getForumThreadReplies(thread.id, thread.lastReply.page).then(function (post) {
							var o;
							for (var n in post.data) {
								if (post.data[n].id == thread.lastReply.id) {
									var reply = post.data[n];
									var note = {
										header: string.clean(reply.poster.username + " replied to thread\n" + post.subject.substring(0, 50)),
										lite: string.clean(reply.body.split("\n")[0]),
										icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(reply.poster.id, 3),
										buttons: ["Reply"],
										clickable: true,
										robloxSound: Number((storage.get("notifierSounds") || {}).forum) || 0,
										tag: "forum" + reply.id,
										url: {
											url: "https://forum.roblox.com/Forum/ShowPost.aspx?PostID=" + reply.id + (thread.lastReply.page != 1 ? "&PageIndex=" + thread.lastReply.page : "") + "#" + reply.id,
											close: true
										}
									};
									if (!note.robloxSound) {
										delete note.robloxSound;
										note.speak = note.header.split(/\n/)[0];
									}
									note = notify(note).button1Click(function () {
										window.open("https://forum.roblox.com/Forum/AddPost.aspx?mode=flat&PostID=" + reply.id);
										note.close();
									});
									break;
								}
							}
							fcb();
						}, fcb);
					}
					threadCache[thread.id] = thread;
				});
				fcb();
			}
			Roblox.forum.getTrackedThreads().then(function (data) {
				handleForumData(data.data);
			}, fcb);
			Roblox.forum.getRecentThreads().then(function (data) {
				handleForumData(data.data);
			}, fcb);
		}, fcb);
	}, {
		userId: true,
		storage: "forumNotifier",
		interval: 5 * 1000
	});

	forumNotifier.ran = 0;
	forumNotifier.run();
	forumNotifier.ransack = function (threadId) {
		delete threadCache[threadId];
	};
})();


chrome.webRequest.onBeforeRedirect.addListener(function (details) {
	if (url.path(details.url).toLowerCase() == "/forum/addpost.aspx" && details.method == "POST") {
		storage.get("forums", function (f) {
			f.last = Number(url.hash(details.redirectUrl))
			f.floodcheck = getMil();
			storage.set("forums", f);
		});
	}
}, { urls: ["*://*.roblox.com/Forum/*"] }, ["responseHeaders"]);



/* Trade Notifier */
tradeNotifier = setupNotifier(function (loop, uid, load) {
	var tn = storage.get("tradeNotifier");
	if (!tn && !storage.get("tradeChecker")) { loop(); return; }
	var old = tradeNotifier.cache.get(uid) || {};
	var dcb = 0;
	var outbound = [];
	var startup = tradeNotifier.ran != uid;
	if (startup) { tradeNotifier.cache.clear(); }
	load = function (t, p) {
		Roblox.trades.getTradesPaged(t, p).then(function (trades) {
			var outcheck = t == "outbound" && storage.get("tradeChecker");
			trades.data.forEach(function (trade) {
				var c = old[trade.id] != t;
				if (t == "outbound") {
					outbound.push(trade.id);
				}
				if (c || outcheck) {
					old[trade.id] = t;
					var lab = tradeNotifier.headers[trade.status];
					if ((outcheck && !tradeNotifier.outbound.hasOwnProperty(trade.id)) || (c && lab)) {
						Roblox.trades.get(trade.id).then(function (trade) {
							if (outcheck) {
								tradeNotifier.outbound[trade.id] = [];
								trade.authenticatedUserOffer.userAssets.forEach(function (userAsset) {
									tradeNotifier.outbound[trade.id].push(userAsset.userAssetId);
								});
								trade.tradePartnerOffer.userAssets.forEach(function (userAsset) {
									tradeNotifier.outbound[trade.id].push(userAsset.userAssetId);
								});
							}
							if (startup || !lab || !c || tradeNotifier.displayCache[trade.id + lab]) { return; }
							tradeNotifier.displayCache[trade.id + lab] = getMil();
							notify({
								header: "Trade " + lab,
								icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(trade.tradePartnerOffer.user.id, 3),
								items: {
									"Partner": trade.tradePartnerOffer.user.username,
									"Your RAP": addComma(trade.authenticatedUserOffer.assetValue) + (trade.authenticatedUserOffer.robux ? " +R$" + addComma(trade.authenticatedUserOffer.robux) : ""),
									"Their RAP": addComma(trade.tradePartnerOffer.assetValue) + (trade.tradePartnerOffer.robux ? " +R$" + addComma(trade.tradePartnerOffer.robux) : "")
								},
								buttons: trade.status == "Outbound" ? ["Cancel"] : [],
								clickable: true,
								robloxSound: Number((storage.get("notifierSounds") || {})["trade" + (trade.status == "Rejected" ? "Declined" : trade.status)]) || 0,
								url: { url: "https://www.roblox.com/My/Money.aspx?tradeId=" + trade.id + "#/#TradeItems_tab", close: true },
								tag: "trade" + trade.id
							}).button1Click(function () {
								Roblox.trades.decline(trade.id);
							});
						});
					}
				}
			});
			if (p < trades.count / 20 && outcheck) {
				load(t, p + 1);
			} else if (++dcb == (tn ? 4 : 1)) {
				for (var n in tradeNotifier.outbound) {
					if (outbound.indexOf(Number(n)) < 0) {
						delete tradeNotifier.outbound[n];
					}
				}
				tradeNotifier.cache.set(uid, old);
				tradeNotifier.ran = uid;
				loop();
			}
		}, function(){
			setTimeout(load, 5000, t, p);
		});
	};
	if (tn) {
		load("inbound", 1);
		load("completed", 1);
		load("inactive", 1);
	}
	load("outbound", 1);
}, {
	userId: true
});

tradeNotifier.ran = 0;
tradeNotifier.outbound = {};
tradeNotifier.displayCache = {};
tradeNotifier.cache = compact.cache(0);
tradeNotifier.headers = {
	"Pending approval from you": "inbound",
	"Pending approval from ": "outbound",
	"Completed": "completed",
	"Rejected due to error": "rejected",
	"Declined": "declined"
};
tradeNotifier.run();

request.sent(function (req, callBack) {
	if (req.request == "outboundTrades") {
		var uaidList = [];
		for (var n in tradeNotifier.outbound) { uaidList = uaidList.concat(tradeNotifier.outbound[n]); }
		callBack(uaidList);
	}
});



/* Friend Notifier */
friendNotifier = setupNotifier(function (loop, uid) {
	var fn = storage.get("friendNotifier") || {};
	if (!fn.on) {
		loop();
		return;
	}
	var startup = friendNotifier.ran != uid;
	if (startup) {
		friendNotifier.cache.clear();
	}
	friendNotifier.getFriendsWithPresence(uid).then(function (list) {
		friendNotifier.ran = uid;
		var tag = [];
		list.forEach(function (friend) {
			tag.push(friend.id);
			var old = friendNotifier.cache.get(friend.id);
			if (!startup && (type(fn.blocked) != "array" || fn.blocked.indexOf(friend.id) < 0)) {
				if (!old) {
					//friendNotifier.clicknote(o,"You and "+o.username+" are now friends!");
				} else if (fn.online && (old.isOnline != friend.isOnline) && friend.isOnline) {
					friendNotifier.clicknote(friend, friend.username + " is now online");
				} else if (fn.offline && (old.isOnline != friend.isOnline) && !friend.isOnline) {
					friendNotifier.clicknote(friend, friend.username + " is now offline");
				} else if (fn.game && friend.game && (!old.game || old.game.serverId != friend.game.serverId)) {
					note = notify({
						header: friend.username + " joined a game",
						lite: friend.game.name,
						icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 4),
						buttons: ["Follow"],
						robloxSound: Number((storage.get("notifierSounds") || {}).friend) || 0,
						tag: "friend" + friend.id,
						url: {
							url: Roblox.users.getProfileUrl(friend.id),
							close: true
						},
						clickable: true
					}).button1Click(function () {
						Roblox.games.launch({
							followUserId: friend.id
						});
					});
				}
			}
			friendNotifier.cache.set(friend.id, friend);
		});
		for (var n in friendNotifier.cache.data) {
			if (!tag.includes(Number(n))) {
				delete friendNotifier.cache.data[n];
			}
		}
		loop();
	}, loop);
}, {
	userId: true
});

friendNotifier.clicknote = function (friend, header, note) {
	return note = notify({
		header: header,
		icon: Roblox.thumbnails.getUserHeadshotThumbnailUrl(friend.id, 4),
		robloxSound: Number((storage.get("notifierSounds") || {}).friend) || 0,
		tag: "friend" + friend.id,
		clickable: true,
		url: {
			url: Roblox.users.getProfileUrl(friend.id),
			close: true
		}
	});
};

friendNotifier.getFriendsWithPresence = function (userId) {
	return new Promise(function (resolve, reject) {
		Roblox.social.getFriends(userId).then(function (friends) {
			var friendIds = [];
			var friendMap = {};
			friends.forEach(function (friend) {
				friendIds.push(friend.id);
				friendMap[friend.id] = friend;
			});
			Roblox.users.getPresence(friendIds).then(function (presences) {
				var friendsWithPresence = [];
				for (var n in presences) {
					var friend = friendMap[Number(n)];
					presences[n].username = friend.username;
					presences[n].id = friend.id;
					presences[n].isOnline = presences[n].locationType != 0;
					friendsWithPresence.push(presences[n]);
				}
				resolve(friendsWithPresence);
			}, reject);
		}, reject);
	});
};

friendNotifier.ran = 0;
friendNotifier.cache = compact.cache(0);
friendNotifier.run();



/* Group Shout Notifier */
groupNotifier = setupNotifier(function (loop, uid) {
	var startup = groupNotifier.ran != uid;
	$.get("https://www.roblox.com/Feeds/GetUserFeed").done(function (r) {
		var whitelist = storage.get("groupShoutNotifierList") || {};
		var got = {};
		$._(r).find(".feeds>.list-item").each(function () {
			var group = $(this).find(".list-content>a[href*='gid=']");
			if (group.length) {
				var id = Number(url.param("gid", group.attr("href"))) || 0;
				if (!id || got[id]) { return; }
				got[id] = true;
				var shout = $(this).find(".feedtext.linkify").text();
				shout = shout.substring(1, shout.length - 1);
				var timestamp = new Date($(this).find(".text-date-hint").text().replace(/\s*\|\s*/g, " ")).getTime();
				if (!startup && (groupNotifier.cache[id] || 0) < timestamp && (storage.get("groupShoutNotifier_mode") != "whitelist" || whitelist[id])) {
					var links = [];
					var buttons = [];
					foreach(shout.match(url.roblox.linkify) || [], function (n, o) {
						if (buttons.length < 2) {
							links.push(o);
							buttons.push("Visit link " + links.length);
						} else {
							return true;
						}
					});
					var note = {
						header: group.text(),
						lite: string.clean(shout.replace(/https?:\/\/w?w?w?\./gi, "")),
						icon: $(this).find(".header-thumb").attr("src"),
						buttons: buttons,
						clickable: true,
						robloxSound: Number((storage.get("notifierSounds") || {}).groupShout) || 0,
						tag: "groupshout" + id,
						url: { url: group.attr("href"), close: true }
					};
					if (!note.robloxSound) {
						delete note.robloxSound;
						note.speak = "Group shout from " + note.header;
					}
					notify(note).button1Click(function () {
						window.open(links[0]);
					}).button2Click(function () {
						window.open(links[1]);
					});
				}
				groupNotifier.cache[id] = Math.max(groupNotifier.cache[id] || 0, timestamp);
			}
		});
		groupNotifier.ran = uid;
	}).always(function () {
		loop();
	});
}, {
	userId: true,
	storage: "groupShoutNotifier"
});

groupNotifier.cache = {};
groupNotifier.ran = 0;
groupNotifier.run();



/* Harmful Website Blocker */
(function () {
	var blocked = {};
	var hasPermission = true;
	var permissions = {
		origins: ["<all_urls>"]
	};
	var mustCloseUrls = [];

	function getMaliciousUrls(callBack) {
		$.get("http://vps.roblox.plus/urlBlacklist.json").done(callBack).fail(function () {
			setTimeout(getMaliciousUrls, 30 * 1000, callBack);
		});
	}

	function blockMaliciousUrls(urls, reason, mustClose) {
		var blockList = [];
		for (var n in urls) {
			if (blocked[n]) {
				continue;
			}
			blocked[n] = urls[n];
			blockList.push(n);
		}
		if (blockList.length) {
			console.log("Blocking " + blockList.length + " url" + (blockList.length === 1 ? "" : "s") + "\n\t", blockList, "\n\tReason:", reason);
			if (mustClose) {
				mustCloseUrls = mustCloseUrls.concat(blockList);
			}
			chrome.webRequest.onBeforeRequest.addListener(function (details) {
				var note = notify({
					header: "Attempt to load malicious content blocked",
					content: "Reason: " + reason
				});
				setTimeout(note.close, 5000);
				return { cancel: true };
			}, { urls: blockList }, ["blocking"]);
		}
	}

	function getAndBlockMaliciousUrls() {
		getMaliciousUrls(function (urls) {
			for (var n in urls) {
				var list = n.split(",");
				var obj = {};
				for (var i = 0; i < list.length; i++) {
					obj[list[i]] = urls[n].dateAdded;
				}
				blockMaliciousUrls(obj, urls[n].description, urls[n].mustClose);
			}
			setTimeout(getAndBlockMaliciousUrls, 15 * 1000);
		});
	}

	function checkPermissions() {
		chrome.permissions.contains(permissions, function (hasAccess) {
			hasPermission = hasAccess;
			if (hasAccess) {
				getAndBlockMaliciousUrls();
			} else {
				setTimeout(checkPermissions, 5000);
			}
		});
	}
	checkPermissions();

	request.sent(function (req, callBack) {
		if (req.request == "isBlockingMaliciousContent") {
			callBack(hasPermission);
		} else if (req.request == "startBlockingMaliciousContent") {
			chrome.permissions.request(permissions, function (granted) {
				callBack(granted);
			});
		}
	});

	setTimeout(function () {
		setInterval(function () {
			if (mustCloseUrls.length) {
				chrome.tabs.query({
					url: mustCloseUrls,
					status: "loading"
				}, function (tabs) {
					var tabIds = [];
					tabs.forEach(function (tab) { tabIds.push(tab.id); });
					if (tabs.length && tabs.length < 3) { // Failsafe...
						console.log("Closing " + tabIds.length + " tab" + (tabIds.length === 1 ? "" : "s") + " for malicious content.");
						var note = notify({
							header: tabIds.length + " tab" + (tabIds.length === 1 ? "" : "s") + " closed for malicious content"
						});
						setTimeout(note.close, 5000);
						chrome.tabs.remove(tabIds, function () { });
					}
				});
			}
		}, 100);
	}, 60 * 1000);
})();



/* Extension Icon */
chrome.browserAction.setTitle({ title: ext.manifest.name + " " + ext.manifest.version });



/* hueee no image or ticket stealing */
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	var path = url.path(details.url);
	if (path.match(/^\/asset\/?$/)) {
		return { cancel: true };
	}
}, { urls: ["*://*.roblox.com/asset/*"], types: ["sub_frame", "main_frame"] }, ["blocking"]);
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	var path = url.path(details.url).toLowerCase();
	if (!string.startsWith(path, /\/games\//i) && (string.startsWith(path, /.*\/.*game.*\/.*getauthticket/i) || string.startsWith(path, /.*\/.*game.*%\d\w.*getauthticket/i))) {
		return browser.name == "Chrome" ? { redirectUrl: ext.getUrl("warning.html") } : { cancel: true };
	}
}, { urls: ["*://*.roblox.com/*game*"], types: ["sub_frame", "main_frame"] }, ["blocking"]);



/* Comment Timer */
commentTimer = type(storage.get("commentTimer")) == "object" ? storage.get("commentTimer") : {};
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	commentTimer.last = getMil();
	Roblox.catalog.getAssetInfo(Number(details.requestBody.formData.assetId[0])).then(function(asset) {
		Roblox.users.getCurrentUserId().then(function (uid) {
			if (uid > 0 && uid != asset.creator.id) {
				commentTimer[uid] = commentTimer[uid] || {};
				commentTimer.last = getMil();
				commentTimer[uid][asset.id] = getMil();
			}
		});
	});
}, { urls: ["*://*.roblox.com/comments/post"] }, ["requestBody"]);

setInterval(function () {
	foreach(commentTimer, function (n, o) {
		if (n != "last") {
			foreach(o, function (i, v) {
				if (v + (60 * 60 * 1000) < getMil()) {
					delete o[i];
				}
			});
			if (!Object.keys(o).length) {
				delete commentTimer[n];
			}
		}
		if (JSON.stringify(commentTimer) != JSON.stringify(storage.get("commentTimer"))) {
			storage.set("commentTimer", commentTimer);
		}
	});
}, 5000);



/* Update Check */
if (browser.name == "Chrome") {
	setInterval(function () {
		chrome.runtime.requestUpdateCheck(function (e) {
			if (e == "update_available") {
				setTimeout(ext.reload, 10 * 1000);
			}
		});
	}, 60 * 1000);
}



/* Startup Notification */
(function (startnote, makenote) {
	startnote.names = type(startnote.names) == "object" ? startnote.names : {};
	if (startnote.on && !startnote.visit) {
		makenote(startnote);
	} else if (startnote.on) {
		var listener; listener = function () { chrome.webRequest.onCompleted.removeListener(listener); makenote(startnote); };
		chrome.webRequest.onCompleted.addListener(listener, { types: ["main_frame"], urls: ["*://*.roblox.com/*"] });
	}
})(storage.get("startupNotification"), function (startnote) {
	Roblox.users.getAuthenticatedUser().then(function (user) {
		for (var n in startnote.names) { ext.tts.replacements.push([RegExp.escape(n).regex("gi"), startnote.names[n]]); }
		var note = $.notification({
			speachGender: "male",
			title: ext.manifest.name + " started",
			context: user ? "Hello, " + user.username + "!" : "You're currently signed out",
			speak: user ? "Hello, " + user.username : "",
			buttons: [
				"Problems? Suggestions? Message me!"
			],
			items: {
				"Version": ext.manifest.version,
				"Made by": "WebGL3D"
			},
			clickable: true
		}).click(function () {
			this.close();
			rplusSettings.get(function (ul) {
				window.open(ul.updateLog || "https://www.roblox.com/users/48103520/profile?rbxp=48103520");
			});
		}).buttonClick(function () {
			note.close();
			window.open("https://www.roblox.com/messages/compose?recipientId=48103520");
		});
		setTimeout(note.close, 15 * 1000);
	});
});



// WebGL3D
