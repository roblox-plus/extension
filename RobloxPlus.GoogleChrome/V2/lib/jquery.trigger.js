/*
	jquery.trigger.js [10/08/2016]
	Adds event methods to an object, and given a namespace can broadcast an event to all content scripts, and the background page.
	Event methods include:
	on(event, callBack(...)); // Will listen for when "event" is triggered, and fire the callBack with the arguments it was triggered with
	on(callBack(event, ...)); // Will fire the callBack any time an event is triggered, the first argument will always be the event that was triggered followed by the arguments it was triggered with.
	trigger(event[, ...]); // Will fire the event 'event' with the given arguments (if any)
	trigger.before(callBack(args)); // Will fire before event listeners, if broadcasted will fire after broadcast. If you need to edit event data before listeners fire do it here. This method must return an 'args' array. These 'args' are given to the listeners
	trigger.raw(event, avoidListener[, ...]); // Will fire the event for all listeners excluding the specified listener.
	trigger.disconnect(); // Disconnects all event listeners, and prevents anymore from being added.
*/
$.addTrigger = (function () {
	var triggerModifiers = [];

	function addTrigger(obj, namespace) {
		var events = {};
		var callBacks = [];
		var beforeTrigger = {};
		var disconnected = false;

		obj.on = function (event, callBack) {
			if (disconnected) {
				return obj;
			}

			if (typeof (event) == "function") {
				callBacks.push(event);
				return obj;
			}
			if (!events.hasOwnProperty(event)) {
				events[event] = [];
			}
			events[event].push(callBack);

			return obj;
		};

		obj.once = function (event, callBack) {
			if (disconnected) {
				return obj;
			}

			if (!events.hasOwnProperty(event)) {
				events[event] = [];
			}
			callBack.once = true;
			events[event].push(callBack);

			return obj;
		};

		obj.trigger = function (event) {
			if (disconnected) {
				return obj;
			}

			var args = global.parseArguments(arguments, 1);
			for (var n in beforeTrigger[event] || []) {
				args = beforeTrigger[event][n].apply(obj, args);
			}

			if (events.hasOwnProperty(event)) {
				var useFirstArgsArg = global.parseArguments(args, 1);
				for (var n = events[event].length - 1; n >= 0; n--) {
					if (obj.trigger.useFirstArgumentAsThisEnabled) {
						events[event][n].apply(args[0], useFirstArgsArg);
					} else {
						events[event][n].apply(obj, args);
					}
					if (events[event][n].once) {
						events[event].splice(n, 1);
					}
				}
			}
			var globalArgs = [event].concat(args);
			for (var n in callBacks) {
				if (obj.trigger.useFirstArgumentAsThisEnabled) {
					callBacks[n].apply(globalArgs[1], global.parseArguments(globalArgs, 2, [globalArgs[0]]));
				} else {
					callBacks[n].apply(obj, globalArgs);
				}
			}

			return obj;
		};

		obj.trigger.before = function (event, callBack) {
			if (disconnected) {
				return obj;
			}

			(beforeTrigger[event] = beforeTrigger[event] || []).push(callBack);

			return obj;
		};

		obj.trigger.raw = function (event, avoid) {
			if (disconnected) {
				return obj;
			}

			var args = global.parseArguments(arguments, 2);
			for (var n in beforeTrigger[event] || []) {
				args = beforeTrigger[event][n].apply(obj, args);
			}

			if (events.hasOwnProperty(event)) {
				var useFirstArgsArg = global.parseArguments(args, 1);
				for (var n = events[event].length - 1; n >= 0; n--) {
					if (events[event][n] != avoid) {
						if (obj.trigger.useFirstArgumentAsThisEnabled) {
							events[event][n].apply(args[0], useFirstArgsArg);
						} else {
							events[event][n].apply(obj, args);
						}
						if (events[event][n].once) {
							events[event].splice(n, 1);
						}
					}
				}
			}
			var globalArgs = [event].concat(args);
			for (var n in callBacks) {
				if (callBacks[n] != avoid) {
					if (obj.trigger.useFirstArgumentAsThisEnabled) {
						callBacks[n].apply(globalArgs[1], global.parseArguments(globalArgs, 2, [globalArgs[0]]));
					} else {
						callBacks[n].apply(obj, globalArgs);
					}
				}
			}

			return obj;
		};

		obj.trigger.disconnect = function () {
			disconnected = true;
			delete callBacks;
			delete events;
			delete beforeTrigger;
			return obj;
		};

		obj.isConnected = function () {
			return !disconnected;
		};

		obj.getNamespace = function () {
			return namespace || "";
		};

		triggerModifiers.forEach(function (callBack) {
			callBack(obj);
		});

		return obj;
	};

	addTrigger.init = function (callBack) {
		if (typeof (callBack) == "function") {
			triggerModifiers.push(callBack);
		}
	};

	return addTrigger;
})();


// WebGL3D
