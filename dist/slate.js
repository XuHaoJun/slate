(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Slate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var copy             = require('es5-ext/object/copy')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , map              = require('es5-ext/object/map')
  , callable         = require('es5-ext/object/valid-callable')
  , validValue       = require('es5-ext/object/valid-value')

  , bind = Function.prototype.bind, defineProperty = Object.defineProperty
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , define;

define = function (name, desc, options) {
	var value = validValue(desc) && callable(desc.value), dgs;
	dgs = copy(desc);
	delete dgs.writable;
	delete dgs.value;
	dgs.get = function () {
		if (!options.overwriteDefinition && hasOwnProperty.call(this, name)) return value;
		desc.value = bind.call(value, options.resolveContext ? options.resolveContext(this) : this);
		defineProperty(this, name, desc);
		return this[name];
	};
	return dgs;
};

module.exports = function (props/*, options*/) {
	var options = normalizeOptions(arguments[1]);
	if (options.resolveContext != null) ensureCallable(options.resolveContext);
	return map(props, function (desc, name) { return define(name, desc, options); });
};

},{"es5-ext/object/copy":18,"es5-ext/object/map":26,"es5-ext/object/normalize-options":27,"es5-ext/object/valid-callable":32,"es5-ext/object/valid-value":33}],2:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":15,"es5-ext/object/is-callable":21,"es5-ext/object/normalize-options":27,"es5-ext/string/#/contains":34}],3:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":4,"_process":68}],4:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":67}],5:[function(require,module,exports){
'use strict';

var GROUP_LEFT_TO_RIGHT,
    GROUP_RIGHT_TO_LEFT,
    EXPRESSION_LEFT_TO_RIGHT,
    EXPRESSION_RIGHT_TO_LEFT;

/*
 * Character ranges of left-to-right characters.
 */

GROUP_LEFT_TO_RIGHT = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6' +
    '\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C' +
    '\uFE00-\uFE6F\uFEFD-\uFFFF';

/*
 * Character ranges of right-to-left characters.
 */

GROUP_RIGHT_TO_LEFT = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';

/*
 * Expression to match a left-to-right string.
 *
 * Matches the start of a string, followed by zero or
 * more non-right-to-left characters, followed by a
 * left-to-right character.
 */

EXPRESSION_LEFT_TO_RIGHT = new RegExp(
    '^[^' + GROUP_RIGHT_TO_LEFT + ']*[' + GROUP_LEFT_TO_RIGHT + ']'
);

/*
 * Expression to match a right-to-left string.
 *
 * Matches the start of a string, followed by zero or
 * more non-left-to-right characters, followed by a
 * right-to-left character.
 */

EXPRESSION_RIGHT_TO_LEFT = new RegExp(
    '^[^' + GROUP_LEFT_TO_RIGHT + ']*[' + GROUP_RIGHT_TO_LEFT + ']'
);

/**
 * Detect the direction of text.
 *
 * @param {string} value - value to stringify and check.
 * @return {string} - One of `"rtl"`, `"ltr"`, or
 *   `"neutral"`.
 */
function direction(value) {
    value = value.toString();

    if (EXPRESSION_RIGHT_TO_LEFT.test(value)) {
        return 'rtl';
    }

    if (EXPRESSION_LEFT_TO_RIGHT.test(value)) {
        return 'ltr';
    }

    return 'neutral';
}

/*
 * Expose `direction`.
 */

module.exports = direction;

},{}],6:[function(require,module,exports){
// Inspired by Google Closure:
// http://closure-library.googlecode.com/svn/docs/
// closure_goog_array_array.js.html#goog.array.clear

'use strict';

var value = require('../../object/valid-value');

module.exports = function () {
	value(this).length = 0;
	return this;
};

},{"../../object/valid-value":33}],7:[function(require,module,exports){
'use strict';

var toPosInt = require('../../number/to-pos-integer')
  , value    = require('../../object/valid-value')

  , indexOf = Array.prototype.indexOf
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , abs = Math.abs, floor = Math.floor;

module.exports = function (searchElement/*, fromIndex*/) {
	var i, l, fromIndex, val;
	if (searchElement === searchElement) { //jslint: ignore
		return indexOf.apply(this, arguments);
	}

	l = toPosInt(value(this).length);
	fromIndex = arguments[1];
	if (isNaN(fromIndex)) fromIndex = 0;
	else if (fromIndex >= 0) fromIndex = floor(fromIndex);
	else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));

	for (i = fromIndex; i < l; ++i) {
		if (hasOwnProperty.call(this, i)) {
			val = this[i];
			if (val !== val) return i; //jslint: ignore
		}
	}
	return -1;
};

},{"../../number/to-pos-integer":13,"../../object/valid-value":33}],8:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call((function () { return arguments; }()));

module.exports = function (x) { return (toString.call(x) === id); };

},{}],9:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Math.sign
	: require('./shim');

},{"./is-implemented":10,"./shim":11}],10:[function(require,module,exports){
'use strict';

module.exports = function () {
	var sign = Math.sign;
	if (typeof sign !== 'function') return false;
	return ((sign(10) === 1) && (sign(-20) === -1));
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	value = Number(value);
	if (isNaN(value) || (value === 0)) return value;
	return (value > 0) ? 1 : -1;
};

},{}],12:[function(require,module,exports){
'use strict';

var sign = require('../math/sign')

  , abs = Math.abs, floor = Math.floor;

module.exports = function (value) {
	if (isNaN(value)) return 0;
	value = Number(value);
	if ((value === 0) || !isFinite(value)) return value;
	return sign(value) * floor(abs(value));
};

},{"../math/sign":9}],13:[function(require,module,exports){
'use strict';

var toInteger = require('./to-integer')

  , max = Math.max;

module.exports = function (value) { return max(0, toInteger(value)); };

},{"./to-integer":12}],14:[function(require,module,exports){
// Internal method, used by iteration functions.
// Calls a function for each key-value pair found in object
// Optionally takes compareFn to iterate object in specific order

'use strict';

var callable = require('./valid-callable')
  , value    = require('./valid-value')

  , bind = Function.prototype.bind, call = Function.prototype.call, keys = Object.keys
  , propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

module.exports = function (method, defVal) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable(cb);

		list = keys(obj);
		if (compareFn) {
			list.sort((typeof compareFn === 'function') ? bind.call(compareFn, obj) : undefined);
		}
		if (typeof method !== 'function') method = list[method];
		return call.call(method, list, function (key, index) {
			if (!propertyIsEnumerable.call(obj, key)) return defVal;
			return call.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

},{"./valid-callable":32,"./valid-value":33}],15:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":16,"./shim":17}],16:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],17:[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":23,"../valid-value":33}],18:[function(require,module,exports){
'use strict';

var assign = require('./assign')
  , value  = require('./valid-value');

module.exports = function (obj) {
	var copy = Object(value(obj));
	if (copy !== obj) return copy;
	return assign({}, obj);
};

},{"./assign":15,"./valid-value":33}],19:[function(require,module,exports){
// Workaround for http://code.google.com/p/v8/issues/detail?id=2804

'use strict';

var create = Object.create, shim;

if (!require('./set-prototype-of/is-implemented')()) {
	shim = require('./set-prototype-of/shim');
}

module.exports = (function () {
	var nullObject, props, desc;
	if (!shim) return create;
	if (shim.level !== 1) return create;

	nullObject = {};
	props = {};
	desc = { configurable: false, enumerable: false, writable: true,
		value: undefined };
	Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
		if (name === '__proto__') {
			props[name] = { configurable: true, enumerable: false, writable: true,
				value: undefined };
			return;
		}
		props[name] = desc;
	});
	Object.defineProperties(nullObject, props);

	Object.defineProperty(shim, 'nullPolyfill', { configurable: false,
		enumerable: false, writable: false, value: nullObject });

	return function (prototype, props) {
		return create((prototype === null) ? nullObject : prototype, props);
	};
}());

},{"./set-prototype-of/is-implemented":30,"./set-prototype-of/shim":31}],20:[function(require,module,exports){
'use strict';

module.exports = require('./_iterate')('forEach');

},{"./_iterate":14}],21:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],22:[function(require,module,exports){
'use strict';

var map = { 'function': true, object: true };

module.exports = function (x) {
	return ((x != null) && map[typeof x]) || false;
};

},{}],23:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":24,"./shim":25}],24:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],25:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],26:[function(require,module,exports){
'use strict';

var callable = require('./valid-callable')
  , forEach  = require('./for-each')

  , call = Function.prototype.call;

module.exports = function (obj, cb/*, thisArg*/) {
	var o = {}, thisArg = arguments[2];
	callable(cb);
	forEach(obj, function (value, key, obj, index) {
		o[key] = call.call(cb, thisArg, value, key, obj, index);
	});
	return o;
};

},{"./for-each":20,"./valid-callable":32}],27:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],28:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

module.exports = function (arg/*, …args*/) {
	var set = create(null);
	forEach.call(arguments, function (name) { set[name] = true; });
	return set;
};

},{}],29:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.setPrototypeOf
	: require('./shim');

},{"./is-implemented":30,"./shim":31}],30:[function(require,module,exports){
'use strict';

var create = Object.create, getPrototypeOf = Object.getPrototypeOf
  , x = {};

module.exports = function (/*customCreate*/) {
	var setPrototypeOf = Object.setPrototypeOf
	  , customCreate = arguments[0] || create;
	if (typeof setPrototypeOf !== 'function') return false;
	return getPrototypeOf(setPrototypeOf(customCreate(null), x)) === x;
};

},{}],31:[function(require,module,exports){
// Big thanks to @WebReflection for sorting this out
// https://gist.github.com/WebReflection/5593554

'use strict';

var isObject      = require('../is-object')
  , value         = require('../valid-value')

  , isPrototypeOf = Object.prototype.isPrototypeOf
  , defineProperty = Object.defineProperty
  , nullDesc = { configurable: true, enumerable: false, writable: true,
		value: undefined }
  , validate;

validate = function (obj, prototype) {
	value(obj);
	if ((prototype === null) || isObject(prototype)) return obj;
	throw new TypeError('Prototype must be null or an object');
};

module.exports = (function (status) {
	var fn, set;
	if (!status) return null;
	if (status.level === 2) {
		if (status.set) {
			set = status.set;
			fn = function (obj, prototype) {
				set.call(validate(obj, prototype), prototype);
				return obj;
			};
		} else {
			fn = function (obj, prototype) {
				validate(obj, prototype).__proto__ = prototype;
				return obj;
			};
		}
	} else {
		fn = function self(obj, prototype) {
			var isNullBase;
			validate(obj, prototype);
			isNullBase = isPrototypeOf.call(self.nullPolyfill, obj);
			if (isNullBase) delete self.nullPolyfill.__proto__;
			if (prototype === null) prototype = self.nullPolyfill;
			obj.__proto__ = prototype;
			if (isNullBase) defineProperty(self.nullPolyfill, '__proto__', nullDesc);
			return obj;
		};
	}
	return Object.defineProperty(fn, 'level', { configurable: false,
		enumerable: false, writable: false, value: status.level });
}((function () {
	var x = Object.create(null), y = {}, set
	  , desc = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');

	if (desc) {
		try {
			set = desc.set; // Opera crashes at this point
			set.call(x, y);
		} catch (ignore) { }
		if (Object.getPrototypeOf(x) === y) return { set: set, level: 2 };
	}

	x.__proto__ = y;
	if (Object.getPrototypeOf(x) === y) return { level: 2 };

	x = {};
	x.__proto__ = y;
	if (Object.getPrototypeOf(x) === y) return { level: 1 };

	return false;
}())));

require('../create');

},{"../create":19,"../is-object":22,"../valid-value":33}],32:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],33:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],34:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":35,"./shim":36}],35:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],36:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],37:[function(require,module,exports){
'use strict';

var toString = Object.prototype.toString

  , id = toString.call('');

module.exports = function (x) {
	return (typeof x === 'string') || (x && (typeof x === 'object') &&
		((x instanceof String) || (toString.call(x) === id))) || false;
};

},{}],38:[function(require,module,exports){
'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , contains       = require('es5-ext/string/#/contains')
  , d              = require('d')
  , Iterator       = require('./')

  , defineProperty = Object.defineProperty
  , ArrayIterator;

ArrayIterator = module.exports = function (arr, kind) {
	if (!(this instanceof ArrayIterator)) return new ArrayIterator(arr, kind);
	Iterator.call(this, arr);
	if (!kind) kind = 'value';
	else if (contains.call(kind, 'key+value')) kind = 'key+value';
	else if (contains.call(kind, 'key')) kind = 'key';
	else kind = 'value';
	defineProperty(this, '__kind__', d('', kind));
};
if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);

ArrayIterator.prototype = Object.create(Iterator.prototype, {
	constructor: d(ArrayIterator),
	_resolve: d(function (i) {
		if (this.__kind__ === 'value') return this.__list__[i];
		if (this.__kind__ === 'key+value') return [i, this.__list__[i]];
		return i;
	}),
	toString: d(function () { return '[object Array Iterator]'; })
});

},{"./":41,"d":2,"es5-ext/object/set-prototype-of":29,"es5-ext/string/#/contains":34}],39:[function(require,module,exports){
'use strict';

var isArguments = require('es5-ext/function/is-arguments')
  , callable    = require('es5-ext/object/valid-callable')
  , isString    = require('es5-ext/string/is-string')
  , get         = require('./get')

  , isArray = Array.isArray, call = Function.prototype.call
  , some = Array.prototype.some;

module.exports = function (iterable, cb/*, thisArg*/) {
	var mode, thisArg = arguments[2], result, doBreak, broken, i, l, char, code;
	if (isArray(iterable) || isArguments(iterable)) mode = 'array';
	else if (isString(iterable)) mode = 'string';
	else iterable = get(iterable);

	callable(cb);
	doBreak = function () { broken = true; };
	if (mode === 'array') {
		some.call(iterable, function (value) {
			call.call(cb, thisArg, value, doBreak);
			if (broken) return true;
		});
		return;
	}
	if (mode === 'string') {
		l = iterable.length;
		for (i = 0; i < l; ++i) {
			char = iterable[i];
			if ((i + 1) < l) {
				code = char.charCodeAt(0);
				if ((code >= 0xD800) && (code <= 0xDBFF)) char += iterable[++i];
			}
			call.call(cb, thisArg, char, doBreak);
			if (broken) break;
		}
		return;
	}
	result = iterable.next();

	while (!result.done) {
		call.call(cb, thisArg, result.value, doBreak);
		if (broken) return;
		result = iterable.next();
	}
};

},{"./get":40,"es5-ext/function/is-arguments":8,"es5-ext/object/valid-callable":32,"es5-ext/string/is-string":37}],40:[function(require,module,exports){
'use strict';

var isArguments    = require('es5-ext/function/is-arguments')
  , isString       = require('es5-ext/string/is-string')
  , ArrayIterator  = require('./array')
  , StringIterator = require('./string')
  , iterable       = require('./valid-iterable')
  , iteratorSymbol = require('es6-symbol').iterator;

module.exports = function (obj) {
	if (typeof iterable(obj)[iteratorSymbol] === 'function') return obj[iteratorSymbol]();
	if (isArguments(obj)) return new ArrayIterator(obj);
	if (isString(obj)) return new StringIterator(obj);
	return new ArrayIterator(obj);
};

},{"./array":38,"./string":43,"./valid-iterable":44,"es5-ext/function/is-arguments":8,"es5-ext/string/is-string":37,"es6-symbol":51}],41:[function(require,module,exports){
'use strict';

var clear    = require('es5-ext/array/#/clear')
  , assign   = require('es5-ext/object/assign')
  , callable = require('es5-ext/object/valid-callable')
  , value    = require('es5-ext/object/valid-value')
  , d        = require('d')
  , autoBind = require('d/auto-bind')
  , Symbol   = require('es6-symbol')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , Iterator;

module.exports = Iterator = function (list, context) {
	if (!(this instanceof Iterator)) return new Iterator(list, context);
	defineProperties(this, {
		__list__: d('w', value(list)),
		__context__: d('w', context),
		__nextIndex__: d('w', 0)
	});
	if (!context) return;
	callable(context.on);
	context.on('_add', this._onAdd);
	context.on('_delete', this._onDelete);
	context.on('_clear', this._onClear);
};

defineProperties(Iterator.prototype, assign({
	constructor: d(Iterator),
	_next: d(function () {
		var i;
		if (!this.__list__) return;
		if (this.__redo__) {
			i = this.__redo__.shift();
			if (i !== undefined) return i;
		}
		if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
		this._unBind();
	}),
	next: d(function () { return this._createResult(this._next()); }),
	_createResult: d(function (i) {
		if (i === undefined) return { done: true, value: undefined };
		return { done: false, value: this._resolve(i) };
	}),
	_resolve: d(function (i) { return this.__list__[i]; }),
	_unBind: d(function () {
		this.__list__ = null;
		delete this.__redo__;
		if (!this.__context__) return;
		this.__context__.off('_add', this._onAdd);
		this.__context__.off('_delete', this._onDelete);
		this.__context__.off('_clear', this._onClear);
		this.__context__ = null;
	}),
	toString: d(function () { return '[object Iterator]'; })
}, autoBind({
	_onAdd: d(function (index) {
		if (index >= this.__nextIndex__) return;
		++this.__nextIndex__;
		if (!this.__redo__) {
			defineProperty(this, '__redo__', d('c', [index]));
			return;
		}
		this.__redo__.forEach(function (redo, i) {
			if (redo >= index) this.__redo__[i] = ++redo;
		}, this);
		this.__redo__.push(index);
	}),
	_onDelete: d(function (index) {
		var i;
		if (index >= this.__nextIndex__) return;
		--this.__nextIndex__;
		if (!this.__redo__) return;
		i = this.__redo__.indexOf(index);
		if (i !== -1) this.__redo__.splice(i, 1);
		this.__redo__.forEach(function (redo, i) {
			if (redo > index) this.__redo__[i] = --redo;
		}, this);
	}),
	_onClear: d(function () {
		if (this.__redo__) clear.call(this.__redo__);
		this.__nextIndex__ = 0;
	})
})));

defineProperty(Iterator.prototype, Symbol.iterator, d(function () {
	return this;
}));
defineProperty(Iterator.prototype, Symbol.toStringTag, d('', 'Iterator'));

},{"d":2,"d/auto-bind":1,"es5-ext/array/#/clear":6,"es5-ext/object/assign":15,"es5-ext/object/valid-callable":32,"es5-ext/object/valid-value":33,"es6-symbol":51}],42:[function(require,module,exports){
'use strict';

var isArguments    = require('es5-ext/function/is-arguments')
  , isString       = require('es5-ext/string/is-string')
  , iteratorSymbol = require('es6-symbol').iterator

  , isArray = Array.isArray;

module.exports = function (value) {
	if (value == null) return false;
	if (isArray(value)) return true;
	if (isString(value)) return true;
	if (isArguments(value)) return true;
	return (typeof value[iteratorSymbol] === 'function');
};

},{"es5-ext/function/is-arguments":8,"es5-ext/string/is-string":37,"es6-symbol":51}],43:[function(require,module,exports){
// Thanks @mathiasbynens
// http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols

'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , Iterator       = require('./')

  , defineProperty = Object.defineProperty
  , StringIterator;

StringIterator = module.exports = function (str) {
	if (!(this instanceof StringIterator)) return new StringIterator(str);
	str = String(str);
	Iterator.call(this, str);
	defineProperty(this, '__length__', d('', str.length));

};
if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);

StringIterator.prototype = Object.create(Iterator.prototype, {
	constructor: d(StringIterator),
	_next: d(function () {
		if (!this.__list__) return;
		if (this.__nextIndex__ < this.__length__) return this.__nextIndex__++;
		this._unBind();
	}),
	_resolve: d(function (i) {
		var char = this.__list__[i], code;
		if (this.__nextIndex__ === this.__length__) return char;
		code = char.charCodeAt(0);
		if ((code >= 0xD800) && (code <= 0xDBFF)) return char + this.__list__[this.__nextIndex__++];
		return char;
	}),
	toString: d(function () { return '[object String Iterator]'; })
});

},{"./":41,"d":2,"es5-ext/object/set-prototype-of":29}],44:[function(require,module,exports){
'use strict';

var isIterable = require('./is-iterable');

module.exports = function (value) {
	if (!isIterable(value)) throw new TypeError(value + " is not iterable");
	return value;
};

},{"./is-iterable":42}],45:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Map : require('./polyfill');

},{"./is-implemented":46,"./polyfill":50}],46:[function(require,module,exports){
'use strict';

module.exports = function () {
	var map, iterator, result;
	if (typeof Map !== 'function') return false;
	try {
		// WebKit doesn't support arguments and crashes
		map = new Map([['raz', 'one'], ['dwa', 'two'], ['trzy', 'three']]);
	} catch (e) {
		return false;
	}
	if (String(map) !== '[object Map]') return false;
	if (map.size !== 3) return false;
	if (typeof map.clear !== 'function') return false;
	if (typeof map.delete !== 'function') return false;
	if (typeof map.entries !== 'function') return false;
	if (typeof map.forEach !== 'function') return false;
	if (typeof map.get !== 'function') return false;
	if (typeof map.has !== 'function') return false;
	if (typeof map.keys !== 'function') return false;
	if (typeof map.set !== 'function') return false;
	if (typeof map.values !== 'function') return false;

	iterator = map.entries();
	result = iterator.next();
	if (result.done !== false) return false;
	if (!result.value) return false;
	if (result.value[0] !== 'raz') return false;
	if (result.value[1] !== 'one') return false;

	return true;
};

},{}],47:[function(require,module,exports){
// Exports true if environment provides native `Map` implementation,
// whatever that is.

'use strict';

module.exports = (function () {
	if (typeof Map === 'undefined') return false;
	return (Object.prototype.toString.call(new Map()) === '[object Map]');
}());

},{}],48:[function(require,module,exports){
'use strict';

module.exports = require('es5-ext/object/primitive-set')('key',
	'value', 'key+value');

},{"es5-ext/object/primitive-set":28}],49:[function(require,module,exports){
'use strict';

var setPrototypeOf    = require('es5-ext/object/set-prototype-of')
  , d                 = require('d')
  , Iterator          = require('es6-iterator')
  , toStringTagSymbol = require('es6-symbol').toStringTag
  , kinds             = require('./iterator-kinds')

  , defineProperties = Object.defineProperties
  , unBind = Iterator.prototype._unBind
  , MapIterator;

MapIterator = module.exports = function (map, kind) {
	if (!(this instanceof MapIterator)) return new MapIterator(map, kind);
	Iterator.call(this, map.__mapKeysData__, map);
	if (!kind || !kinds[kind]) kind = 'key+value';
	defineProperties(this, {
		__kind__: d('', kind),
		__values__: d('w', map.__mapValuesData__)
	});
};
if (setPrototypeOf) setPrototypeOf(MapIterator, Iterator);

MapIterator.prototype = Object.create(Iterator.prototype, {
	constructor: d(MapIterator),
	_resolve: d(function (i) {
		if (this.__kind__ === 'value') return this.__values__[i];
		if (this.__kind__ === 'key') return this.__list__[i];
		return [this.__list__[i], this.__values__[i]];
	}),
	_unBind: d(function () {
		this.__values__ = null;
		unBind.call(this);
	}),
	toString: d(function () { return '[object Map Iterator]'; })
});
Object.defineProperty(MapIterator.prototype, toStringTagSymbol,
	d('c', 'Map Iterator'));

},{"./iterator-kinds":48,"d":2,"es5-ext/object/set-prototype-of":29,"es6-iterator":41,"es6-symbol":51}],50:[function(require,module,exports){
'use strict';

var clear          = require('es5-ext/array/#/clear')
  , eIndexOf       = require('es5-ext/array/#/e-index-of')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , callable       = require('es5-ext/object/valid-callable')
  , validValue     = require('es5-ext/object/valid-value')
  , d              = require('d')
  , ee             = require('event-emitter')
  , Symbol         = require('es6-symbol')
  , iterator       = require('es6-iterator/valid-iterable')
  , forOf          = require('es6-iterator/for-of')
  , Iterator       = require('./lib/iterator')
  , isNative       = require('./is-native-implemented')

  , call = Function.prototype.call
  , defineProperties = Object.defineProperties, getPrototypeOf = Object.getPrototypeOf
  , MapPoly;

module.exports = MapPoly = function (/*iterable*/) {
	var iterable = arguments[0], keys, values, self;
	if (!(this instanceof MapPoly)) throw new TypeError('Constructor requires \'new\'');
	if (isNative && setPrototypeOf && (Map !== MapPoly)) {
		self = setPrototypeOf(new Map(), getPrototypeOf(this));
	} else {
		self = this;
	}
	if (iterable != null) iterator(iterable);
	defineProperties(self, {
		__mapKeysData__: d('c', keys = []),
		__mapValuesData__: d('c', values = [])
	});
	if (!iterable) return self;
	forOf(iterable, function (value) {
		var key = validValue(value)[0];
		value = value[1];
		if (eIndexOf.call(keys, key) !== -1) return;
		keys.push(key);
		values.push(value);
	}, self);
	return self;
};

if (isNative) {
	if (setPrototypeOf) setPrototypeOf(MapPoly, Map);
	MapPoly.prototype = Object.create(Map.prototype, {
		constructor: d(MapPoly)
	});
}

ee(defineProperties(MapPoly.prototype, {
	clear: d(function () {
		if (!this.__mapKeysData__.length) return;
		clear.call(this.__mapKeysData__);
		clear.call(this.__mapValuesData__);
		this.emit('_clear');
	}),
	delete: d(function (key) {
		var index = eIndexOf.call(this.__mapKeysData__, key);
		if (index === -1) return false;
		this.__mapKeysData__.splice(index, 1);
		this.__mapValuesData__.splice(index, 1);
		this.emit('_delete', index, key);
		return true;
	}),
	entries: d(function () { return new Iterator(this, 'key+value'); }),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1], iterator, result;
		callable(cb);
		iterator = this.entries();
		result = iterator._next();
		while (result !== undefined) {
			call.call(cb, thisArg, this.__mapValuesData__[result],
				this.__mapKeysData__[result], this);
			result = iterator._next();
		}
	}),
	get: d(function (key) {
		var index = eIndexOf.call(this.__mapKeysData__, key);
		if (index === -1) return;
		return this.__mapValuesData__[index];
	}),
	has: d(function (key) {
		return (eIndexOf.call(this.__mapKeysData__, key) !== -1);
	}),
	keys: d(function () { return new Iterator(this, 'key'); }),
	set: d(function (key, value) {
		var index = eIndexOf.call(this.__mapKeysData__, key), emit;
		if (index === -1) {
			index = this.__mapKeysData__.push(key) - 1;
			emit = true;
		}
		this.__mapValuesData__[index] = value;
		if (emit) this.emit('_add', index, key);
		return this;
	}),
	size: d.gs(function () { return this.__mapKeysData__.length; }),
	values: d(function () { return new Iterator(this, 'value'); }),
	toString: d(function () { return '[object Map]'; })
}));
Object.defineProperty(MapPoly.prototype, Symbol.iterator, d(function () {
	return this.entries();
}));
Object.defineProperty(MapPoly.prototype, Symbol.toStringTag, d('c', 'Map'));

},{"./is-native-implemented":47,"./lib/iterator":49,"d":2,"es5-ext/array/#/clear":6,"es5-ext/array/#/e-index-of":7,"es5-ext/object/set-prototype-of":29,"es5-ext/object/valid-callable":32,"es5-ext/object/valid-value":33,"es6-iterator/for-of":39,"es6-iterator/valid-iterable":44,"es6-symbol":51,"event-emitter":57}],51:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')() ? Symbol : require('./polyfill');

},{"./is-implemented":52,"./polyfill":54}],52:[function(require,module,exports){
'use strict';

var validTypes = { object: true, symbol: true };

module.exports = function () {
	var symbol;
	if (typeof Symbol !== 'function') return false;
	symbol = Symbol('test symbol');
	try { String(symbol); } catch (e) { return false; }

	// Return 'true' also for polyfills
	if (!validTypes[typeof Symbol.iterator]) return false;
	if (!validTypes[typeof Symbol.toPrimitive]) return false;
	if (!validTypes[typeof Symbol.toStringTag]) return false;

	return true;
};

},{}],53:[function(require,module,exports){
'use strict';

module.exports = function (x) {
	if (!x) return false;
	if (typeof x === 'symbol') return true;
	if (!x.constructor) return false;
	if (x.constructor.name !== 'Symbol') return false;
	return (x[x.constructor.toStringTag] === 'Symbol');
};

},{}],54:[function(require,module,exports){
// ES2015 Symbol polyfill for environments that do not (or partially) support it

'use strict';

var d              = require('d')
  , validateSymbol = require('./validate-symbol')

  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
  , isNativeSafe;

if (typeof Symbol === 'function') {
	NativeSymbol = Symbol;
	try {
		String(NativeSymbol());
		isNativeSafe = true;
	} catch (ignore) {}
}

var generateName = (function () {
	var created = create(null);
	return function (desc) {
		var postfix = 0, name, ie11BugWorkaround;
		while (created[desc + (postfix || '')]) ++postfix;
		desc += (postfix || '');
		created[desc] = true;
		name = '@@' + desc;
		defineProperty(objPrototype, name, d.gs(null, function (value) {
			// For IE11 issue see:
			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
			//    ie11-broken-getters-on-dom-objects
			// https://github.com/medikoo/es6-symbol/issues/12
			if (ie11BugWorkaround) return;
			ie11BugWorkaround = true;
			defineProperty(this, name, d(value));
			ie11BugWorkaround = false;
		}));
		return name;
	};
}());

// Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) throw new TypeError('Symbol is not a constructor');
	return SymbolPolyfill(description);
};

// Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
module.exports = SymbolPolyfill = function Symbol(description) {
	var symbol;
	if (this instanceof Symbol) throw new TypeError('Symbol is not a constructor');
	if (isNativeSafe) return NativeSymbol(description);
	symbol = create(HiddenSymbol.prototype);
	description = (description === undefined ? '' : String(description));
	return defineProperties(symbol, {
		__description__: d('', description),
		__name__: d('', generateName(description))
	});
};
defineProperties(SymbolPolyfill, {
	for: d(function (key) {
		if (globalSymbols[key]) return globalSymbols[key];
		return (globalSymbols[key] = SymbolPolyfill(String(key)));
	}),
	keyFor: d(function (s) {
		var key;
		validateSymbol(s);
		for (key in globalSymbols) if (globalSymbols[key] === s) return key;
	}),

	// To ensure proper interoperability with other native functions (e.g. Array.from)
	// fallback to eventual native implementation of given symbol
	hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
	isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
		SymbolPolyfill('isConcatSpreadable')),
	iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
	match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
	replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
	search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
	species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
	split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
	toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
	toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
	unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
});

// Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype, {
	constructor: d(SymbolPolyfill),
	toString: d('', function () { return this.__name__; })
});

// Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype, {
	toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
	valueOf: d(function () { return validateSymbol(this); })
});
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
	var symbol = validateSymbol(this);
	if (typeof symbol === 'symbol') return symbol;
	return symbol.toString();
}));
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

// Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

},{"./validate-symbol":55,"d":2}],55:[function(require,module,exports){
'use strict';

var isSymbol = require('./is-symbol');

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};

},{"./is-symbol":53}],56:[function(require,module,exports){
(function (global){
/*! https://mths.be/esrever v0.2.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
	var regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

	var reverse = function(string) {
		// Step 1: deal with combining marks and astral symbols (surrogate pairs)
		string = string
			// Swap symbols with their combining marks so the combining marks go first
			.replace(regexSymbolWithCombiningMarks, function($0, $1, $2) {
				// Reverse the combining marks so they will end up in the same order
				// later on (after another round of reversing)
				return reverse($2) + $1;
			})
			// Swap high and low surrogates so the low surrogates go first
			.replace(regexSurrogatePair, '$2$1');
		// Step 2: reverse the code units in the string
		var result = '';
		var index = string.length;
		while (index--) {
			result += string.charAt(index);
		}
		return result;
	};

	/*--------------------------------------------------------------------------*/

	var esrever = {
		'version': '0.2.0',
		'reverse': reverse
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return esrever;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = esrever;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in esrever) {
				esrever.hasOwnProperty(key) && (freeExports[key] = esrever[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.esrever = esrever;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],57:[function(require,module,exports){
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":2,"es5-ext/object/valid-callable":32}],58:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],59:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if ("production" !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
},{}],60:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

module.exports = warning;
},{"./emptyFunction":58}],61:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = getDocument;

// defined by w3c
var DOCUMENT_NODE = 9;

/**
 * Returns `true` if `w` is a Document object, or `false` otherwise.
 *
 * @param {?} d - Document object, maybe
 * @return {Boolean}
 * @private
 */

function isDocument (d) {
  return d && d.nodeType === DOCUMENT_NODE;
}

/**
 * Returns the `document` object associated with the given `node`, which may be
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM
 * object that references the Document in some way, this function will find it.
 *
 * @param {Mixed} node - DOM node, selection, or range in which to find the `document` object
 * @return {Document} the `document` object associated with `node`
 * @public
 */

function getDocument(node) {
  if (isDocument(node)) {
    return node;

  } else if (isDocument(node.ownerDocument)) {
    return node.ownerDocument;

  } else if (isDocument(node.document)) {
    return node.document;

  } else if (node.parentNode) {
    return getDocument(node.parentNode);

  // Range support
  } else if (node.commonAncestorContainer) {
    return getDocument(node.commonAncestorContainer);

  } else if (node.startContainer) {
    return getDocument(node.startContainer);

  // Selection support
  } else if (node.anchorNode) {
    return getDocument(node.anchorNode);
  }
}

},{}],62:[function(require,module,exports){

/**
 * Module dependencies.
 */

var getDocument = require('get-document');

/**
 * Module exports.
 */

module.exports = getWindow;

var needsIEFallback = require('./needs-ie-fallback');

/**
 * Returns `true` if `w` is a Window object, or `false` otherwise.
 *
 * @param {Mixed} w - Window object, maybe
 * @return {Boolean}
 * @private
 */

function isWindow (w) {
  return w && w.window === w;
}

/**
 * Returns the `window` object associated with the given `node`, which may be
 * a DOM element, the Window object, a Selection, a Range. Basically any DOM
 * object that references the Window in some way, this function will find it.
 *
 * @param {Mixed} node - DOM node, selection, or range in which to find the `window` object
 * @return {Window} the `window` object associated with `node`
 * @public
 */

function getWindow(node) {
  if (isWindow(node)) {
    return node;
  }

  var doc = getDocument(node);

  if (needsIEFallback) {
    // In IE 6-8, only the variable 'window' can be used to connect events (others
    // may be only copies).
    doc.parentWindow.execScript('document._parentWindow = window;', 'Javascript');
    var win = doc._parentWindow;
    // to prevent memory leak, unset it after use
    // another possibility is to add an onUnload handler,
    // (which seems overkill to @liucougar)
    doc._parentWindow = null;
    return win;
  } else {
    // standards-compliant and newer IE
    return doc.defaultView || doc.parentWindow;
  }
}

},{"./needs-ie-fallback":63,"get-document":61}],63:[function(require,module,exports){
// this is a browser-only module. There is a non-browser equivalent in the same
// directory. This is done using a `package.json` browser field.
// old-IE fallback logic: http://stackoverflow.com/a/10260692
module.exports =  !!document.attachEvent && window !== document.parentWindow;

},{}],64:[function(require,module,exports){

/**
 * Has own property.
 *
 * @type {Function}
 */

var has = Object.prototype.hasOwnProperty

/**
 * To string.
 *
 * @type {Function}
 */

var toString = Object.prototype.toString

/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty(val) {
  // Null and Undefined...
  if (val == null) return true

  // Booleans...
  if ('boolean' == typeof val) return false

  // Numbers...
  if ('number' == typeof val) return val === 0

  // Strings...
  if ('string' == typeof val) return val.length === 0

  // Functions...
  if ('function' == typeof val) return val.length === 0

  // Arrays...
  if (Array.isArray(val)) return val.length === 0

  // Errors...
  if (val instanceof Error) return val.message === ''

  // Objects...
  if (val.toString == toString) {
    switch (val.toString()) {

      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0
      }

      // Plain objects...
      case '[object Object]': {
        for (var key in val) {
          if (has.call(val, key)) return false
        }

        return true
      }
    }
  }

  // Anything else...
  return false
}

/**
 * Export `isEmpty`.
 *
 * @type {Function}
 */

module.exports = isEmpty

},{}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isBrowser = exports.isBrowser = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && document.nodeType === 9;

exports.default = isBrowser;
},{}],66:[function(require,module,exports){
// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

exports = module.exports = function(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
    if (hasKeyCode) searchInput = hasKeyCode
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput)

  // check codes
  var foundNamedKey = codes[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'left command': 91,
  'right command': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
}

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'pgup': 33,
  'pgdn': 34,
  'ins': 45,
  'del': 46,
  'cmd': 91
}


/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {} // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias]
}

},{}],67:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],68:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],69:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))
},{"./lib/ReactPropTypesSecret":73,"_process":68,"fbjs/lib/invariant":59,"fbjs/lib/warning":60}],70:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');

module.exports = function() {
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  function shim() {
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"fbjs/lib/emptyFunction":58,"fbjs/lib/invariant":59}],71:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

}).call(this,require('_process'))
},{"./checkPropTypes":69,"./lib/ReactPropTypesSecret":73,"_process":68,"fbjs/lib/emptyFunction":58,"fbjs/lib/invariant":59,"fbjs/lib/warning":60}],72:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

}).call(this,require('_process'))
},{"./factoryWithThrowingShims":70,"./factoryWithTypeCheckers":71,"_process":68}],73:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _reactDom = (window.ReactDOM);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KEYCODES = {
  ESCAPE: 27
};

var Portal = function (_React$Component) {
  _inherits(Portal, _React$Component);

  function Portal() {
    _classCallCheck(this, Portal);

    var _this = _possibleConstructorReturn(this, (Portal.__proto__ || Object.getPrototypeOf(Portal)).call(this));

    _this.state = { active: false };
    _this.handleWrapperClick = _this.handleWrapperClick.bind(_this);
    _this.closePortal = _this.closePortal.bind(_this);
    _this.handleOutsideMouseClick = _this.handleOutsideMouseClick.bind(_this);
    _this.handleKeydown = _this.handleKeydown.bind(_this);
    _this.portal = null;
    _this.node = null;
    return _this;
  }

  _createClass(Portal, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.closeOnEsc) {
        document.addEventListener('keydown', this.handleKeydown);
      }

      if (this.props.closeOnOutsideClick) {
        document.addEventListener('mouseup', this.handleOutsideMouseClick);
        document.addEventListener('touchstart', this.handleOutsideMouseClick);
      }

      if (this.props.isOpened) {
        this.openPortal();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      // portal's 'is open' state is handled through the prop isOpened
      if (typeof newProps.isOpened !== 'undefined') {
        if (newProps.isOpened) {
          if (this.state.active) {
            this.renderPortal(newProps);
          } else {
            this.openPortal(newProps);
          }
        }
        if (!newProps.isOpened && this.state.active) {
          this.closePortal();
        }
      }

      // portal handles its own 'is open' state
      if (typeof newProps.isOpened === 'undefined' && this.state.active) {
        this.renderPortal(newProps);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.closeOnEsc) {
        document.removeEventListener('keydown', this.handleKeydown);
      }

      if (this.props.closeOnOutsideClick) {
        document.removeEventListener('mouseup', this.handleOutsideMouseClick);
        document.removeEventListener('touchstart', this.handleOutsideMouseClick);
      }

      this.closePortal(true);
    }
  }, {
    key: 'handleWrapperClick',
    value: function handleWrapperClick(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.state.active) {
        return;
      }
      this.openPortal();
    }
  }, {
    key: 'openPortal',
    value: function openPortal() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      this.setState({ active: true });
      this.renderPortal(props);
      this.props.onOpen(this.node);
    }
  }, {
    key: 'closePortal',
    value: function closePortal() {
      var _this2 = this;

      var isUnmounted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var resetPortalState = function resetPortalState() {
        if (_this2.node) {
          _reactDom2.default.unmountComponentAtNode(_this2.node);
          document.body.removeChild(_this2.node);
        }
        _this2.portal = null;
        _this2.node = null;
        if (isUnmounted !== true) {
          _this2.setState({ active: false });
        }
      };

      if (this.state.active) {
        if (this.props.beforeClose) {
          this.props.beforeClose(this.node, resetPortalState);
        } else {
          resetPortalState();
        }

        this.props.onClose();
      }
    }
  }, {
    key: 'handleOutsideMouseClick',
    value: function handleOutsideMouseClick(e) {
      if (!this.state.active) {
        return;
      }

      var root = (0, _reactDom.findDOMNode)(this.portal);
      if (root.contains(e.target) || e.button && e.button !== 0) {
        return;
      }

      e.stopPropagation();
      this.closePortal();
    }
  }, {
    key: 'handleKeydown',
    value: function handleKeydown(e) {
      if (e.keyCode === KEYCODES.ESCAPE && this.state.active) {
        this.closePortal();
      }
    }
  }, {
    key: 'renderPortal',
    value: function renderPortal(props) {
      if (!this.node) {
        this.node = document.createElement('div');
        document.body.appendChild(this.node);
      }

      var children = props.children;
      // https://gist.github.com/jimfb/d99e0678e9da715ccf6454961ef04d1b
      if (typeof props.children.type === 'function') {
        children = _react2.default.cloneElement(props.children, { closePortal: this.closePortal });
      }

      this.portal = _reactDom2.default.unstable_renderSubtreeIntoContainer(this, children, this.node, this.props.onUpdate);
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.openByClickOn) {
        return _react2.default.cloneElement(this.props.openByClickOn, { onClick: this.handleWrapperClick });
      }
      return null;
    }
  }]);

  return Portal;
}(_react2.default.Component);

exports.default = Portal;


Portal.propTypes = {
  children: _propTypes2.default.element.isRequired,
  openByClickOn: _propTypes2.default.element,
  closeOnEsc: _propTypes2.default.bool,
  closeOnOutsideClick: _propTypes2.default.bool,
  isOpened: _propTypes2.default.bool,
  onOpen: _propTypes2.default.func,
  onClose: _propTypes2.default.func,
  beforeClose: _propTypes2.default.func,
  onUpdate: _propTypes2.default.func
};

Portal.defaultProps = {
  onOpen: function onOpen() {},
  onClose: function onClose() {},
  onUpdate: function onUpdate() {}
};
module.exports = exports['default'];

},{"prop-types":72}],75:[function(require,module,exports){
function isBackward(selection) {
    var startNode = selection.anchorNode;
    var startOffset = selection.anchorOffset;
    var endNode = selection.focusNode;
    var endOffset = selection.focusOffset;

    var position = startNode.compareDocumentPosition(endNode);

    return !(position === 4 || (position === 0 && startOffset < endOffset));
}

module.exports = isBackward;

},{}],76:[function(require,module,exports){
var toString = Object.prototype.toString

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function'
    case '[object Date]': return 'date'
    case '[object RegExp]': return 'regexp'
    case '[object Arguments]': return 'arguments'
    case '[object Array]': return 'array'
    case '[object String]': return 'string'
  }

  if (typeof val == 'object' && val && typeof val.length == 'number') {
    try {
      if (typeof val.callee == 'function') return 'arguments';
    } catch (ex) {
      if (ex instanceof TypeError) {
        return 'arguments';
      }
    }
  }

  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (val && val.nodeType === 1) return 'element'
  if (val === Object(val)) return 'object'

  return typeof val
}

},{}],77:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _types = require('../constants/types');

var _types2 = _interopRequireDefault(_types);

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _extendSelection = require('../utils/extend-selection');

var _extendSelection2 = _interopRequireDefault(_extendSelection);

var _findClosestNode = require('../utils/find-closest-node');

var _findClosestNode2 = _interopRequireDefault(_findClosestNode);

var _findDeepestNode = require('../utils/find-deepest-node');

var _findDeepestNode2 = _interopRequireDefault(_findDeepestNode);

var _getPoint = require('../utils/get-point');

var _getPoint2 = _interopRequireDefault(_getPoint);

var _getTransferData = require('../utils/get-transfer-data');

var _getTransferData2 = _interopRequireDefault(_getTransferData);

var _setTransferData = require('../utils/set-transfer-data');

var _setTransferData2 = _interopRequireDefault(_setTransferData);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:content');

/**
 * Content.
 *
 * @type {Component}
 */

var Content = function (_React$Component) {
  _inherits(Content, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Content(props) {
    _classCallCheck(this, Content);

    var _this = _possibleConstructorReturn(this, (Content.__proto__ || Object.getPrototypeOf(Content)).call(this, props));

    _initialiseProps.call(_this);

    _this.tmp = {};
    _this.tmp.compositions = 0;
    _this.tmp.forces = 0;
    return _this;
  }

  /**
   * Should the component update?
   *
   * @param {Object} props
   * @param {Object} state
   * @return {Boolean}
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  /**
   * When the editor first mounts in the DOM we need to:
   *
   *   - Update the selection, in case it starts focused.
   *   - Focus the editor if `autoFocus` is set.
   */

  /**
   * On update, update the selection.
   */

  /**
   * Update the native DOM selection to reflect the internal model.
   */

  /**
   * The React ref method to set the root content element locally.
   *
   * @param {Element} n
   */

  /**
   * Check if an event `target` is fired from within the contenteditable
   * element. This should be false for edits happening in non-contenteditable
   * children, such as void nodes and other nested Slate editors.
   *
   * @param {Element} target
   * @return {Boolean}
   */

  /**
   * On before input, bubble up.
   *
   * @param {Event} event
   */

  /**
   * On blur, update the selection to be not focused.
   *
   * @param {Event} event
   */

  /**
   * On focus, update the selection to be focused.
   *
   * @param {Event} event
   */

  /**
   * On change, bubble up.
   *
   * @param {State} state
   */

  /**
   * On composition start, set the `isComposing` flag.
   *
   * @param {Event} event
   */

  /**
   * On composition end, remove the `isComposing` flag on the next tick. Also
   * increment the `forces` key, which will force the contenteditable element
   * to completely re-render, since IME puts React in an unreconcilable state.
   *
   * @param {Event} event
   */

  /**
   * On copy, defer to `onCutCopy`, then bubble up.
   *
   * @param {Event} event
   */

  /**
   * On cut, defer to `onCutCopy`, then bubble up.
   *
   * @param {Event} event
   */

  /**
   * On drag end, unset the `isDragging` flag.
   *
   * @param {Event} event
   */

  /**
   * On drag over, set the `isDragging` flag and the `isInternalDrag` flag.
   *
   * @param {Event} event
   */

  /**
   * On drag start, set the `isDragging` flag and the `isInternalDrag` flag.
   *
   * @param {Event} event
   */

  /**
   * On drop.
   *
   * @param {Event} event
   */

  /**
   * On input, handle spellcheck and other similar edits that don't go trigger
   * the `onBeforeInput` and instead update the DOM directly.
   *
   * @param {Event} event
   */

  /**
   * On key down, prevent the default behavior of certain commands that will
   * leave the editor in an out-of-sync state, then bubble up.
   *
   * @param {Event} event
   */

  /**
   * On key up, unset the `isShifting` flag.
   *
   * @param {Event} event
   */

  /**
   * On paste, determine the type and bubble up.
   *
   * @param {Event} event
   */

  /**
   * On select, update the current state's selection.
   *
   * @param {Event} event
   */

  /**
   * Render the editor content.
   *
   * @return {Element}
   */

  /**
   * Render a `node`.
   *
   * @param {Node} node
   * @return {Element}
   */

  return Content;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Content.propTypes = {
  autoCorrect: _propTypes2.default.bool.isRequired,
  autoFocus: _propTypes2.default.bool.isRequired,
  children: _propTypes2.default.array.isRequired,
  className: _propTypes2.default.string,
  editor: _propTypes2.default.object.isRequired,
  onBeforeInput: _propTypes2.default.func.isRequired,
  onBlur: _propTypes2.default.func.isRequired,
  onChange: _propTypes2.default.func.isRequired,
  onCopy: _propTypes2.default.func.isRequired,
  onCut: _propTypes2.default.func.isRequired,
  onDrop: _propTypes2.default.func.isRequired,
  onFocus: _propTypes2.default.func.isRequired,
  onKeyDown: _propTypes2.default.func.isRequired,
  onPaste: _propTypes2.default.func.isRequired,
  onSelect: _propTypes2.default.func.isRequired,
  readOnly: _propTypes2.default.bool.isRequired,
  role: _propTypes2.default.string,
  schema: _propTypes2.default.object,
  spellCheck: _propTypes2.default.bool.isRequired,
  state: _propTypes2.default.object.isRequired,
  style: _propTypes2.default.object,
  tabIndex: _propTypes2.default.number
};
Content.defaultProps = {
  style: {}
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.shouldComponentUpdate = function (props, state) {
    // If the readOnly state has changed, we need to re-render so that
    // the cursor will be added or removed again.
    if (props.readOnly != _this2.props.readOnly) return true;

    // If the state has been transformed natively, never re-render, or else we
    // will end up duplicating content.
    if (props.state.isNative) return false;

    return props.className != _this2.props.className || props.schema != _this2.props.schema || props.autoCorrect != _this2.props.autoCorrect || props.spellCheck != _this2.props.spellCheck || props.state != _this2.props.state || props.style != _this2.props.style;
  };

  this.componentDidMount = function () {
    _this2.updateSelection();

    if (_this2.props.autoFocus) {
      _this2.element.focus();
    }
  };

  this.componentDidUpdate = function () {
    _this2.updateSelection();
  };

  this.updateSelection = function () {
    var _props = _this2.props,
        editor = _props.editor,
        state = _props.state;
    var document = state.document,
        selection = state.selection;

    var window = (0, _getWindow2.default)(_this2.element);
    var native = window.getSelection();

    // If both selections are blurred, do nothing.
    if (!native.rangeCount && selection.isBlurred) return;

    // If the selection has been blurred, but is still inside the editor in the
    // DOM, blur it manually.
    if (selection.isBlurred) {
      if (!_this2.isInEditor(native.anchorNode)) return;
      native.removeAllRanges();
      _this2.element.blur();
      debug('updateSelection', { selection: selection, native: native });
      return;
    }

    // Otherwise, figure out which DOM nodes should be selected...
    var anchorText = state.anchorText,
        focusText = state.focusText;
    var anchorKey = selection.anchorKey,
        anchorOffset = selection.anchorOffset,
        focusKey = selection.focusKey,
        focusOffset = selection.focusOffset;

    var schema = editor.getSchema();
    var anchorDecorators = document.getDescendantDecorators(anchorKey, schema);
    var focusDecorators = document.getDescendantDecorators(focusKey, schema);
    var anchorRanges = anchorText.getRanges(anchorDecorators);
    var focusRanges = focusText.getRanges(focusDecorators);
    var a = 0;
    var f = 0;
    var anchorIndex = void 0;
    var focusIndex = void 0;
    var anchorOff = void 0;
    var focusOff = void 0;

    anchorRanges.forEach(function (range, i, ranges) {
      var length = range.text.length;

      a += length;
      if (a < anchorOffset) return;
      anchorIndex = i;
      anchorOff = anchorOffset - (a - length);
      return false;
    });

    focusRanges.forEach(function (range, i, ranges) {
      var length = range.text.length;

      f += length;
      if (f < focusOffset) return;
      focusIndex = i;
      focusOff = focusOffset - (f - length);
      return false;
    });

    var anchorSpan = _this2.element.querySelector('[data-offset-key="' + anchorKey + '-' + anchorIndex + '"]');
    var focusSpan = _this2.element.querySelector('[data-offset-key="' + focusKey + '-' + focusIndex + '"]');
    var anchorEl = (0, _findDeepestNode2.default)(anchorSpan);
    var focusEl = (0, _findDeepestNode2.default)(focusSpan);

    // If they are already selected, do nothing.
    if (anchorEl == native.anchorNode && anchorOff == native.anchorOffset && focusEl == native.focusNode && focusOff == native.focusOffset) {
      return;
    }

    // Otherwise, set the `isSelecting` flag and update the selection.
    _this2.tmp.isSelecting = true;
    native.removeAllRanges();
    var range = window.document.createRange();
    range.setStart(anchorEl, anchorOff);
    native.addRange(range);
    (0, _extendSelection2.default)(native, focusEl, focusOff);

    // Then unset the `isSelecting` flag after a delay.
    setTimeout(function () {
      // COMPAT: In Firefox, it's not enough to create a range, you also need to
      // focus the contenteditable element too. (2016/11/16)
      if (_environment.IS_FIREFOX) _this2.element.focus();
      _this2.tmp.isSelecting = false;
    });

    debug('updateSelection', { selection: selection, native: native });
  };

  this.ref = function (element) {
    _this2.element = element;
  };

  this.isInEditor = function (target) {
    var element = _this2.element;
    // COMPAT: Text nodes don't have `isContentEditable` property. So, when
    // `target` is a text node use its parent element for check.

    var el = target.nodeType === 3 ? target.parentElement : target;
    return el.isContentEditable && (el === element || (0, _findClosestNode2.default)(el, '[data-slate-editor]') === element);
  };

  this.onBeforeInput = function (event) {
    if (_this2.props.readOnly) return;
    if (!_this2.isInEditor(event.target)) return;

    var data = {};

    debug('onBeforeInput', { event: event, data: data });
    _this2.props.onBeforeInput(event, data);
  };

  this.onBlur = function (event) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isCopying) return;
    if (!_this2.isInEditor(event.target)) return;

    // If the active element is still the editor, the blur event is due to the
    // window itself being blurred (eg. when changing tabs) so we should ignore
    // the event, since we want to maintain focus when returning.
    var window = (0, _getWindow2.default)(_this2.element);
    if (window.document.activeElement == _this2.element) return;

    var data = {};

    debug('onBlur', { event: event, data: data });
    _this2.props.onBlur(event, data);
  };

  this.onFocus = function (event) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isCopying) return;
    if (!_this2.isInEditor(event.target)) return;

    // COMPAT: If the editor has nested editable elements, the focus can go to
    // those elements. In Firefox, this must be prevented because it results in
    // issues with keyboard navigation. (2017/03/30)
    if (_environment.IS_FIREFOX && event.target != _this2.element) {
      _this2.element.focus();
      return;
    }

    var data = {};

    debug('onFocus', { event: event, data: data });
    _this2.props.onFocus(event, data);
  };

  this.onChange = function (state) {
    debug('onChange', state);
    _this2.props.onChange(state);
  };

  this.onCompositionStart = function (event) {
    if (!_this2.isInEditor(event.target)) return;

    _this2.tmp.isComposing = true;
    _this2.tmp.compositions++;

    debug('onCompositionStart', { event: event });
  };

  this.onCompositionEnd = function (event) {
    if (!_this2.isInEditor(event.target)) return;

    _this2.tmp.forces++;
    var count = _this2.tmp.compositions;

    // The `count` check here ensures that if another composition starts
    // before the timeout has closed out this one, we will abort unsetting the
    // `isComposing` flag, since a composition in still in affect.
    setTimeout(function () {
      if (_this2.tmp.compositions > count) return;
      _this2.tmp.isComposing = false;
    });

    debug('onCompositionEnd', { event: event });
  };

  this.onCopy = function (event) {
    if (!_this2.isInEditor(event.target)) return;
    var window = (0, _getWindow2.default)(event.target);

    _this2.tmp.isCopying = true;
    window.requestAnimationFrame(function () {
      _this2.tmp.isCopying = false;
    });

    var state = _this2.props.state;

    var data = {};
    data.type = 'fragment';
    data.fragment = state.fragment;

    debug('onCopy', { event: event, data: data });
    _this2.props.onCopy(event, data);
  };

  this.onCut = function (event) {
    if (_this2.props.readOnly) return;
    if (!_this2.isInEditor(event.target)) return;
    var window = (0, _getWindow2.default)(event.target);

    _this2.tmp.isCopying = true;
    window.requestAnimationFrame(function () {
      _this2.tmp.isCopying = false;
    });

    var state = _this2.props.state;

    var data = {};
    data.type = 'fragment';
    data.fragment = state.fragment;

    debug('onCut', { event: event, data: data });
    _this2.props.onCut(event, data);
  };

  this.onDragEnd = function (event) {
    if (!_this2.isInEditor(event.target)) return;

    _this2.tmp.isDragging = false;
    _this2.tmp.isInternalDrag = null;

    debug('onDragEnd', { event: event });
  };

  this.onDragOver = function (event) {
    if (!_this2.isInEditor(event.target)) return;

    event.preventDefault();

    if (_this2.tmp.isDragging) return;
    _this2.tmp.isDragging = true;
    _this2.tmp.isInternalDrag = false;

    debug('onDragOver', { event: event });
  };

  this.onDragStart = function (event) {
    if (!_this2.isInEditor(event.target)) return;

    _this2.tmp.isDragging = true;
    _this2.tmp.isInternalDrag = true;
    var dataTransfer = event.nativeEvent.dataTransfer;

    var data = (0, _getTransferData2.default)(dataTransfer);

    // If it's a node being dragged, the data type is already set.
    if (data.type == 'node') return;

    var state = _this2.props.state;
    var fragment = state.fragment;

    var encoded = _base2.default.serializeNode(fragment);

    (0, _setTransferData2.default)(dataTransfer, _types2.default.FRAGMENT, encoded);

    debug('onDragStart', { event: event });
  };

  this.onDrop = function (event) {
    if (_this2.props.readOnly) return;
    if (!_this2.isInEditor(event.target)) return;

    event.preventDefault();

    var window = (0, _getWindow2.default)(event.target);
    var _props2 = _this2.props,
        state = _props2.state,
        editor = _props2.editor;
    var nativeEvent = event.nativeEvent;
    var dataTransfer = nativeEvent.dataTransfer,
        x = nativeEvent.x,
        y = nativeEvent.y;

    var data = (0, _getTransferData2.default)(dataTransfer);

    // Resolve the point where the drop occured.
    var range = void 0;

    // COMPAT: In Firefox, `caretRangeFromPoint` doesn't exist. (2016/07/25)
    if (window.document.caretRangeFromPoint) {
      range = window.document.caretRangeFromPoint(x, y);
    } else {
      range = window.document.createRange();
      range.setStart(nativeEvent.rangeParent, nativeEvent.rangeOffset);
    }

    var _range = range,
        startContainer = _range.startContainer,
        startOffset = _range.startOffset;

    var point = (0, _getPoint2.default)(startContainer, startOffset, state, editor);
    if (!point) return;

    var target = _selection2.default.create({
      anchorKey: point.key,
      anchorOffset: point.offset,
      focusKey: point.key,
      focusOffset: point.offset,
      isFocused: true
    });

    // Add drop-specific information to the data.
    data.target = target;

    // COMPAT: Edge throws "Permission denied" errors when
    // accessing `dropEffect` or `effectAllowed` (2017/7/12)
    try {
      data.effect = dataTransfer.dropEffect;
    } catch (err) {
      data.effect = null;
    }

    if (data.type == 'fragment' || data.type == 'node') {
      data.isInternal = _this2.tmp.isInternalDrag;
    }

    debug('onDrop', { event: event, data: data });
    _this2.props.onDrop(event, data);
  };

  this.onInput = function (event) {
    if (_this2.tmp.isComposing) return;
    if (_this2.props.state.isBlurred) return;
    if (!_this2.isInEditor(event.target)) return;
    debug('onInput', { event: event });

    var window = (0, _getWindow2.default)(event.target);
    var _props3 = _this2.props,
        state = _props3.state,
        editor = _props3.editor;

    // Get the selection point.

    var native = window.getSelection();
    var anchorNode = native.anchorNode,
        anchorOffset = native.anchorOffset;

    var point = (0, _getPoint2.default)(anchorNode, anchorOffset, state, editor);
    if (!point) return;

    // Get the range in question.
    var key = point.key,
        index = point.index,
        start = point.start,
        end = point.end;
    var document = state.document,
        selection = state.selection;

    var schema = editor.getSchema();
    var decorators = document.getDescendantDecorators(key, schema);
    var node = document.getDescendant(key);
    var block = document.getClosestBlock(node.key);
    var ranges = node.getRanges(decorators);
    var lastText = block.getLastText();

    // Get the text information.
    var textContent = anchorNode.textContent;

    var lastChar = textContent.charAt(textContent.length - 1);
    var isLastText = node == lastText;
    var isLastRange = index == ranges.size - 1;

    // If we're dealing with the last leaf, and the DOM text ends in a new line,
    // we will have added another new line in <Leaf>'s render method to account
    // for browsers collapsing a single trailing new lines, so remove it.
    if (isLastText && isLastRange && lastChar == '\n') {
      textContent = textContent.slice(0, -1);
    }

    // If the text is no different, abort.
    var range = ranges.get(index);
    var text = range.text,
        marks = range.marks;

    if (textContent == text) return;

    // Determine what the selection should be after changing the text.
    var delta = textContent.length - text.length;
    var after = selection.collapseToEnd().move(delta);

    // Create an updated state with the text replaced.
    var next = state.transform().select({
      anchorKey: key,
      anchorOffset: start,
      focusKey: key,
      focusOffset: end
    }).delete().insertText(textContent, marks).select(after).apply();

    // Change the current state.
    _this2.onChange(next);
  };

  this.onKeyDown = function (event) {
    if (_this2.props.readOnly) return;
    if (!_this2.isInEditor(event.target)) return;

    var altKey = event.altKey,
        ctrlKey = event.ctrlKey,
        metaKey = event.metaKey,
        shiftKey = event.shiftKey,
        which = event.which;

    var key = (0, _keycode2.default)(which);
    var data = {};

    // Keep track of an `isShifting` flag, because it's often used to trigger
    // "Paste and Match Style" commands, but isn't available on the event in a
    // normal paste event.
    if (key == 'shift') {
      _this2.tmp.isShifting = true;
    }

    // When composing, these characters commit the composition but also move the
    // selection before we're able to handle it, so prevent their default,
    // selection-moving behavior.
    if (_this2.tmp.isComposing && (key == 'left' || key == 'right' || key == 'up' || key == 'down')) {
      event.preventDefault();
      return;
    }

    // Add helpful properties for handling hotkeys to the data object.
    data.code = which;
    data.key = key;
    data.isAlt = altKey;
    data.isCmd = _environment.IS_MAC ? metaKey && !altKey : false;
    data.isCtrl = ctrlKey && !altKey;
    data.isLine = _environment.IS_MAC ? metaKey : false;
    data.isMeta = metaKey;
    data.isMod = _environment.IS_MAC ? metaKey && !altKey : ctrlKey && !altKey;
    data.isModAlt = _environment.IS_MAC ? metaKey && altKey : ctrlKey && altKey;
    data.isShift = shiftKey;
    data.isWord = _environment.IS_MAC ? altKey : ctrlKey;

    // These key commands have native behavior in contenteditable elements which
    // will cause our state to be out of sync, so prevent them.
    if (key == 'enter' || key == 'backspace' || key == 'delete' || key == 'b' && data.isMod || key == 'i' && data.isMod || key == 'y' && data.isMod || key == 'z' && data.isMod) {
      event.preventDefault();
    }

    debug('onKeyDown', { event: event, data: data });
    _this2.props.onKeyDown(event, data);
  };

  this.onKeyUp = function (event) {
    var which = event.which;

    var key = (0, _keycode2.default)(which);

    if (key == 'shift') {
      _this2.tmp.isShifting = false;
    }
  };

  this.onPaste = function (event) {
    if (_this2.props.readOnly) return;
    if (!_this2.isInEditor(event.target)) return;

    event.preventDefault();
    var data = (0, _getTransferData2.default)(event.clipboardData);

    // Attach the `isShift` flag, so that people can use it to trigger "Paste
    // and Match Style" logic.
    data.isShift = !!_this2.tmp.isShifting;

    debug('onPaste', { event: event, data: data });
    _this2.props.onPaste(event, data);
  };

  this.onSelect = function (event) {
    if (_this2.props.readOnly) return;
    if (_this2.tmp.isCopying) return;
    if (_this2.tmp.isComposing) return;
    if (_this2.tmp.isSelecting) return;
    if (!_this2.isInEditor(event.target)) return;

    var window = (0, _getWindow2.default)(event.target);
    var _props4 = _this2.props,
        state = _props4.state,
        editor = _props4.editor;
    var document = state.document,
        selection = state.selection;

    var native = window.getSelection();
    var data = {};

    // If there are no ranges, the editor was blurred natively.
    if (!native.rangeCount) {
      data.selection = selection.set('isFocused', false);
      data.isNative = true;
    }

    // Otherwise, determine the Slate selection from the native one.
    else {
        var anchorNode = native.anchorNode,
            anchorOffset = native.anchorOffset,
            focusNode = native.focusNode,
            focusOffset = native.focusOffset;

        var anchor = (0, _getPoint2.default)(anchorNode, anchorOffset, state, editor);
        var focus = (0, _getPoint2.default)(focusNode, focusOffset, state, editor);
        if (!anchor || !focus) return;

        // There are situations where a select event will fire with a new native
        // selection that resolves to the same internal position. In those cases
        // we don't need to trigger any changes, since our internal model is
        // already up to date, but we do want to update the native selection again
        // to make sure it is in sync.
        if (anchor.key == selection.anchorKey && anchor.offset == selection.anchorOffset && focus.key == selection.focusKey && focus.offset == selection.focusOffset && selection.isFocused) {
          _this2.updateSelection();
          return;
        }

        var properties = {
          anchorKey: anchor.key,
          anchorOffset: anchor.offset,
          focusKey: focus.key,
          focusOffset: focus.offset,
          isFocused: true,
          isBackward: null
        };

        // If the selection is at the end of a non-void inline node, and there is
        // a node after it, put it in the node after instead.
        var anchorText = document.getNode(anchor.key);
        var focusText = document.getNode(focus.key);
        var anchorInline = document.getClosestInline(anchor.key);
        var focusInline = document.getClosestInline(focus.key);

        if (anchorInline && !anchorInline.isVoid && anchor.offset == anchorText.length) {
          var block = document.getClosestBlock(anchor.key);
          var next = block.getNextText(anchor.key);
          if (next) {
            properties.anchorKey = next.key;
            properties.anchorOffset = 0;
          }
        }

        if (focusInline && !focusInline.isVoid && focus.offset == focusText.length) {
          var _block = document.getClosestBlock(focus.key);
          var _next = _block.getNextText(focus.key);
          if (_next) {
            properties.focusKey = _next.key;
            properties.focusOffset = 0;
          }
        }

        data.selection = selection.merge(properties).normalize(document);
      }

    debug('onSelect', { event: event, data: data });
    _this2.props.onSelect(event, data);
  };

  this.render = function () {
    var props = _this2.props;
    var className = props.className,
        readOnly = props.readOnly,
        state = props.state,
        tabIndex = props.tabIndex,
        role = props.role;
    var document = state.document;

    var children = document.nodes.map(function (node) {
      return _this2.renderNode(node);
    }).toArray();

    var style = _extends({
      // Prevent the default outline styles.
      outline: 'none',
      // Preserve adjacent whitespace and new lines.
      whiteSpace: 'pre-wrap',
      // Allow words to break if they are too long.
      wordWrap: 'break-word'
    }, readOnly ? {} : { WebkitUserModify: 'read-write-plaintext-only' }, props.style);

    // COMPAT: In Firefox, spellchecking can remove entire wrapping elements
    // including inline ones like `<a>`, which is jarring for the user but also
    // causes the DOM to get into an irreconcilable state. (2016/09/01)
    var spellCheck = _environment.IS_FIREFOX ? false : props.spellCheck;

    debug('render', { props: props });

    return _react2.default.createElement(
      'div',
      {
        'data-slate-editor': true,
        key: _this2.tmp.forces,
        ref: _this2.ref,
        'data-key': document.key,
        contentEditable: !readOnly,
        suppressContentEditableWarning: true,
        className: className,
        onBeforeInput: _this2.onBeforeInput,
        onBlur: _this2.onBlur,
        onFocus: _this2.onFocus,
        onCompositionEnd: _this2.onCompositionEnd,
        onCompositionStart: _this2.onCompositionStart,
        onCopy: _this2.onCopy,
        onCut: _this2.onCut,
        onDragEnd: _this2.onDragEnd,
        onDragOver: _this2.onDragOver,
        onDragStart: _this2.onDragStart,
        onDrop: _this2.onDrop,
        onInput: _this2.onInput,
        onKeyDown: _this2.onKeyDown,
        onKeyUp: _this2.onKeyUp,
        onPaste: _this2.onPaste,
        onSelect: _this2.onSelect,
        autoCorrect: props.autoCorrect,
        spellCheck: spellCheck,
        style: style,
        role: readOnly ? null : role || 'textbox',
        tabIndex: tabIndex
        // COMPAT: The Grammarly Chrome extension works by changing the DOM out
        // from under `contenteditable` elements, which leads to weird behaviors
        // so we have to disable it like this. (2017/04/24)
        , 'data-gramm': false
      },
      children,
      _this2.props.children
    );
  };

  this.renderNode = function (node) {
    var _props5 = _this2.props,
        editor = _props5.editor,
        readOnly = _props5.readOnly,
        schema = _props5.schema,
        state = _props5.state;


    return _react2.default.createElement(_node2.default, {
      key: node.key,
      block: null,
      node: node,
      parent: state.document,
      schema: schema,
      state: state,
      editor: editor,
      readOnly: readOnly
    });
  };
};

exports.default = Content;

},{"../constants/environment":83,"../constants/types":85,"../models/selection":96,"../serializers/base-64":103,"../utils/extend-selection":117,"../utils/find-closest-node":118,"../utils/find-deepest-node":119,"../utils/get-point":122,"../utils/get-transfer-data":123,"../utils/set-transfer-data":132,"./node":80,"debug":3,"get-window":62,"keycode":66,"prop-types":72}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reactPortal = require('react-portal');

var _reactPortal2 = _interopRequireDefault(_reactPortal);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _stack = require('../models/stack');

var _stack2 = _interopRequireDefault(_stack);

var _state = require('../models/state');

var _state2 = _interopRequireDefault(_state);

var _noop = require('../utils/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:editor');

/**
 * Event handlers to mix in to the editor.
 *
 * @type {Array}
 */

var EVENT_HANDLERS = ['onBeforeInput', 'onBlur', 'onFocus', 'onCopy', 'onCut', 'onDrop', 'onKeyDown', 'onPaste', 'onSelect'];

/**
 * Plugin-related properties of the editor.
 *
 * @type {Array}
 */

var PLUGINS_PROPS = [].concat(EVENT_HANDLERS, ['placeholder', 'placeholderClassName', 'placeholderStyle', 'plugins', 'schema']);

/**
 * Editor.
 *
 * @type {Component}
 */

var Editor = function (_React$Component) {
  _inherits(Editor, _React$Component);

  /**
   * When constructed, create a new `Stack` and run `onBeforeChange`.
   *
   * @param {Object} props
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  function Editor(props) {
    _classCallCheck(this, Editor);

    var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _initialiseProps.call(_this);

    _this.tmp = {};
    _this.state = {};

    // Create a new `Stack`, omitting the `onChange` property since that has
    // special significance on the editor itself.

    var onChange = props.onChange,
        rest = _objectWithoutProperties(props, ['onChange']); // eslint-disable-line no-unused-vars


    var stack = _stack2.default.create(rest);
    _this.state.stack = stack;

    // Resolve the state, running `onBeforeChange` first.
    var state = stack.onBeforeChange(props.state, _this);
    _this.cacheState(state);
    _this.state.state = state;

    // Create a bound event handler for each event.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var method = _step.value;

        _this[method] = function () {
          var _this$state$stack;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var next = (_this$state$stack = _this.state.stack)[method].apply(_this$state$stack, [_this.state.state, _this].concat(args));
          _this.onChange(next);
        };
      };

      for (var _iterator = EVENT_HANDLERS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return _this;
  }

  /**
   * When the `props` are updated, create a new `Stack` if necessary, and
   * run `onBeforeChange`.
   *
   * @param {Object} props
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  /**
   * Cache a `state` in memory to be able to compare against it later, for
   * things like `onDocumentChange`.
   *
   * @param {State} state
   */

  /**
   * Programmatically blur the editor.
   */

  /**
   * Programmatically focus the editor.
   */

  /**
   * Get the editor's current schema.
   *
   * @return {Schema}
   */

  /**
   * Get the editor's current state.
   *
   * @return {State}
   */

  /**
   * When the `state` changes, pass through plugins, then bubble up.
   *
   * @param {State} state
   */

  /**
   * Render the editor.
   *
   * @return {Element}
   */

  return Editor;
}(_react2.default.Component);

/**
 * Mix in the property types for the event handlers.
 */

Editor.propTypes = {
  autoCorrect: _propTypes2.default.bool,
  autoFocus: _propTypes2.default.bool,
  className: _propTypes2.default.string,
  onBeforeChange: _propTypes2.default.func,
  onChange: _propTypes2.default.func,
  onDocumentChange: _propTypes2.default.func,
  onSelectionChange: _propTypes2.default.func,
  placeholder: _propTypes2.default.any,
  placeholderClassName: _propTypes2.default.string,
  placeholderStyle: _propTypes2.default.object,
  plugins: _propTypes2.default.array,
  readOnly: _propTypes2.default.bool,
  role: _propTypes2.default.string,
  schema: _propTypes2.default.object,
  spellCheck: _propTypes2.default.bool,
  state: _propTypes2.default.instanceOf(_state2.default).isRequired,
  style: _propTypes2.default.object,
  tabIndex: _propTypes2.default.number
};
Editor.defaultProps = {
  autoFocus: false,
  autoCorrect: true,
  onChange: _noop2.default,
  onDocumentChange: _noop2.default,
  onSelectionChange: _noop2.default,
  plugins: [],
  readOnly: false,
  schema: {},
  spellCheck: true
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.componentWillReceiveProps = function (props) {
    var stack = _this2.state.stack;

    // If any plugin-related properties will change, create a new `Stack`.

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = PLUGINS_PROPS[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var prop = _step3.value;

        if (props[prop] == _this2.props[prop]) continue;

        var onChange = props.onChange,
            rest = _objectWithoutProperties(props, ['onChange']); // eslint-disable-line no-unused-vars


        stack = _stack2.default.create(rest);
        _this2.setState({ stack: stack });
      }

      // Resolve the state, running the before change handler of the stack.
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var state = stack.onBeforeChange(props.state, _this2);
    _this2.cacheState(state);
    _this2.setState({ state: state });
  };

  this.cacheState = function (state) {
    _this2.tmp.document = state.document;
    _this2.tmp.selection = state.selection;
  };

  this.blur = function () {
    var state = _this2.state.state.transform().blur().apply();

    _this2.onChange(state);
  };

  this.focus = function () {
    var state = _this2.state.state.transform().focus().apply();

    _this2.onChange(state);
  };

  this.getSchema = function () {
    return _this2.state.stack.schema;
  };

  this.getState = function () {
    return _this2.state.state;
  };

  this.onChange = function (state) {
    if (state == _this2.state.state) return;
    var tmp = _this2.tmp,
        props = _this2.props;
    var stack = _this2.state.stack;
    var onChange = props.onChange,
        onDocumentChange = props.onDocumentChange,
        onSelectionChange = props.onSelectionChange;
    var document = tmp.document,
        selection = tmp.selection;


    state = stack.onChange(state, _this2);
    onChange(state);
    if (state.document != document) onDocumentChange(state.document, state);
    if (state.selection != selection) onSelectionChange(state.selection, state);
  };

  this.render = function () {
    var props = _this2.props,
        state = _this2.state;
    var stack = state.stack;

    var children = stack.renderPortal(state.state, _this2).map(function (child, i) {
      return _react2.default.createElement(
        _reactPortal2.default,
        { key: i, isOpened: true },
        child
      );
    });

    debug('render', { props: props, state: state });

    var tree = stack.render(state.state, _this2, _extends({}, props, { children: children }));
    return tree;
  };
};

var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
  for (var _iterator2 = EVENT_HANDLERS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    var property = _step2.value;

    Editor.propTypes[property] = _propTypes2.default.func;
  }

  /**
   * Export.
   *
   * @type {Component}
   */
} catch (err) {
  _didIteratorError2 = true;
  _iteratorError2 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion2 && _iterator2.return) {
      _iterator2.return();
    }
  } finally {
    if (_didIteratorError2) {
      throw _iteratorError2;
    }
  }
}

exports.default = Editor;

},{"../models/stack":97,"../models/state":98,"../utils/noop":127,"debug":3,"prop-types":72,"react-portal":74}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _reactDom = (window.ReactDOM);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _findDeepestNode = require('../utils/find-deepest-node');

var _findDeepestNode2 = _interopRequireDefault(_findDeepestNode);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debugger.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:leaf');

/**
 * Leaf.
 *
 * @type {Component}
 */

var Leaf = function (_React$Component) {
  _inherits(Leaf, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  function Leaf(props) {
    _classCallCheck(this, Leaf);

    var _this = _possibleConstructorReturn(this, (Leaf.__proto__ || Object.getPrototypeOf(Leaf)).call(this, props));

    _this.debug = function (message) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      debug.apply(undefined, [message, _this.props.node.key + '-' + _this.props.index].concat(args));
    };

    _this.tmp = {};
    _this.tmp.renders = 0;
    return _this;
  }

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  _createClass(Leaf, [{
    key: 'shouldComponentUpdate',


    /**
     * Should component update?
     *
     * @param {Object} props
     * @return {Boolean}
     */

    value: function shouldComponentUpdate(props) {
      // If any of the regular properties have changed, re-render.
      if (props.index != this.props.index || props.marks != this.props.marks || props.schema != this.props.schema || props.text != this.props.text) {
        return true;
      }

      // If the DOM text does not equal the `text` property, re-render, this can
      // happen because React gets out of sync when previously natively rendered.
      var el = (0, _findDeepestNode2.default)(_reactDom2.default.findDOMNode(this));
      var text = this.renderText(props);
      if (el.textContent != text) return true;

      // Otherwise, don't update.
      return false;
    }

    /**
     * Render the leaf.
     *
     * @return {Element}
     */

  }, {
    key: 'render',
    value: function render() {
      var props = this.props;
      var node = props.node,
          index = props.index;

      var offsetKey = _offsetKey2.default.stringify({
        key: node.key,
        index: index
      });

      // Increment the renders key, which forces a re-render whenever this
      // component is told it should update. This is required because "native"
      // renders where we don't update the leaves cause React's internal state to
      // get out of sync, causing it to not realize the DOM needs updating.
      this.tmp.renders++;

      this.debug('render', { props: props });

      return _react2.default.createElement(
        'span',
        { key: this.tmp.renders, 'data-offset-key': offsetKey },
        this.renderMarks(props)
      );
    }

    /**
     * Render the text content of the leaf, accounting for browsers.
     *
     * @param {Object} props
     * @return {Element}
     */

  }, {
    key: 'renderText',
    value: function renderText(props) {
      var block = props.block,
          node = props.node,
          parent = props.parent,
          text = props.text,
          index = props.index,
          ranges = props.ranges;

      // COMPAT: If the text is empty and it's the only child, we need to render a
      // <br/> to get the block to have the proper height.

      if (text == '' && parent.kind == 'block' && parent.text == '') return _react2.default.createElement('br', null);

      // COMPAT: If the text is empty otherwise, it's because it's on the edge of
      // an inline void node, so we render a zero-width space so that the
      // selection can be inserted next to it still.
      if (text == '') {
        // COMPAT: In Chrome, zero-width space produces graphics glitches, so use
        // hair space in place of it. (2017/02/12)
        var space = _environment.IS_FIREFOX ? '\u200B' : '\u200A';
        return _react2.default.createElement(
          'span',
          { 'data-slate-zero-width': true },
          space
        );
      }

      // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
      // so we need to add an extra trailing new lines to prevent that.
      var lastText = block.getLastText();
      var lastChar = text.charAt(text.length - 1);
      var isLastText = node == lastText;
      var isLastRange = index == ranges.size - 1;
      if (isLastText && isLastRange && lastChar == '\n') return text + '\n';

      // Otherwise, just return the text.
      return text;
    }

    /**
     * Render all of the leaf's mark components.
     *
     * @param {Object} props
     * @return {Element}
     */

  }, {
    key: 'renderMarks',
    value: function renderMarks(props) {
      var marks = props.marks,
          schema = props.schema,
          node = props.node,
          offset = props.offset,
          text = props.text,
          state = props.state,
          editor = props.editor;

      var children = this.renderText(props);

      return marks.reduce(function (memo, mark) {
        var Component = mark.getComponent(schema);
        if (!Component) return memo;
        return _react2.default.createElement(
          Component,
          {
            editor: editor,
            mark: mark,
            marks: marks,
            node: node,
            offset: offset,
            schema: schema,
            state: state,
            text: text
          },
          memo
        );
      }, children);
    }
  }]);

  return Leaf;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Leaf.propTypes = {
  block: _propTypes2.default.object.isRequired,
  editor: _propTypes2.default.object.isRequired,
  index: _propTypes2.default.number.isRequired,
  marks: _propTypes2.default.object.isRequired,
  node: _propTypes2.default.object.isRequired,
  offset: _propTypes2.default.number.isRequired,
  parent: _propTypes2.default.object.isRequired,
  ranges: _propTypes2.default.object.isRequired,
  schema: _propTypes2.default.object.isRequired,
  state: _propTypes2.default.object.isRequired,
  text: _propTypes2.default.string.isRequired
};
exports.default = Leaf;

},{"../constants/environment":83,"../utils/find-deepest-node":119,"../utils/offset-key":130,"debug":3,"prop-types":72}],80:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _reactDom = (window.ReactDOM);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _types = require('../constants/types');

var _types2 = _interopRequireDefault(_types);

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _leaf = require('./leaf');

var _leaf2 = _interopRequireDefault(_leaf);

var _void = require('./void');

var _void2 = _interopRequireDefault(_void);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _scrollToSelection = require('../utils/scroll-to-selection');

var _scrollToSelection2 = _interopRequireDefault(_scrollToSelection);

var _setTransferData = require('../utils/set-transfer-data');

var _setTransferData2 = _interopRequireDefault(_setTransferData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:node');

/**
 * Node.
 *
 * @type {Component}
 */

var Node = function (_React$Component) {
  _inherits(Node, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  function Node(props) {
    _classCallCheck(this, Node);

    var _this = _possibleConstructorReturn(this, (Node.__proto__ || Object.getPrototypeOf(Node)).call(this, props));

    _initialiseProps.call(_this);

    var node = props.node,
        schema = props.schema;

    _this.state = {};
    _this.state.Component = node.kind == 'text' ? null : node.getComponent(schema);
    return _this;
  }

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * On receiving new props, update the `Component` renderer.
   *
   * @param {Object} props
   */

  /**
   * Should the node update?
   *
   * @param {Object} nextProps
   * @param {Object} state
   * @return {Boolean}
   */

  /**
   * On mount, update the scroll position.
   */

  /**
   * After update, update the scroll position if the node's content changed.
   *
   * @param {Object} prevProps
   * @param {Object} prevState
   */

  /**
   * There is a corner case, that some nodes are unmounted right after they update
   * Then, when the timer execute, it will throw the error
   * `findDOMNode was called on an unmounted component`
   * We should clear the timer from updateScroll here
   */

  /**
   * Update the scroll position after a change as occured if this is a leaf
   * block and it has the selection's ending edge. This ensures that scrolling
   * matches native `contenteditable` behavior even for cases where the edit is
   * not applied natively, like when enter is pressed.
   */

  /**
   * On drag start, add a serialized representation of the node to the data.
   *
   * @param {Event} e
   */

  /**
   * Render.
   *
   * @return {Element}
   */

  /**
   * Render a `child` node.
   *
   * @param {Node} child
   * @return {Element}
   */

  /**
   * Render an element `node`.
   *
   * @return {Element}
   */

  /**
   * Render a text node.
   *
   * @return {Element}
   */

  /**
   * Render a single leaf node given a `range` and `offset`.
   *
   * @param {List<Range>} ranges
   * @param {Range} range
   * @param {Number} index
   * @param {Number} offset
   * @return {Element} leaf
   */

  return Node;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Node.propTypes = {
  block: _propTypes2.default.object,
  editor: _propTypes2.default.object.isRequired,
  node: _propTypes2.default.object.isRequired,
  parent: _propTypes2.default.object.isRequired,
  readOnly: _propTypes2.default.bool.isRequired,
  schema: _propTypes2.default.object.isRequired,
  state: _propTypes2.default.object.isRequired
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.debug = function (message) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var node = _this2.props.node;
    var key = node.key,
        kind = node.kind,
        type = node.type;

    var id = kind == 'text' ? key + ' (' + kind + ')' : key + ' (' + type + ')';
    debug.apply(undefined, [message, '' + id].concat(args));
  };

  this.componentWillReceiveProps = function (props) {
    if (props.node.kind == 'text') return;
    if (props.node == _this2.props.node) return;
    var Component = props.node.getComponent(props.schema);
    _this2.setState({ Component: Component });
  };

  this.shouldComponentUpdate = function (nextProps) {
    var props = _this2.props;
    var Component = _this2.state.Component;

    // If the `Component` has enabled suppression of update checking, always
    // return true so that it can deal with update checking itself.

    if (Component && Component.suppressShouldComponentUpdate) return true;

    // If the `readOnly` status has changed, re-render in case there is any
    // user-land logic that depends on it, like nested editable contents.
    if (nextProps.readOnly != props.readOnly) return true;

    // If the node has changed, update. PERF: There are cases where it will have
    // changed, but it's properties will be exactly the same (eg. copy-paste)
    // which this won't catch. But that's rare and not a drag on performance, so
    // for simplicity we just let them through.
    if (nextProps.node != props.node) return true;

    // If the node is a block or inline, which can have custom renderers, we
    // include an extra check to re-render if the node's focus changes, to make
    // it simple for users to show a node's "selected" state.
    if (nextProps.node.kind != 'text') {
      var hasEdgeIn = props.state.selection.hasEdgeIn(props.node);
      var nextHasEdgeIn = nextProps.state.selection.hasEdgeIn(nextProps.node);
      var hasFocus = props.state.isFocused || nextProps.state.isFocused;
      var hasEdge = hasEdgeIn || nextHasEdgeIn;
      if (hasFocus && hasEdge) return true;
    }

    // If the node is a text node, re-render if the current decorations have
    // changed, even if the content of the text node itself hasn't.
    if (nextProps.node.kind == 'text' && nextProps.schema.hasDecorators) {
      var nextDecorators = nextProps.state.document.getDescendantDecorators(nextProps.node.key, nextProps.schema);
      var decorators = props.state.document.getDescendantDecorators(props.node.key, props.schema);
      var nextRanges = nextProps.node.getRanges(nextDecorators);
      var ranges = props.node.getRanges(decorators);
      if (!nextRanges.equals(ranges)) return true;
    }

    // If the node is a text node, and its parent is a block node, and it was
    // the last child of the block, re-render to cleanup extra `<br/>` or `\n`.
    if (nextProps.node.kind == 'text' && nextProps.parent.kind == 'block') {
      var last = props.parent.nodes.last();
      var nextLast = nextProps.parent.nodes.last();
      if (props.node == last && nextProps.node != nextLast) return true;
    }

    // Otherwise, don't update.
    return false;
  };

  this.componentDidMount = function () {
    _this2.updateScroll();
  };

  this.componentDidUpdate = function (prevProps, prevState) {
    if (_this2.props.node != prevProps.node) _this2.updateScroll();
  };

  this.componentWillUnmount = function () {
    clearTimeout(_this2.scrollTimer);
  };

  this.updateScroll = function () {
    var _props = _this2.props,
        node = _props.node,
        state = _props.state;
    var selection = state.selection;

    // If this isn't a block, or it's a wrapping block, abort.

    if (node.kind != 'block') return;
    if (node.nodes.first().kind == 'block') return;

    // If the selection is blurred, or this block doesn't contain it, abort.
    if (selection.isBlurred) return;
    if (!selection.hasEndIn(node)) return;

    // The native selection will be updated after componentDidMount or componentDidUpdate.
    // Use setTimeout to queue scrolling to the last when the native selection has been updated to the correct value.
    _this2.scrollTimer = setTimeout(function () {
      var el = _reactDom2.default.findDOMNode(_this2);
      var window = (0, _getWindow2.default)(el);
      var native = window.getSelection();
      (0, _scrollToSelection2.default)(native);

      _this2.debug('updateScroll', el);
    });
  };

  this.onDragStart = function (e) {
    var node = _this2.props.node;

    // Only void node are draggable

    if (!node.isVoid) {
      return;
    }

    var encoded = _base2.default.serializeNode(node, { preserveKeys: true });
    var dataTransfer = e.nativeEvent.dataTransfer;


    (0, _setTransferData2.default)(dataTransfer, _types2.default.NODE, encoded);

    _this2.debug('onDragStart', e);
  };

  this.render = function () {
    var props = _this2.props;
    var node = _this2.props.node;


    _this2.debug('render', { props: props });

    return node.kind == 'text' ? _this2.renderText() : _this2.renderElement();
  };

  this.renderNode = function (child) {
    var _props2 = _this2.props,
        block = _props2.block,
        editor = _props2.editor,
        node = _props2.node,
        readOnly = _props2.readOnly,
        schema = _props2.schema,
        state = _props2.state;

    return _react2.default.createElement(Node, {
      key: child.key,
      node: child,
      block: node.kind == 'block' ? node : block,
      parent: node,
      editor: editor,
      readOnly: readOnly,
      schema: schema,
      state: state
    });
  };

  this.renderElement = function () {
    var _props3 = _this2.props,
        editor = _props3.editor,
        node = _props3.node,
        parent = _props3.parent,
        readOnly = _props3.readOnly,
        state = _props3.state;
    var Component = _this2.state.Component;

    var children = node.nodes.map(_this2.renderNode).toArray();

    // Attributes that the developer must to mix into the element in their
    // custom node renderer component.
    var attributes = {
      'data-key': node.key,
      'onDragStart': _this2.onDragStart
    };

    // If it's a block node with inline children, add the proper `dir` attribute
    // for text direction.
    if (node.kind == 'block' && node.nodes.first().kind != 'block') {
      var direction = node.getTextDirection();
      if (direction == 'rtl') attributes.dir = 'rtl';
    }

    var element = _react2.default.createElement(
      Component,
      {
        attributes: attributes,
        key: node.key,
        editor: editor,
        parent: parent,
        node: node,
        readOnly: readOnly,
        state: state
      },
      children
    );

    return node.isVoid ? _react2.default.createElement(
      _void2.default,
      _this2.props,
      element
    ) : element;
  };

  this.renderText = function () {
    var _props4 = _this2.props,
        node = _props4.node,
        schema = _props4.schema,
        state = _props4.state;
    var document = state.document;

    var decorators = schema.hasDecorators ? document.getDescendantDecorators(node.key, schema) : [];
    var ranges = node.getRanges(decorators);
    var offset = 0;

    var leaves = ranges.map(function (range, i) {
      var leaf = _this2.renderLeaf(ranges, range, i, offset);
      offset += range.text.length;
      return leaf;
    });

    return _react2.default.createElement(
      'span',
      { 'data-key': node.key },
      leaves
    );
  };

  this.renderLeaf = function (ranges, range, index, offset) {
    var _props5 = _this2.props,
        block = _props5.block,
        node = _props5.node,
        parent = _props5.parent,
        schema = _props5.schema,
        state = _props5.state,
        editor = _props5.editor;
    var text = range.text,
        marks = range.marks;


    return _react2.default.createElement(_leaf2.default, {
      key: node.key + '-' + index,
      block: block,
      editor: editor,
      index: index,
      marks: marks,
      node: node,
      offset: offset,
      parent: parent,
      ranges: ranges,
      schema: schema,
      state: state,
      text: text
    });
  };
};

exports.default = Node;

},{"../constants/types":85,"../serializers/base-64":103,"../utils/scroll-to-selection":131,"../utils/set-transfer-data":132,"./leaf":79,"./void":82,"debug":3,"get-window":62,"prop-types":72}],81:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Placeholder.
 *
 * @type {Component}
 */

var Placeholder = function (_React$Component) {
  _inherits(Placeholder, _React$Component);

  function Placeholder() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Placeholder);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Placeholder.__proto__ || Object.getPrototypeOf(Placeholder)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = function (props, state) {
      return props.children != _this.props.children || props.className != _this.props.className || props.firstOnly != _this.props.firstOnly || props.parent != _this.props.parent || props.node != _this.props.node || props.style != _this.props.style;
    }, _this.isVisible = function () {
      var _this$props = _this.props,
          firstOnly = _this$props.firstOnly,
          node = _this$props.node,
          parent = _this$props.parent;

      if (node.text) return false;

      if (firstOnly) {
        if (parent.nodes.size > 1) return false;
        if (parent.nodes.first() === node) return true;
        return false;
      } else {
        return true;
      }
    }, _this.render = function () {
      var isVisible = _this.isVisible();
      if (!isVisible) return null;

      var _this$props2 = _this.props,
          children = _this$props2.children,
          className = _this$props2.className;
      var style = _this.props.style;


      if (typeof children === 'string' && style == null && className == null) {
        style = { opacity: '0.333' };
      } else if (style == null) {
        style = {};
      }

      var styles = _extends({
        position: 'absolute',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
        pointerEvents: 'none'
      }, style);

      return _react2.default.createElement(
        'span',
        { contentEditable: false, className: className, style: styles },
        children
      );
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * Default properties.
   *
   * @type {Object}
   */

  /**
   * Should the placeholder update?
   *
   * @param {Object} props
   * @param {Object} state
   * @return {Boolean}
   */

  /**
   * Is the placeholder visible?
   *
   * @return {Boolean}
   */

  /**
   * Render.
   *
   * If the placeholder is a string, and no `className` or `style` has been
   * passed, give it a default style of lowered opacity.
   *
   * @return {Element}
   */

  return Placeholder;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Placeholder.propTypes = {
  children: _propTypes2.default.any.isRequired,
  className: _propTypes2.default.string,
  firstOnly: _propTypes2.default.bool,
  node: _propTypes2.default.object.isRequired,
  parent: _propTypes2.default.object,
  state: _propTypes2.default.object.isRequired,
  style: _propTypes2.default.object
};
Placeholder.defaultProps = {
  firstOnly: true
};
exports.default = Placeholder;

},{"prop-types":72}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _leaf = require('./leaf');

var _leaf2 = _interopRequireDefault(_leaf);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:void');

/**
 * Void.
 *
 * @type {Component}
 */

var Void = function (_React$Component) {
  _inherits(Void, _React$Component);

  function Void() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Void);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Void.__proto__ || Object.getPrototypeOf(Void)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
  }

  /**
   * Property types.
   *
   * @type {Object}
   */

  /**
   * State
   *
   * @type {Object}
   */

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * When one of the wrapper elements it clicked, select the void node.
   *
   * @param {Event} event
   */

  /**
   * Increment counter, and temporarily switch node to editable to allow drop events
   * Counter required as onDragLeave fires when hovering over child elements
   *
   * @param {Event} event
   */

  /**
   * Decrement counter, and if counter 0, then no longer dragging over node
   * and thus switch back to non-editable
   *
   * @param {Event} event
   */

  /**
   * If dropped item onto node, then reset state
   *
   * @param {Event} event
   */

  /**
   * Render.
   *
   * @return {Element}
   */

  /**
   * Render a fake spacer leaf, which will catch the cursor when it the void
   * node is navigated to with the arrow keys. Having this spacer there means
   * the browser continues to manage the selection natively, so it keeps track
   * of the right offset when moving across the block.
   *
   * @return {Element}
   */

  /**
   * Render a fake leaf.
   *
   * @return {Element}
   */

  return Void;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Void.propTypes = {
  block: _propTypes2.default.object,
  children: _propTypes2.default.any.isRequired,
  editor: _propTypes2.default.object.isRequired,
  node: _propTypes2.default.object.isRequired,
  parent: _propTypes2.default.object.isRequired,
  readOnly: _propTypes2.default.bool.isRequired,
  schema: _propTypes2.default.object.isRequired,
  state: _propTypes2.default.object.isRequired
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.state = {
    dragCounter: 0,
    editable: false
  };

  this.debug = function (message) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var node = _this2.props.node;
    var key = node.key,
        type = node.type;

    var id = key + ' (' + type + ')';
    debug.apply(undefined, [message, '' + id].concat(args));
  };

  this.onClick = function (event) {
    if (_this2.props.readOnly) return;

    _this2.debug('onClick', { event: event });

    var _props = _this2.props,
        node = _props.node,
        editor = _props.editor;

    var next = editor.getState().transform()
    // COMPAT: In Chrome & Safari, selections that are at the zero offset of
    // an inline node will be automatically replaced to be at the last offset
    // of a previous inline node, which screws us up, so we always want to set
    // it to the end of the node. (2016/11/29)
    .collapseToEndOf(node).focus().apply();

    editor.onChange(next);
  };

  this.onDragEnter = function () {
    _this2.setState(function (prevState) {
      var dragCounter = prevState.dragCounter + 1;
      return { dragCounter: dragCounter, editable: undefined };
    });
  };

  this.onDragLeave = function () {
    _this2.setState(function (prevState) {
      var dragCounter = prevState.dragCounter + 1;
      var editable = dragCounter === 0 ? false : undefined;
      return { dragCounter: dragCounter, editable: editable };
    });
  };

  this.onDrop = function () {
    _this2.setState({ dragCounter: 0, editable: false });
  };

  this.render = function () {
    var props = _this2.props;
    var children = props.children,
        node = props.node;

    var Tag = void 0,
        style = void 0;

    // Make the outer wrapper relative, so the spacer can overlay it.
    if (node.kind === 'block') {
      Tag = 'div';
      style = { position: 'relative' };
    } else {
      Tag = 'span';
    }

    _this2.debug('render', { props: props });

    return _react2.default.createElement(
      Tag,
      {
        'data-slate-void': true,
        style: style,
        onClick: _this2.onClick,
        onDragEnter: _this2.onDragEnter,
        onDragLeave: _this2.onDragLeave,
        onDrop: _this2.onDrop
      },
      _this2.renderSpacer(),
      _react2.default.createElement(
        Tag,
        { contentEditable: _this2.state.editable },
        children
      )
    );
  };

  this.renderSpacer = function () {
    var node = _this2.props.node;

    var style = void 0;

    if (node.kind == 'block') {
      style = _environment.IS_FIREFOX ? {
        pointerEvents: 'none',
        width: '0px',
        height: '0px',
        lineHeight: '0px',
        visibility: 'hidden'
      } : {
        position: 'absolute',
        top: '0px',
        left: '-9999px',
        textIndent: '-9999px'
      };
    } else {
      style = {
        color: 'transparent'
      };
    }

    return _react2.default.createElement(
      'span',
      { style: style },
      _this2.renderLeaf()
    );
  };

  this.renderLeaf = function () {
    var _props2 = _this2.props,
        block = _props2.block,
        node = _props2.node,
        schema = _props2.schema,
        state = _props2.state,
        editor = _props2.editor;

    var child = node.getFirstText();
    var ranges = child.getRanges();
    var text = '';
    var offset = 0;
    var marks = _mark2.default.createSet();
    var index = 0;
    var offsetKey = _offsetKey2.default.stringify({
      key: child.key,
      index: index
    });

    return _react2.default.createElement(_leaf2.default, {
      key: offsetKey,
      block: node.kind == 'block' ? node : block,
      editor: editor,
      index: index,
      marks: marks,
      node: child,
      offset: offset,
      parent: node,
      ranges: ranges,
      schema: schema,
      state: state,
      text: text
    });
  };
};

exports.default = Void;

},{"../constants/environment":83,"../models/mark":92,"../utils/offset-key":130,"./leaf":79,"debug":3,"prop-types":72}],83:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IS_WINDOWS = exports.IS_MAC = exports.IS_SAFARI = exports.IS_FIREFOX = exports.IS_CHROME = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _isInBrowser = require('is-in-browser');

var _isInBrowser2 = _interopRequireDefault(_isInBrowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Browser matching rules.
 *
 * @type {Array}
 */

var BROWSER_RULES = [['edge', /Edge\/([0-9\._]+)/], ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/], ['firefox', /Firefox\/([0-9\.]+)(?:\s|$)/], ['opera', /Opera\/([0-9\.]+)(?:\s|$)/], ['opera', /OPR\/([0-9\.]+)(:?\s|$)$/], ['ie', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/], ['ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/], ['ie', /MSIE\s(7\.0)/], ['android', /Android\s([0-9\.]+)/], ['safari', /Version\/([0-9\._]+).*Safari/]];

/**
 * Operating system matching rules.
 *
 * @type {Array}
 */

var OS_RULES = [['macos', /mac os x/i], ['ios', /os ([\.\_\d]+) like mac os/i], ['android', /android/i], ['firefoxos', /mozilla\/[a-z\.\_\d]+ \((?:mobile)|(?:tablet)/i], ['windows', /windows\s*(?:nt)?\s*([\.\_\d]+)/i]];

/**
 * Define variables to store the result.
 */

var BROWSER = void 0;
var OS = void 0;

/**
 * Run the matchers when in browser.
 */

if (_isInBrowser2.default) {
  var userAgent = window.navigator.userAgent;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {

    for (var _iterator = BROWSER_RULES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var rule = _step.value;

      var _rule = _slicedToArray(rule, 2),
          name = _rule[0],
          regexp = _rule[1];

      if (regexp.test(userAgent)) {
        BROWSER = name;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = OS_RULES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _rule2 = _step2.value;

      var _rule3 = _slicedToArray(_rule2, 2),
          name = _rule3[0],
          regexp = _rule3[1];

      if (regexp.test(userAgent)) {
        OS = name;
        break;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

var IS_CHROME = exports.IS_CHROME = BROWSER === 'chrome';
var IS_FIREFOX = exports.IS_FIREFOX = BROWSER === 'firefox';
var IS_SAFARI = exports.IS_SAFARI = BROWSER === 'safari';

var IS_MAC = exports.IS_MAC = OS === 'macos';
var IS_WINDOWS = exports.IS_WINDOWS = OS === 'windows';

},{"is-in-browser":65}],84:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Is in development?
 *
 * @type {Boolean}
 */

var IS_DEV = typeof process !== 'undefined' && process.env && "production" !== 'production';

/**
 * Export.
 *
 * @type {Boolean}
 */

exports.default = IS_DEV;

}).call(this,require('_process'))
},{"_process":68}],85:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Slate-specific data transfer types.
 *
 * @type {Object}
 */

var TYPES = {
  FRAGMENT: 'application/x-slate-fragment',
  NODE: 'application/x-slate-node'
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = TYPES;

},{}],86:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setKeyGenerator = exports.resetKeyGenerator = exports.findDOMNode = exports.Transforms = exports.Text = exports.State = exports.Stack = exports.Selection = exports.Schema = exports.Raw = exports.Range = exports.Plain = exports.Placeholder = exports.Mark = exports.Inline = exports.Html = exports.Editor = exports.Document = exports.Data = exports.Character = exports.Block = undefined;

var _editor = require('./components/editor');

var _editor2 = _interopRequireDefault(_editor);

var _placeholder = require('./components/placeholder');

var _placeholder2 = _interopRequireDefault(_placeholder);

var _block = require('./models/block');

var _block2 = _interopRequireDefault(_block);

var _character = require('./models/character');

var _character2 = _interopRequireDefault(_character);

var _data = require('./models/data');

var _data2 = _interopRequireDefault(_data);

var _document = require('./models/document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('./models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('./models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _schema = require('./models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _selection = require('./models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _stack = require('./models/stack');

var _stack2 = _interopRequireDefault(_stack);

var _state = require('./models/state');

var _state2 = _interopRequireDefault(_state);

var _text = require('./models/text');

var _text2 = _interopRequireDefault(_text);

var _range = require('./models/range');

var _range2 = _interopRequireDefault(_range);

var _html = require('./serializers/html');

var _html2 = _interopRequireDefault(_html);

var _plain = require('./serializers/plain');

var _plain2 = _interopRequireDefault(_plain);

var _raw = require('./serializers/raw');

var _raw2 = _interopRequireDefault(_raw);

var _transforms = require('./transforms');

var _transforms2 = _interopRequireDefault(_transforms);

var _findDomNode = require('./utils/find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

var _generateKey = require('./utils/generate-key');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export.
 *
 * @type {Object}
 */

/**
 * Utils.
 */

/**
 * Serializers.
 */

/**
 * Models.
 */

/**
 * Components.
 */

exports.Block = _block2.default;
exports.Character = _character2.default;
exports.Data = _data2.default;
exports.Document = _document2.default;
exports.Editor = _editor2.default;
exports.Html = _html2.default;
exports.Inline = _inline2.default;
exports.Mark = _mark2.default;
exports.Placeholder = _placeholder2.default;
exports.Plain = _plain2.default;
exports.Range = _range2.default;
exports.Raw = _raw2.default;
exports.Schema = _schema2.default;
exports.Selection = _selection2.default;
exports.Stack = _stack2.default;
exports.State = _state2.default;
exports.Text = _text2.default;
exports.Transforms = _transforms2.default;
exports.findDOMNode = _findDomNode2.default;
exports.resetKeyGenerator = _generateKey.resetKeyGenerator;
exports.setKeyGenerator = _generateKey.setKeyGenerator;

/**
 * Transforms.
 */

exports.default = {
  Block: _block2.default,
  Character: _character2.default,
  Data: _data2.default,
  Document: _document2.default,
  Editor: _editor2.default,
  Html: _html2.default,
  Inline: _inline2.default,
  Mark: _mark2.default,
  Placeholder: _placeholder2.default,
  Plain: _plain2.default,
  Range: _range2.default,
  Raw: _raw2.default,
  Schema: _schema2.default,
  Selection: _selection2.default,
  Stack: _stack2.default,
  State: _state2.default,
  Text: _text2.default,
  Transforms: _transforms2.default,
  findDOMNode: _findDomNode2.default,
  resetKeyGenerator: _generateKey.resetKeyGenerator,
  setKeyGenerator: _generateKey.setKeyGenerator
};

},{"./components/editor":78,"./components/placeholder":81,"./models/block":87,"./models/character":88,"./models/data":89,"./models/document":90,"./models/inline":91,"./models/mark":92,"./models/range":94,"./models/schema":95,"./models/selection":96,"./models/stack":97,"./models/state":98,"./models/text":99,"./serializers/html":104,"./serializers/plain":105,"./serializers/raw":106,"./transforms":112,"./utils/find-dom-node":120,"./utils/generate-key":121}],87:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  isVoid: false,
  key: null,
  nodes: new _immutable.List(),
  type: null
};

/**
 * Block.
 *
 * @type {Block}
 */

var Block = function (_ref) {
  _inherits(Block, _ref);

  function Block() {
    _classCallCheck(this, Block);

    return _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).apply(this, arguments));
  }

  _createClass(Block, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'block';
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the node.
     *
     * @return {Number}
     */

  }, {
    key: 'length',
    get: function get() {
      return this.text.length;
    }

    /**
     * Get the concatenated text `string` of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Block` with `properties`.
     *
     * @param {Object|Block} properties
     * @return {Block}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Block) return properties;
      if (properties instanceof _inline2.default) return properties;
      if (properties instanceof _text2.default) return properties;
      if (!properties.type) throw new Error('You must pass a block `type`.');

      properties.key = properties.key || (0, _generateKey2.default)();
      properties.data = _data2.default.create(properties.data);
      properties.isVoid = !!properties.isVoid;
      properties.nodes = Block.createList(properties.nodes);

      if (properties.nodes.size == 0) {
        properties.nodes = properties.nodes.push(_text2.default.create());
      }

      return new Block(properties);
    }

    /**
     * Create a list of `Blocks` from an array.
     *
     * @param {Array<Object|Block>} elements
     * @return {List<Block>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) return elements;
      return new _immutable.List(elements.map(Block.create));
    }
  }]);

  return Block;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in `Node` methods.
 */

for (var method in _node2.default) {
  Block.prototype[method] = _node2.default[method];
}

/**
 * Export.
 *
 * @type {Block}
 */

exports.default = Block;

},{"../utils/generate-key":121,"./data":89,"./document":90,"./inline":91,"./node":93,"./text":99}],88:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  marks: new _immutable.Set(),
  text: ''
};

/**
 * Character.
 *
 * @type {Character}
 */

var Character = function (_ref) {
  _inherits(Character, _ref);

  function Character() {
    _classCallCheck(this, Character);

    return _possibleConstructorReturn(this, (Character.__proto__ || Object.getPrototypeOf(Character)).apply(this, arguments));
  }

  _createClass(Character, [{
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'character';
    }
  }], [{
    key: 'create',


    /**
     * Create a character record with `properties`.
     *
     * @param {Object|Character} properties
     * @return {Character}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Character) return properties;
      properties.marks = _mark2.default.createSet(properties.marks);
      return new Character(properties);
    }

    /**
     * Create a characters list from an array of characters.
     *
     * @param {Array<Object|Character>} array
     * @return {List<Character>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(array)) return array;
      return new _immutable.List(array.map(Character.create));
    }

    /**
     * Create a characters list from a `string` and optional `marks`.
     *
     * @param {String} string
     * @param {Set<Mark>} marks (optional)
     * @return {List<Character>}
     */

  }, {
    key: 'createListFromText',
    value: function createListFromText(string, marks) {
      var chars = string.split('').map(function (text) {
        return { text: text, marks: marks };
      });
      var list = Character.createList(chars);
      return list;
    }
  }]);

  return Character;
}(new _immutable.Record(DEFAULTS));

/**
 * Export.
 *
 * @type {Character}
 */

exports.default = Character;

},{"./mark":92}],89:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = (window.Immutable);

/**
 * Data.
 *
 * This isn't an immutable record, it's just a thin wrapper around `Map` so that
 * we can allow for more convenient creation.
 *
 * @type {Object}
 */

var Data = {

  /**
   * Create a new `Data` with `properties`.
   *
   * @param {Object} properties
   * @return {Data} data
   */

  create: function create() {
    var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _immutable.Map.isMap(properties) ? properties : new _immutable.Map(properties);
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Data;

},{}],90:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

require('./inline');

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  key: null,
  nodes: new _immutable.List()
};

/**
 * Document.
 *
 * @type {Document}
 */

var Document = function (_ref) {
  _inherits(Document, _ref);

  function Document() {
    _classCallCheck(this, Document);

    return _possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).apply(this, arguments));
  }

  _createClass(Document, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'document';
    }

    /**
     * Is the document empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the document.
     *
     * @return {Number}
     */

  }, {
    key: 'length',
    get: function get() {
      return this.text.length;
    }

    /**
     * Get the concatenated text `string` of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Document` with `properties`.
     *
     * @param {Object|Document} properties
     * @return {Document}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Document) return properties;

      properties.key = properties.key || (0, _generateKey2.default)();
      properties.data = _data2.default.create(properties.data);
      properties.nodes = _block2.default.createList(properties.nodes);

      return new Document(properties);
    }
  }]);

  return Document;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in `Node` methods.
 */

for (var method in _node2.default) {
  Document.prototype[method] = _node2.default[method];
}

/**
 * Export.
 *
 * @type {Document}
 */

exports.default = Document;

},{"../utils/generate-key":121,"./block":87,"./data":89,"./inline":91,"./node":93}],91:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

require('./document');

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  isVoid: false,
  key: null,
  nodes: new _immutable.List(),
  type: null
};

/**
 * Inline.
 *
 * @type {Inline}
 */

var Inline = function (_ref) {
  _inherits(Inline, _ref);

  function Inline() {
    _classCallCheck(this, Inline);

    return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
  }

  _createClass(Inline, [{
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'inline';
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the node.
     *
     * @return {Number}
     */

  }, {
    key: 'length',
    get: function get() {
      return this.text.length;
    }

    /**
     * Get the concatenated text `string` of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Inline` with `properties`.
     *
     * @param {Object|Inline} properties
     * @return {Inline}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof _block2.default) return properties;
      if (properties instanceof Inline) return properties;
      if (properties instanceof _text2.default) return properties;
      if (!properties.type) throw new Error('You must pass an inline `type`.');

      properties.key = properties.key || (0, _generateKey2.default)();
      properties.data = _data2.default.create(properties.data);
      properties.isVoid = !!properties.isVoid;
      properties.nodes = Inline.createList(properties.nodes);

      if (properties.nodes.size == 0) {
        properties.nodes = properties.nodes.push(_text2.default.create());
      }

      return new Inline(properties);
    }

    /**
     * Create a list of `Inlines` from an array.
     *
     * @param {Array<Object|Inline>} elements
     * @return {List<Inline>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) return elements;
      return new _immutable.List(elements.map(Inline.create));
    }
  }]);

  return Inline;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in `Node` methods.
 */

for (var method in _node2.default) {
  Inline.prototype[method] = _node2.default[method];
}

/**
 * Export.
 *
 * @type {Inline}
 */

exports.default = Inline;

},{"../utils/generate-key":121,"./block":87,"./data":89,"./document":90,"./node":93,"./text":99}],92:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  type: null
};

/**
 * Mark.
 *
 * @type {Mark}
 */

var Mark = function (_ref) {
  _inherits(Mark, _ref);

  function Mark() {
    _classCallCheck(this, Mark);

    return _possibleConstructorReturn(this, (Mark.__proto__ || Object.getPrototypeOf(Mark)).apply(this, arguments));
  }

  _createClass(Mark, [{
    key: 'getComponent',


    /**
     * Get the component for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

    value: function getComponent(schema) {
      return schema.__getComponent(this);
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'mark';
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Mark` with `properties`.
     *
     * @param {Object|Mark} properties
     * @return {Mark}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Mark) return properties;
      if (!properties.type) throw new Error('You must provide a `type` for the mark.');
      properties.data = _data2.default.create(properties.data);
      return new Mark(properties);
    }

    /**
     * Create a marks set from an array of marks.
     *
     * @param {Array<Object|Mark>} array
     * @return {Set<Mark>}
     */

  }, {
    key: 'createSet',
    value: function createSet() {
      var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.Set.isSet(array)) return array;
      return new _immutable.Set(array.map(Mark.create));
    }
  }]);

  return Mark;
}(new _immutable.Record(DEFAULTS));

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Mark.prototype, ['getComponent'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Mark}
 */

exports.default = Mark;

},{"../utils/memoize":126,"./data":89}],93:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _direction = require('direction');

var _direction2 = _interopRequireDefault(_direction);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _isInRange = require('../utils/is-in-range');

var _isInRange2 = _interopRequireDefault(_isInRange);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _warn = require('../utils/warn');

var _warn2 = _interopRequireDefault(_warn);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Node.
 *
 * And interface that `Document`, `Block` and `Inline` all implement, to make
 * working with the recursive node tree easier.
 *
 * @type {Object}
 */

var Node = {

  /**
   * True if the node has both descendants in that order, false otherwise. The
   * order is depth-first, post-order.
   *
   * @param {String} first
   * @param {String} second
   * @return {Boolean}
   */

  areDescendantsSorted: function areDescendantsSorted(first, second) {
    first = _normalize2.default.key(first);
    second = _normalize2.default.key(second);

    var sorted = void 0;

    this.forEachDescendant(function (n) {
      if (n.key === first) {
        sorted = true;
        return false;
      } else if (n.key === second) {
        sorted = false;
        return false;
      }
    });

    return sorted;
  },


  /**
   * Assert that a node has a child by `key` and return it.
   *
   * @param {String} key
   * @return {Node}
   */

  assertChild: function assertChild(key) {
    var child = this.getChild(key);

    if (!child) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a child node with key "' + key + '".');
    }

    return child;
  },


  /**
   * Assert that a node has a descendant by `key` and return it.
   *
   * @param {String} key
   * @return {Node}
   */

  assertDescendant: function assertDescendant(key) {
    var descendant = this.getDescendant(key);

    if (!descendant) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    return descendant;
  },


  /**
   * Assert that a node's tree has a node by `key` and return it.
   *
   * @param {String} key
   * @return {Node}
   */

  assertNode: function assertNode(key) {
    var node = this.getNode(key);

    if (!node) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a node with key "' + key + '".');
    }

    return node;
  },


  /**
   * Assert that a node exists at `path` and return it.
   *
   * @param {Array} path
   * @return {Node}
   */

  assertPath: function assertPath(path) {
    var descendant = this.getDescendantAtPath(path);

    if (!descendant) {
      throw new Error('Could not find a descendant at path "' + path + '".');
    }

    return descendant;
  },


  /**
   * Recursively filter all descendant nodes with `iterator`.
   *
   * @param {Function} iterator
   * @return {List<Node>}
   */

  filterDescendants: function filterDescendants(iterator) {
    var matches = [];

    this.forEachDescendant(function (node, i, nodes) {
      if (iterator(node, i, nodes)) matches.push(node);
    });

    return (0, _immutable.List)(matches);
  },


  /**
   * Recursively find all descendant nodes by `iterator`.
   *
   * @param {Function} iterator
   * @return {Node|Null}
   */

  findDescendant: function findDescendant(iterator) {
    var found = null;

    this.forEachDescendant(function (node, i, nodes) {
      if (iterator(node, i, nodes)) {
        found = node;
        return false;
      }
    });

    return found;
  },


  /**
   * Recursively iterate over all descendant nodes with `iterator`. If the
   * iterator returns false it will break the loop.
   *
   * @param {Function} iterator
   */

  forEachDescendant: function forEachDescendant(iterator) {
    var ret = void 0;

    this.nodes.forEach(function (child, i, nodes) {
      if (iterator(child, i, nodes) === false) {
        ret = false;
        return false;
      }

      if (child.kind != 'text') {
        ret = child.forEachDescendant(iterator);
        return ret;
      }
    });

    return ret;
  },


  /**
   * Get the path of ancestors of a descendant node by `key`.
   *
   * @param {String|Node} key
   * @return {List<Node>|Null}
   */

  getAncestors: function getAncestors(key) {
    key = _normalize2.default.key(key);

    if (key == this.key) return (0, _immutable.List)();
    if (this.hasChild(key)) return (0, _immutable.List)([this]);

    var ancestors = void 0;
    this.nodes.find(function (node) {
      if (node.kind == 'text') return false;
      ancestors = node.getAncestors(key);
      return ancestors;
    });

    if (ancestors) {
      return ancestors.unshift(this);
    } else {
      return null;
    }
  },


  /**
   * Get the leaf block descendants of the node.
   *
   * @return {List<Node>}
   */

  getBlocks: function getBlocks() {
    var array = this.getBlocksAsArray();
    return new _immutable.List(array);
  },


  /**
   * Get the leaf block descendants of the node.
   *
   * @return {List<Node>}
   */

  getBlocksAsArray: function getBlocksAsArray() {
    return this.nodes.reduce(function (array, child) {
      if (child.kind != 'block') return array;
      if (!child.isLeafBlock()) return array.concat(child.getBlocksAsArray());
      array.push(child);
      return array;
    }, []);
  },


  /**
   * Get the leaf block descendants in a `range`.
   *
   * @param {Selection} range
   * @return {List<Node>}
   */

  getBlocksAtRange: function getBlocksAtRange(range) {
    var array = this.getBlocksAtRangeAsArray(range);
    // Eliminate duplicates by converting to an `OrderedSet` first.
    return new _immutable.List(new _immutable.OrderedSet(array));
  },


  /**
   * Get the leaf block descendants in a `range` as an array
   *
   * @param {Selection} range
   * @return {Array}
   */

  getBlocksAtRangeAsArray: function getBlocksAtRangeAsArray(range) {
    var _this = this;

    return this.getTextsAtRangeAsArray(range).map(function (text) {
      return _this.getClosestBlock(text.key);
    });
  },


  /**
   * Get all of the leaf blocks that match a `type`.
   *
   * @param {String} type
   * @return {List<Node>}
   */

  getBlocksByType: function getBlocksByType(type) {
    var array = this.getBlocksByTypeAsArray(type);
    return new _immutable.List(array);
  },


  /**
   * Get all of the leaf blocks that match a `type` as an array
   *
   * @param {String} type
   * @return {Array}
   */

  getBlocksByTypeAsArray: function getBlocksByTypeAsArray(type) {
    return this.nodes.reduce(function (array, node) {
      if (node.kind != 'block') {
        return array;
      } else if (node.isLeafBlock() && node.type == type) {
        array.push(node);
        return array;
      } else {
        return array.concat(node.getBlocksByTypeAsArray(type));
      }
    }, []);
  },


  /**
   * Get all of the characters for every text node.
   *
   * @return {List<Character>}
   */

  getCharacters: function getCharacters() {
    var array = this.getCharactersAsArray();
    return new _immutable.List(array);
  },


  /**
   * Get all of the characters for every text node as an array
   *
   * @return {Array}
   */

  getCharactersAsArray: function getCharactersAsArray() {
    return this.nodes.reduce(function (arr, node) {
      return node.kind == 'text' ? arr.concat(node.characters.toArray()) : arr.concat(node.getCharactersAsArray());
    }, []);
  },


  /**
   * Get a list of the characters in a `range`.
   *
   * @param {Selection} range
   * @return {List<Character>}
   */

  getCharactersAtRange: function getCharactersAtRange(range) {
    var array = this.getCharactersAtRangeAsArray(range);
    return new _immutable.List(array);
  },


  /**
   * Get a list of the characters in a `range` as an array.
   *
   * @param {Selection} range
   * @return {Array}
   */

  getCharactersAtRangeAsArray: function getCharactersAtRangeAsArray(range) {
    return this.getTextsAtRange(range).reduce(function (arr, text) {
      var chars = text.characters.filter(function (char, i) {
        return (0, _isInRange2.default)(i, text, range);
      }).toArray();

      return arr.concat(chars);
    }, []);
  },


  /**
   * Get a child node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getChild: function getChild(key) {
    key = _normalize2.default.key(key);
    return this.nodes.find(function (node) {
      return node.key == key;
    });
  },


  /**
   * Get closest parent of node by `key` that matches `iterator`.
   *
   * @param {String} key
   * @param {Function} iterator
   * @return {Node|Null}
   */

  getClosest: function getClosest(key, iterator) {
    key = _normalize2.default.key(key);
    var ancestors = this.getAncestors(key);
    if (!ancestors) {
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    // Exclude this node itself.
    return ancestors.rest().findLast(iterator);
  },


  /**
   * Get the closest block parent of a `node`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getClosestBlock: function getClosestBlock(key) {
    return this.getClosest(key, function (parent) {
      return parent.kind == 'block';
    });
  },


  /**
   * Get the closest inline parent of a `node`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getClosestInline: function getClosestInline(key) {
    return this.getClosest(key, function (parent) {
      return parent.kind == 'inline';
    });
  },


  /**
   * Get the closest void parent of a `node`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getClosestVoid: function getClosestVoid(key) {
    return this.getClosest(key, function (parent) {
      return parent.isVoid;
    });
  },


  /**
   * Get the common ancestor of nodes `one` and `two` by keys.
   *
   * @param {String} one
   * @param {String} two
   * @return {Node}
   */

  getCommonAncestor: function getCommonAncestor(one, two) {
    one = _normalize2.default.key(one);
    two = _normalize2.default.key(two);

    if (one == this.key) return this;
    if (two == this.key) return this;

    this.assertDescendant(one);
    this.assertDescendant(two);
    var ancestors = new _immutable.List();
    var oneParent = this.getParent(one);
    var twoParent = this.getParent(two);

    while (oneParent) {
      ancestors = ancestors.push(oneParent);
      oneParent = this.getParent(oneParent.key);
    }

    while (twoParent) {
      if (ancestors.includes(twoParent)) return twoParent;
      twoParent = this.getParent(twoParent.key);
    }
  },


  /**
   * Get the component for the node from a `schema`.
   *
   * @param {Schema} schema
   * @return {Component|Void}
   */

  getComponent: function getComponent(schema) {
    return schema.__getComponent(this);
  },


  /**
   * Get the decorations for the node from a `schema`.
   *
   * @param {Schema} schema
   * @return {Array}
   */

  getDecorators: function getDecorators(schema) {
    return schema.__getDecorators(this);
  },


  /**
   * Get the depth of a child node by `key`, with optional `startAt`.
   *
   * @param {String} key
   * @param {Number} startAt (optional)
   * @return {Number} depth
   */

  getDepth: function getDepth(key) {
    var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    this.assertDescendant(key);
    if (this.hasChild(key)) return startAt;
    return this.getFurthestAncestor(key).getDepth(key, startAt + 1);
  },


  /**
   * Get a descendant node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getDescendant: function getDescendant(key) {
    key = _normalize2.default.key(key);
    var descendantFound = null;

    var found = this.nodes.find(function (node) {
      if (node.key === key) {
        return node;
      } else if (node.kind !== 'text') {
        descendantFound = node.getDescendant(key);
        return descendantFound;
      } else {
        return false;
      }
    });

    return descendantFound || found;
  },


  /**
   * Get a descendant by `path`.
   *
   * @param {Array} path
   * @return {Node|Null}
   */

  getDescendantAtPath: function getDescendantAtPath(path) {
    var descendant = this;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        if (!descendant) return;
        if (!descendant.nodes) return;
        descendant = descendant.nodes.get(index);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return descendant;
  },


  /**
   * Get the decorators for a descendant by `key` given a `schema`.
   *
   * @param {String} key
   * @param {Schema} schema
   * @return {Array}
   */

  getDescendantDecorators: function getDescendantDecorators(key, schema) {
    if (!schema.hasDecorators) {
      return [];
    }

    var descendant = this.assertDescendant(key);
    var child = this.getFurthestAncestor(key);
    var decorators = [];

    while (child != descendant) {
      decorators = decorators.concat(child.getDecorators(schema));
      child = child.getFurthestAncestor(key);
    }

    decorators = decorators.concat(descendant.getDecorators(schema));
    return decorators;
  },


  /**
   * Get the first child text node.
   *
   * @return {Node|Null}
   */

  getFirstText: function getFirstText() {
    var descendantFound = null;

    var found = this.nodes.find(function (node) {
      if (node.kind == 'text') return true;
      descendantFound = node.getFirstText();
      return descendantFound;
    });

    return descendantFound || found;
  },


  /**
   * Get a fragment of the node at a `range`.
   *
   * @param {Selection} range
   * @return {List<Node>}
   */

  getFragmentAtRange: function getFragmentAtRange(range) {
    var node = this;
    var nodes = new _immutable.List();

    // Make sure the children exist.
    var startKey = range.startKey,
        startOffset = range.startOffset,
        endKey = range.endKey,
        endOffset = range.endOffset;

    node.assertDescendant(startKey);
    node.assertDescendant(endKey);

    // Split at the start and end.
    var start = range.collapseToStart();
    node = node.splitBlockAtRange(start, Infinity);

    var next = node.getNextText(startKey);
    var end = startKey == endKey ? range.collapseToStartOf(next).move(endOffset - startOffset) : range.collapseToEnd();
    node = node.splitBlockAtRange(end, Infinity);

    // Get the start and end nodes.
    var startNode = node.getNextSibling(node.getFurthestAncestor(startKey).key);
    var endNode = startKey == endKey ? node.getFurthestAncestor(next.key) : node.getFurthestAncestor(endKey);

    // Get children range of nodes from start to end nodes
    var startIndex = node.nodes.indexOf(startNode);
    var endIndex = node.nodes.indexOf(endNode);
    nodes = node.nodes.slice(startIndex, endIndex + 1);

    // Return a new document fragment.
    return _document2.default.create({ nodes: nodes });
  },


  /**
   * Get the furthest parent of a node by `key` that matches an `iterator`.
   *
   * @param {String} key
   * @param {Function} iterator
   * @return {Node|Null}
   */

  getFurthest: function getFurthest(key, iterator) {
    var ancestors = this.getAncestors(key);
    if (!ancestors) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    // Exclude this node itself
    return ancestors.rest().find(iterator);
  },


  /**
   * Get the furthest block parent of a node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getFurthestBlock: function getFurthestBlock(key) {
    return this.getFurthest(key, function (node) {
      return node.kind == 'block';
    });
  },


  /**
   * Get the furthest inline parent of a node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getFurthestInline: function getFurthestInline(key) {
    return this.getFurthest(key, function (node) {
      return node.kind == 'inline';
    });
  },


  /**
   * Get the furthest ancestor of a node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getFurthestAncestor: function getFurthestAncestor(key) {
    key = _normalize2.default.key(key);
    return this.nodes.find(function (node) {
      if (node.key == key) return true;
      if (node.kind == 'text') return false;
      return node.hasDescendant(key);
    });
  },


  /**
   * Get the furthest ancestor of a node by `key` that has only one child.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getFurthestOnlyChildAncestor: function getFurthestOnlyChildAncestor(key) {
    var ancestors = this.getAncestors(key);

    if (!ancestors) {
      key = _normalize2.default.key(key);
      throw new Error('Could not find a descendant node with key "' + key + '".');
    }

    return ancestors
    // Skip this node...
    .skipLast()
    // Take parents until there are more than one child...
    .reverse().takeUntil(function (p) {
      return p.nodes.size > 1;
    })
    // And pick the highest.
    .last();
  },


  /**
   * Get the closest inline nodes for each text node in the node.
   *
   * @return {List<Node>}
   */

  getInlines: function getInlines() {
    var array = this.getInlinesAsArray();
    return new _immutable.List(array);
  },


  /**
   * Get the closest inline nodes for each text node in the node, as an array.
   *
   * @return {List<Node>}
   */

  getInlinesAsArray: function getInlinesAsArray() {
    var array = [];

    this.nodes.forEach(function (child) {
      if (child.kind == 'text') return;
      if (child.isLeafInline()) {
        array.push(child);
      } else {
        array = array.concat(child.getInlinesAsArray());
      }
    });

    return array;
  },


  /**
   * Get the closest inline nodes for each text node in a `range`.
   *
   * @param {Selection} range
   * @return {List<Node>}
   */

  getInlinesAtRange: function getInlinesAtRange(range) {
    var array = this.getInlinesAtRangeAsArray(range);
    // Remove duplicates by converting it to an `OrderedSet` first.
    return new _immutable.List(new _immutable.OrderedSet(array));
  },


  /**
   * Get the closest inline nodes for each text node in a `range` as an array.
   *
   * @param {Selection} range
   * @return {Array}
   */

  getInlinesAtRangeAsArray: function getInlinesAtRangeAsArray(range) {
    var _this2 = this;

    return this.getTextsAtRangeAsArray(range).map(function (text) {
      return _this2.getClosestInline(text.key);
    }).filter(function (exists) {
      return exists;
    });
  },


  /**
   * Get all of the leaf inline nodes that match a `type`.
   *
   * @param {String} type
   * @return {List<Node>}
   */

  getInlinesByType: function getInlinesByType(type) {
    var array = this.getInlinesByTypeAsArray(type);
    return new _immutable.List(array);
  },


  /**
   * Get all of the leaf inline nodes that match a `type` as an array.
   *
   * @param {String} type
   * @return {Array}
   */

  getInlinesByTypeAsArray: function getInlinesByTypeAsArray(type) {
    return this.nodes.reduce(function (inlines, node) {
      if (node.kind == 'text') {
        return inlines;
      } else if (node.isLeafInline() && node.type == type) {
        inlines.push(node);
        return inlines;
      } else {
        return inlines.concat(node.getInlinesByTypeAsArray(type));
      }
    }, []);
  },


  /**
   * Return a set of all keys in the node.
   *
   * @return {Set<String>}
   */

  getKeys: function getKeys() {
    var keys = [];

    this.forEachDescendant(function (desc) {
      keys.push(desc.key);
    });

    return new _immutable.Set(keys);
  },


  /**
   * Get the last child text node.
   *
   * @return {Node|Null}
   */

  getLastText: function getLastText() {
    var descendantFound = null;

    var found = this.nodes.findLast(function (node) {
      if (node.kind == 'text') return true;
      descendantFound = node.getLastText();
      return descendantFound;
    });

    return descendantFound || found;
  },


  /**
   * Get all of the marks for all of the characters of every text node.
   *
   * @return {Set<Mark>}
   */

  getMarks: function getMarks() {
    var array = this.getMarksAsArray();
    return new _immutable.Set(array);
  },


  /**
   * Get all of the marks for all of the characters of every text node.
   *
   * @return {OrderedSet<Mark>}
   */

  getOrderedMarks: function getOrderedMarks() {
    var array = this.getMarksAsArray();
    return new _immutable.OrderedSet(array);
  },


  /**
   * Get all of the marks as an array.
   *
   * @return {Array}
   */

  getMarksAsArray: function getMarksAsArray() {
    return this.nodes.reduce(function (marks, node) {
      return marks.concat(node.getMarksAsArray());
    }, []);
  },


  /**
   * Get a set of the marks in a `range`.
   *
   * @param {Selection} range
   * @return {Set<Mark>}
   */

  getMarksAtRange: function getMarksAtRange(range) {
    var array = this.getMarksAtRangeAsArray(range);
    return new _immutable.Set(array);
  },


  /**
   * Get a set of the marks in a `range`.
   *
   * @param {Selection} range
   * @return {OrderedSet<Mark>}
   */

  getOrderedMarksAtRange: function getOrderedMarksAtRange(range) {
    var array = this.getMarksAtRangeAsArray(range);
    return new _immutable.OrderedSet(array);
  },


  /**
   * Get a set of the marks in a `range`.
   *
   * @param {Selection} range
   * @return {Array}
   */

  getMarksAtRangeAsArray: function getMarksAtRangeAsArray(range) {
    range = range.normalize(this);
    var _range = range,
        startKey = _range.startKey,
        startOffset = _range.startOffset;

    // If the range is collapsed at the start of the node, check the previous.

    if (range.isCollapsed && startOffset == 0) {
      var previous = this.getPreviousText(startKey);
      if (!previous || !previous.length) return [];
      var char = previous.characters.get(previous.length - 1);
      return char.marks.toArray();
    }

    // If the range is collapsed, check the character before the start.
    if (range.isCollapsed) {
      var text = this.getDescendant(startKey);
      var _char = text.characters.get(range.startOffset - 1);
      return _char.marks.toArray();
    }

    // Otherwise, get a set of the marks for each character in the range.
    return this.getCharactersAtRange(range).reduce(function (memo, char) {
      char.marks.toArray().forEach(function (c) {
        return memo.push(c);
      });
      return memo;
    }, []);
  },


  /**
   * Get all of the marks that match a `type`.
   *
   * @param {String} type
   * @return {Set<Mark>}
   */

  getMarksByType: function getMarksByType(type) {
    var array = this.getMarksByTypeAsArray(type);
    return new _immutable.Set(array);
  },


  /**
   * Get all of the marks that match a `type`.
   *
   * @param {String} type
   * @return {OrderedSet<Mark>}
   */

  getOrderedMarksByType: function getOrderedMarksByType(type) {
    var array = this.getMarksByTypeAsArray(type);
    return new _immutable.OrderedSet(array);
  },


  /**
   * Get all of the marks that match a `type` as an array.
   *
   * @param {String} type
   * @return {Array}
   */

  getMarksByTypeAsArray: function getMarksByTypeAsArray(type) {
    return this.nodes.reduce(function (array, node) {
      return node.kind == 'text' ? array.concat(node.getMarksAsArray().filter(function (m) {
        return m.type == type;
      })) : array.concat(node.getMarksByTypeAsArray(type));
    }, []);
  },


  /**
   * Get the block node before a descendant text node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getNextBlock: function getNextBlock(key) {
    var child = this.assertDescendant(key);
    var last = void 0;

    if (child.kind == 'block') {
      last = child.getLastText();
    } else {
      var block = this.getClosestBlock(key);
      last = block.getLastText();
    }

    var next = this.getNextText(last.key);
    if (!next) return null;

    return this.getClosestBlock(next.key);
  },


  /**
   * Get the node after a descendant by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getNextSibling: function getNextSibling(key) {
    key = _normalize2.default.key(key);

    var parent = this.getParent(key);
    var after = parent.nodes.skipUntil(function (child) {
      return child.key == key;
    });

    if (after.size == 0) {
      throw new Error('Could not find a child node with key "' + key + '".');
    }
    return after.get(1);
  },


  /**
   * Get the text node after a descendant text node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getNextText: function getNextText(key) {
    key = _normalize2.default.key(key);
    return this.getTexts().skipUntil(function (text) {
      return text.key == key;
    }).get(1);
  },


  /**
   * Get a node in the tree by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getNode: function getNode(key) {
    key = _normalize2.default.key(key);
    return this.key == key ? this : this.getDescendant(key);
  },


  /**
   * Get the offset for a descendant text node by `key`.
   *
   * @param {String} key
   * @return {Number}
   */

  getOffset: function getOffset(key) {
    this.assertDescendant(key);

    // Calculate the offset of the nodes before the highest child.
    var child = this.getFurthestAncestor(key);
    var offset = this.nodes.takeUntil(function (n) {
      return n == child;
    }).reduce(function (memo, n) {
      return memo + n.length;
    }, 0);

    // Recurse if need be.
    return this.hasChild(key) ? offset : offset + child.getOffset(key);
  },


  /**
   * Get the offset from a `range`.
   *
   * @param {Selection} range
   * @return {Number}
   */

  getOffsetAtRange: function getOffsetAtRange(range) {
    range = range.normalize(this);

    if (range.isExpanded) {
      throw new Error('The range must be collapsed to calculcate its offset.');
    }

    var _range2 = range,
        startKey = _range2.startKey,
        startOffset = _range2.startOffset;

    return this.getOffset(startKey) + startOffset;
  },


  /**
   * Get the parent of a child node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getParent: function getParent(key) {
    if (this.hasChild(key)) return this;

    var node = null;

    this.nodes.find(function (child) {
      if (child.kind == 'text') {
        return false;
      } else {
        node = child.getParent(key);
        return node;
      }
    });

    return node;
  },


  /**
   * Get the path of a descendant node by `key`.
   *
   * @param {String|Node} key
   * @return {Array}
   */

  getPath: function getPath(key) {
    var child = this.assertNode(key);
    var ancestors = this.getAncestors(key);
    var path = [];

    ancestors.reverse().forEach(function (ancestor) {
      var index = ancestor.nodes.indexOf(child);
      path.unshift(index);
      child = ancestor;
    });

    return path;
  },


  /**
   * Get the block node before a descendant text node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getPreviousBlock: function getPreviousBlock(key) {
    var child = this.assertDescendant(key);
    var first = void 0;

    if (child.kind == 'block') {
      first = child.getFirstText();
    } else {
      var block = this.getClosestBlock(key);
      first = block.getFirstText();
    }

    var previous = this.getPreviousText(first.key);
    if (!previous) return null;

    return this.getClosestBlock(previous.key);
  },


  /**
   * Get the node before a descendant node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getPreviousSibling: function getPreviousSibling(key) {
    key = _normalize2.default.key(key);
    var parent = this.getParent(key);
    var before = parent.nodes.takeUntil(function (child) {
      return child.key == key;
    });

    if (before.size == parent.nodes.size) {
      throw new Error('Could not find a child node with key "' + key + '".');
    }

    return before.last();
  },


  /**
   * Get the text node before a descendant text node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getPreviousText: function getPreviousText(key) {
    key = _normalize2.default.key(key);
    return this.getTexts().takeUntil(function (text) {
      return text.key == key;
    }).last();
  },


  /**
   * Get the concatenated text string of all child nodes.
   *
   * @return {String}
   */

  getText: function getText() {
    return this.nodes.reduce(function (string, node) {
      return string + node.text;
    }, '');
  },


  /**
   * Get the descendent text node at an `offset`.
   *
   * @param {String} offset
   * @return {Node|Null}
   */

  getTextAtOffset: function getTextAtOffset(offset) {
    // PERF: Add a few shortcuts for the obvious cases.
    if (offset == 0) return this.getFirstText();
    if (offset == this.length) return this.getLastText();
    if (offset < 0 || offset > this.length) return null;

    var length = 0;

    return this.getTexts().find(function (text, i, texts) {
      length += text.length;
      return length > offset;
    });
  },


  /**
   * Get the direction of the node's text.
   *
   * @return {String}
   */

  getTextDirection: function getTextDirection() {
    var dir = (0, _direction2.default)(this.text);
    return dir == 'neutral' ? undefined : dir;
  },


  /**
   * Recursively get all of the child text nodes in order of appearance.
   *
   * @return {List<Node>}
   */

  getTexts: function getTexts() {
    var array = this.getTextsAsArray();
    return new _immutable.List(array);
  },


  /**
   * Recursively get all the leaf text nodes in order of appearance, as array.
   *
   * @return {List<Node>}
   */

  getTextsAsArray: function getTextsAsArray() {
    var array = [];

    this.nodes.forEach(function (node) {
      if (node.kind == 'text') {
        array.push(node);
      } else {
        array = array.concat(node.getTextsAsArray());
      }
    });

    return array;
  },


  /**
   * Get all of the text nodes in a `range`.
   *
   * @param {Selection} range
   * @return {List<Node>}
   */

  getTextsAtRange: function getTextsAtRange(range) {
    var array = this.getTextsAtRangeAsArray(range);
    return new _immutable.List(array);
  },


  /**
   * Get all of the text nodes in a `range` as an array.
   *
   * @param {Selection} range
   * @return {Array}
   */

  getTextsAtRangeAsArray: function getTextsAtRangeAsArray(range) {
    range = range.normalize(this);
    var _range3 = range,
        startKey = _range3.startKey,
        endKey = _range3.endKey;

    var startText = this.getDescendant(startKey);

    // PERF: the most common case is when the range is in a single text node,
    // where we can avoid a lot of iterating of the tree.
    if (startKey == endKey) return [startText];

    var endText = this.getDescendant(endKey);
    var texts = this.getTextsAsArray();
    var start = texts.indexOf(startText);
    var end = texts.indexOf(endText);
    return texts.slice(start, end + 1);
  },


  /**
   * Check if a child node exists by `key`.
   *
   * @param {String} key
   * @return {Boolean}
   */

  hasChild: function hasChild(key) {
    return !!this.getChild(key);
  },


  /**
   * Recursively check if a child node exists by `key`.
   *
   * @param {String} key
   * @return {Boolean}
   */

  hasDescendant: function hasDescendant(key) {
    return !!this.getDescendant(key);
  },


  /**
   * Recursively check if a node exists by `key`.
   *
   * @param {String} key
   * @return {Boolean}
   */

  hasNode: function hasNode(key) {
    return !!this.getNode(key);
  },


  /**
   * Check if a node has a void parent by `key`.
   *
   * @param {String} key
   * @return {Boolean}
   */

  hasVoidParent: function hasVoidParent(key) {
    return !!this.getClosest(key, function (parent) {
      return parent.isVoid;
    });
  },


  /**
   * Insert a `node` at `index`.
   *
   * @param {Number} index
   * @param {Node} node
   * @return {Node}
   */

  insertNode: function insertNode(index, node) {
    var keys = this.getKeys();

    if (keys.contains(node.key)) {
      node = node.regenerateKey();
    }

    if (node.kind != 'text') {
      node = node.mapDescendants(function (desc) {
        return keys.contains(desc.key) ? desc.regenerateKey() : desc;
      });
    }

    var nodes = this.nodes.insert(index, node);
    return this.set('nodes', nodes);
  },


  /**
   * Check whether the node is a leaf block.
   *
   * @return {Boolean}
   */

  isLeafBlock: function isLeafBlock() {
    return this.kind == 'block' && this.nodes.every(function (n) {
      return n.kind != 'block';
    });
  },


  /**
   * Check whether the node is a leaf inline.
   *
   * @return {Boolean}
   */

  isLeafInline: function isLeafInline() {
    return this.kind == 'inline' && this.nodes.every(function (n) {
      return n.kind != 'inline';
    });
  },


  /**
   * Join a children node `first` with another children node `second`.
   * `first` and `second` will be concatenated in that order.
   * `first` and `second` must be two Nodes or two Text.
   *
   * @param {Node} first
   * @param {Node} second
   * @param {Boolean} options.deep (optional) Join recursively the
   * respective last node and first node of the nodes' children. Like a zipper :)
   * @return {Node}
   */

  joinNode: function joinNode(first, second, options) {
    var _options$deep = options.deep,
        deep = _options$deep === undefined ? false : _options$deep;

    var node = this;
    var parent = node.getParent(second.key);
    var isParent = node == parent;
    var index = parent.nodes.indexOf(second);

    if (second.kind == 'text') {
      var _first = first,
          characters = _first.characters;

      characters = characters.concat(second.characters);
      first = first.set('characters', characters);
    } else {
      var size = first.nodes.size;

      second.nodes.forEach(function (child, i) {
        first = first.insertNode(size + i, child);
      });

      if (deep) {
        // Join recursively
        first = first.joinNode(first.nodes.get(size - 1), first.nodes.get(size), { deep: deep });
      }
    }

    parent = parent.removeNode(index);
    node = isParent ? parent : node.updateDescendant(parent);
    node = node.updateDescendant(first);
    return node;
  },


  /**
   * Map all child nodes, updating them in their parents. This method is
   * optimized to not return a new node if no changes are made.
   *
   * @param {Function} iterator
   * @return {Node}
   */

  mapChildren: function mapChildren(iterator) {
    var _this3 = this;

    var nodes = this.nodes;


    nodes.forEach(function (node, i) {
      var ret = iterator(node, i, _this3.nodes);
      if (ret != node) nodes = nodes.set(ret.key, ret);
    });

    return this.set('nodes', nodes);
  },


  /**
   * Map all descendant nodes, updating them in their parents. This method is
   * optimized to not return a new node if no changes are made.
   *
   * @param {Function} iterator
   * @return {Node}
   */

  mapDescendants: function mapDescendants(iterator) {
    var _this4 = this;

    var nodes = this.nodes;


    nodes.forEach(function (node, i) {
      var ret = node;
      if (ret.kind != 'text') ret = ret.mapDescendants(iterator);
      ret = iterator(ret, i, _this4.nodes);
      if (ret == node) return;

      var index = nodes.indexOf(node);
      nodes = nodes.set(index, ret);
    });

    return this.set('nodes', nodes);
  },


  /**
   * Regenerate the node's key.
   *
   * @return {Node}
   */

  regenerateKey: function regenerateKey() {
    var key = (0, _generateKey2.default)();
    return this.set('key', key);
  },


  /**
   * Remove a `node` from the children node map.
   *
   * @param {String} key
   * @return {Node}
   */

  removeDescendant: function removeDescendant(key) {
    key = _normalize2.default.key(key);

    var node = this;
    var parent = node.getParent(key);
    if (!parent) throw new Error('Could not find a descendant node with key "' + key + '".');

    var index = parent.nodes.findIndex(function (n) {
      return n.key === key;
    });
    var isParent = node == parent;
    var nodes = parent.nodes.splice(index, 1);

    parent = parent.set('nodes', nodes);
    node = isParent ? parent : node.updateDescendant(parent);
    return node;
  },


  /**
   * Remove a node at `index`.
   *
   * @param {Number} index
   * @return {Node}
   */

  removeNode: function removeNode(index) {
    var nodes = this.nodes.splice(index, 1);
    return this.set('nodes', nodes);
  },


  /**
   * Split the block nodes at a `range`, to optional `height`.
   *
   * @param {Selection} range
   * @param {Number} height (optional)
   * @return {Node}
   */

  splitBlockAtRange: function splitBlockAtRange(range) {
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var startKey = range.startKey,
        startOffset = range.startOffset;

    var base = this;
    var node = base.assertDescendant(startKey);
    var parent = base.getClosestBlock(node.key);
    var offset = startOffset;
    var h = 0;

    while (parent && parent.kind == 'block' && h < height) {
      offset += parent.getOffset(node.key);
      node = parent;
      parent = base.getClosestBlock(parent.key);
      h++;
    }

    var path = base.getPath(node.key);
    return this.splitNode(path, offset);
  },


  /**
   * Split a node by `path` at `offset`.
   *
   * @param {Array} path
   * @param {Number} offset
   * @return {Node}
   */

  splitNode: function splitNode(path, offset) {
    var base = this;
    var node = base.assertPath(path);
    var parent = base.getParent(node.key);
    var isParent = base == parent;
    var index = parent.nodes.indexOf(node);

    var child = node;
    var one = void 0;
    var two = void 0;

    if (node.kind != 'text') {
      child = node.getTextAtOffset(offset);
    }

    while (child && child != parent) {
      if (child.kind == 'text') {
        var i = node.kind == 'text' ? offset : offset - node.getOffset(child.key);
        var _child = child,
            characters = _child.characters;

        var oneChars = characters.take(i);
        var twoChars = characters.skip(i);
        one = child.set('characters', oneChars);
        two = child.set('characters', twoChars).regenerateKey();
      } else {
        var _child2 = child,
            nodes = _child2.nodes;

        // Try to preserve the nodes list to preserve reference of one == node to avoid re-render
        // When spliting at the end of a text node, the first node is preserved

        var oneNodes = nodes.takeUntil(function (n) {
          return n.key == one.key;
        });
        oneNodes = oneNodes.size == nodes.size - 1 && one == nodes.last() ? nodes : oneNodes.push(one);

        var twoNodes = nodes.skipUntil(function (n) {
          return n.key == one.key;
        }).rest().unshift(two);
        one = child.set('nodes', oneNodes);
        two = child.set('nodes', twoNodes).regenerateKey();
      }

      child = base.getParent(child.key);
    }

    parent = parent.removeNode(index);
    parent = parent.insertNode(index, two);
    parent = parent.insertNode(index, one);
    base = isParent ? parent : base.updateDescendant(parent);
    return base;
  },


  /**
   * Split a node by `path` after 'count' children.
   * Does not work on Text nodes. Use `Node.splitNode` to split text nodes as well.
   *
   * @param {Array} path
   * @param {Number} count
   * @return {Node}
   */

  splitNodeAfter: function splitNodeAfter(path, count) {
    var base = this;
    var node = base.assertPath(path);
    if (node.kind === 'text') throw new Error('Cannot split text node at index. Use Node.splitNode at offset instead');
    var nodes = node.nodes;


    var parent = base.getParent(node.key);
    var isParent = base == parent;

    var oneNodes = nodes.take(count);
    var twoNodes = nodes.skip(count);

    var one = node.set('nodes', oneNodes);
    var two = node.set('nodes', twoNodes).regenerateKey();

    var nodeIndex = parent.nodes.indexOf(node);
    parent = parent.removeNode(nodeIndex);
    parent = parent.insertNode(nodeIndex, two);
    parent = parent.insertNode(nodeIndex, one);

    base = isParent ? parent : base.updateDescendant(parent);
    return base;
  },


  /**
   * Set a new value for a child node by `key`.
   *
   * @param {Node} node
   * @return {Node}
   */

  updateDescendant: function updateDescendant(node) {
    var child = this.assertDescendant(node.key);
    var ancestors = this.getAncestors(node.key);

    ancestors.reverse().forEach(function (parent) {
      var _parent = parent,
          nodes = _parent.nodes;

      var index = nodes.indexOf(child);
      child = parent;
      nodes = nodes.set(index, node);
      parent = parent.set('nodes', nodes);
      node = parent;
    });

    return node;
  },


  /**
   * Validate the node against a `schema`.
   *
   * @param {Schema} schema
   * @return {Object|Null}
   */

  validate: function validate(schema) {
    return schema.__validate(this);
  },


  /**
   * True if the node has both descendants in that order, false otherwise. The
   * order is depth-first, post-order.
   *
   * @param {String} first
   * @param {String} second
   * @return {Boolean}
   */

  areDescendantSorted: function areDescendantSorted(first, second) {
    (0, _warn2.default)('The Node.areDescendantSorted(first, second) method is deprecated, please use `Node.areDescendantsSorted(first, second) instead.');
    return this.areDescendantsSorted(first, second);
  },


  /**
   * Concat children `nodes` on to the end of the node.
   *
   * @param {List<Node>} nodes
   * @return {Node}
   */

  concatChildren: function concatChildren(nodes) {
    (0, _warn2.default)('The `Node.concatChildren(nodes)` method is deprecated.');
    nodes = this.nodes.concat(nodes);
    return this.set('nodes', nodes);
  },


  /**
   * Decorate all of the text nodes with a `decorator` function.
   *
   * @param {Function} decorator
   * @return {Node}
   */

  decorateTexts: function decorateTexts(decorator) {
    (0, _warn2.default)('The `Node.decorateTexts(decorator) method is deprecated.');
    return this.mapDescendants(function (child) {
      return child.kind == 'text' ? child.decorateCharacters(decorator) : child;
    });
  },


  /**
   * Recursively filter all descendant nodes with `iterator`, depth-first.
   * It is different from `filterDescendants` in regard of the order of results.
   *
   * @param {Function} iterator
   * @return {List<Node>}
   */

  filterDescendantsDeep: function filterDescendantsDeep(iterator) {
    (0, _warn2.default)('The Node.filterDescendantsDeep(iterator) method is deprecated.');
    return this.nodes.reduce(function (matches, child, i, nodes) {
      if (child.kind != 'text') matches = matches.concat(child.filterDescendantsDeep(iterator));
      if (iterator(child, i, nodes)) matches = matches.push(child);
      return matches;
    }, new _immutable.List());
  },


  /**
   * Recursively find all descendant nodes by `iterator`. Depth first.
   *
   * @param {Function} iterator
   * @return {Node|Null}
   */

  findDescendantDeep: function findDescendantDeep(iterator) {
    (0, _warn2.default)('The Node.findDescendantDeep(iterator) method is deprecated.');
    var found = void 0;

    this.forEachDescendant(function (node) {
      if (iterator(node)) {
        found = node;
        return false;
      }
    });

    return found;
  },


  /**
   * Get children between two child keys.
   *
   * @param {String} start
   * @param {String} end
   * @return {Node}
   */

  getChildrenBetween: function getChildrenBetween(start, end) {
    (0, _warn2.default)('The `Node.getChildrenBetween(start, end)` method is deprecated.');
    start = this.assertChild(start);
    start = this.nodes.indexOf(start);
    end = this.assertChild(end);
    end = this.nodes.indexOf(end);
    return this.nodes.slice(start + 1, end);
  },


  /**
   * Get children between two child keys, including the two children.
   *
   * @param {String} start
   * @param {String} end
   * @return {Node}
   */

  getChildrenBetweenIncluding: function getChildrenBetweenIncluding(start, end) {
    (0, _warn2.default)('The `Node.getChildrenBetweenIncluding(start, end)` method is deprecated.');
    start = this.assertChild(start);
    start = this.nodes.indexOf(start);
    end = this.assertChild(end);
    end = this.nodes.indexOf(end);
    return this.nodes.slice(start, end + 1);
  },


  /**
   * Get the highest child ancestor of a node by `key`.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getHighestChild: function getHighestChild(key) {
    (0, _warn2.default)('The `Node.getHighestChild(key) method is deprecated, please use `Node.getFurthestAncestor(key) instead.');
    return this.getFurthestAncestor(key);
  },


  /**
   * Get the highest parent of a node by `key` which has an only child.
   *
   * @param {String} key
   * @return {Node|Null}
   */

  getHighestOnlyChildParent: function getHighestOnlyChildParent(key) {
    (0, _warn2.default)('The `Node.getHighestOnlyChildParent(key)` method is deprecated, please use `Node.getFurthestOnlyChildAncestor` instead.');
    return this.getFurthestOnlyChildAncestor(key);
  },


  /**
   * Check if the inline nodes are split at a `range`.
   *
   * @param {Selection} range
   * @return {Boolean}
   */

  isInlineSplitAtRange: function isInlineSplitAtRange(range) {
    (0, _warn2.default)('The `Node.isInlineSplitAtRange(range)` method is deprecated.');
    range = range.normalize(this);
    if (range.isExpanded) throw new Error();

    var _range4 = range,
        startKey = _range4.startKey;

    var start = this.getFurthestInline(startKey) || this.getDescendant(startKey);
    return range.isAtStartOf(start) || range.isAtEndOf(start);
  }
};

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Node, ['getBlocks', 'getBlocksAsArray', 'getCharacters', 'getCharactersAsArray', 'getFirstText', 'getInlines', 'getInlinesAsArray', 'getKeys', 'getLastText', 'getMarks', 'getOrderedMarks', 'getMarksAsArray', 'getText', 'getTextDirection', 'getTexts', 'getTextsAsArray', 'isLeafBlock', 'isLeafInline'], {
  takesArguments: false
});

(0, _memoize2.default)(Node, ['areDescendantsSorted', 'getAncestors', 'getBlocksAtRange', 'getBlocksAtRangeAsArray', 'getBlocksByType', 'getBlocksByTypeAsArray', 'getCharactersAtRange', 'getCharactersAtRangeAsArray', 'getChild', 'getChildrenBetween', 'getChildrenBetweenIncluding', 'getClosestBlock', 'getClosestInline', 'getClosestVoid', 'getCommonAncestor', 'getComponent', 'getDecorators', 'getDepth', 'getDescendant', 'getDescendantAtPath', 'getDescendantDecorators', 'getFragmentAtRange', 'getFurthestBlock', 'getFurthestInline', 'getFurthestAncestor', 'getFurthestOnlyChildAncestor', 'getInlinesAtRange', 'getInlinesAtRangeAsArray', 'getInlinesByType', 'getInlinesByTypeAsArray', 'getMarksAtRange', 'getOrderedMarksAtRange', 'getMarksAtRangeAsArray', 'getMarksByType', 'getOrderedMarksByType', 'getMarksByTypeAsArray', 'getNextBlock', 'getNextSibling', 'getNextText', 'getNode', 'getOffset', 'getOffsetAtRange', 'getParent', 'getPath', 'getPreviousBlock', 'getPreviousSibling', 'getPreviousText', 'getTextAtOffset', 'getTextsAtRange', 'getTextsAtRangeAsArray', 'hasChild', 'hasDescendant', 'hasNode', 'hasVoidParent', 'isInlineSplitAtRange', 'validate'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Node;

},{"../utils/generate-key":121,"../utils/is-in-range":124,"../utils/memoize":126,"../utils/normalize":129,"../utils/warn":134,"./document":90,"direction":5}],94:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  marks: new _immutable.Set(),
  text: ''
};

/**
 * Range.
 *
 * @type {Range}
 */

var Range = function (_ref) {
  _inherits(Range, _ref);

  function Range() {
    _classCallCheck(this, Range);

    return _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).apply(this, arguments));
  }

  _createClass(Range, [{
    key: 'getCharacters',


    /**
     * Return range as a list of characters
     *
     * @return {List<Character>}
     */

    value: function getCharacters() {
      var marks = this.marks;


      return _character2.default.createList(this.text.split('').map(function (char) {
        return _character2.default.create({
          text: char,
          marks: marks
        });
      }));
    }
  }, {
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'range';
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Range` with `properties`.
     *
     * @param {Object|Range} properties
     * @return {Range}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Range) return properties;
      properties.text = properties.text;
      properties.marks = _mark2.default.createSet(properties.marks);
      return new Range(properties);
    }
  }]);

  return Range;
}(new _immutable.Record(DEFAULTS));

/**
 * Export.
 *
 * @type {Range}
 */

exports.default = Range;

},{"./character":88,"./mark":92}],95:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _isReactComponent = require('../utils/is-react-component');

var _isReactComponent2 = _interopRequireDefault(_isReactComponent);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  rules: []
};

/**
 * Schema.
 *
 * @type {Schema}
 */

var Schema = function (_ref) {
  _inherits(Schema, _ref);

  function Schema() {
    _classCallCheck(this, Schema);

    return _possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).apply(this, arguments));
  }

  _createClass(Schema, [{
    key: '__getComponent',


    /**
     * Return the renderer for an `object`.
     *
     * This method is private, because it should always be called on one of the
     * often-changing immutable objects instead, since it will be memoized for
     * much better performance.
     *
     * @param {Mixed} object
     * @return {Component|Void}
     */

    value: function __getComponent(object) {
      var match = this.rules.find(function (rule) {
        return rule.render && rule.match(object);
      });
      if (!match) return;
      return match.render;
    }

    /**
     * Return the decorators for an `object`.
     *
     * This method is private, because it should always be called on one of the
     * often-changing immutable objects instead, since it will be memoized for
     * much better performance.
     *
     * @param {Mixed} object
     * @return {Array}
     */

  }, {
    key: '__getDecorators',
    value: function __getDecorators(object) {
      return this.rules.filter(function (rule) {
        return rule.decorate && rule.match(object);
      }).map(function (rule) {
        return function (text) {
          return rule.decorate(text, object);
        };
      });
    }

    /**
     * Validate an `object` against the schema, returning the failing rule and
     * value if the object is invalid, or void if it's valid.
     *
     * This method is private, because it should always be called on one of the
     * often-changing immutable objects instead, since it will be memoized for
     * much better performance.
     *
     * @param {Mixed} object
     * @return {Object|Void}
     */

  }, {
    key: '__validate',
    value: function __validate(object) {
      var value = void 0;

      var match = this.rules.find(function (rule) {
        if (!rule.validate) return;
        if (!rule.match(object)) return;

        value = rule.validate(object);
        return value;
      });

      if (!value) return;

      return {
        rule: match,
        value: value
      };
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'schema';
    }

    /**
     * Return true if one rule can normalize the document
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasValidators',
    get: function get() {
      var rules = this.rules;

      return rules.some(function (rule) {
        return rule.validate;
      });
    }

    /**
     * Return true if one rule can decorate text nodes
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasDecorators',
    get: function get() {
      var rules = this.rules;

      return rules.some(function (rule) {
        return rule.decorate;
      });
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Schema` with `properties`.
     *
     * @param {Object|Schema} properties
     * @return {Schema}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Schema) return properties;
      return new Schema(normalizeProperties(properties));
    }
  }]);

  return Schema;
}(new _immutable.Record(DEFAULTS));

/**
 * Normalize the `properties` of a schema.
 *
 * @param {Object} properties
 * @return {Object}
 */

function normalizeProperties(properties) {
  var _properties$rules = properties.rules,
      rules = _properties$rules === undefined ? [] : _properties$rules,
      nodes = properties.nodes,
      marks = properties.marks;


  if (nodes) {
    var array = normalizeNodes(nodes);
    rules = rules.concat(array);
  }

  if (marks) {
    var _array = normalizeMarks(marks);
    rules = rules.concat(_array);
  }

  return { rules: rules };
}

/**
 * Normalize a `nodes` shorthand argument.
 *
 * @param {Object} nodes
 * @return {Array}
 */

function normalizeNodes(nodes) {
  var rules = [];

  var _loop = function _loop(key) {
    var rule = nodes[key];

    if ((0, _typeOf2.default)(rule) == 'function' || (0, _isReactComponent2.default)(rule)) {
      rule = { render: rule };
    }

    rule.match = function (object) {
      return (object.kind == 'block' || object.kind == 'inline') && object.type == key;
    };

    rules.push(rule);
  };

  for (var key in nodes) {
    _loop(key);
  }

  return rules;
}

/**
 * Normalize a `marks` shorthand argument.
 *
 * @param {Object} marks
 * @return {Array}
 */

function normalizeMarks(marks) {
  var rules = [];

  var _loop2 = function _loop2(key) {
    var rule = marks[key];

    if (!rule.render && !rule.decorator && !rule.validate) {
      rule = { render: rule };
    }

    rule.render = normalizeMarkComponent(rule.render);
    rule.match = function (object) {
      return object.kind == 'mark' && object.type == key;
    };
    rules.push(rule);
  };

  for (var key in marks) {
    _loop2(key);
  }

  return rules;
}

/**
 * Normalize a mark `render` property.
 *
 * @param {Component|Function|Object|String} render
 * @return {Component}
 */

function normalizeMarkComponent(render) {
  if ((0, _isReactComponent2.default)(render)) return render;

  switch ((0, _typeOf2.default)(render)) {
    case 'function':
      return render;
    case 'object':
      return function (props) {
        return _react2.default.createElement(
          'span',
          { style: render },
          props.children
        );
      };
    case 'string':
      return function (props) {
        return _react2.default.createElement(
          'span',
          { className: render },
          props.children
        );
      };
  }
}

/**
 * Export.
 *
 * @type {Schema}
 */

exports.default = Schema;

},{"../utils/is-react-component":125,"type-of":76}],96:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _warn = require('../utils/warn');

var _warn2 = _interopRequireDefault(_warn);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  anchorKey: null,
  anchorOffset: 0,
  focusKey: null,
  focusOffset: 0,
  isBackward: null,
  isFocused: false,
  marks: null
};

/**
 * Selection.
 *
 * @type {Selection}
 */

var Selection = function (_ref) {
  _inherits(Selection, _ref);

  function Selection() {
    _classCallCheck(this, Selection);

    return _possibleConstructorReturn(this, (Selection.__proto__ || Object.getPrototypeOf(Selection)).apply(this, arguments));
  }

  _createClass(Selection, [{
    key: 'hasAnchorAtStartOf',


    /**
     * Check whether anchor point of the selection is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

    value: function hasAnchorAtStartOf(node) {
      // PERF: Do a check for a `0` offset first since it's quickest.
      if (this.anchorOffset != 0) return false;
      var first = getFirst(node);
      return this.anchorKey == first.key;
    }

    /**
     * Check whether anchor point of the selection is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorAtEndOf',
    value: function hasAnchorAtEndOf(node) {
      var last = getLast(node);
      return this.anchorKey == last.key && this.anchorOffset == last.length;
    }

    /**
     * Check whether the anchor edge of a selection is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorBetween',
    value: function hasAnchorBetween(node, start, end) {
      return this.anchorOffset <= end && start <= this.anchorOffset && this.hasAnchorIn(node);
    }

    /**
     * Check whether the anchor edge of a selection is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorIn',
    value: function hasAnchorIn(node) {
      return node.kind == 'text' ? node.key == this.anchorKey : node.hasDescendant(this.anchorKey);
    }

    /**
     * Check whether focus point of the selection is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtEndOf',
    value: function hasFocusAtEndOf(node) {
      var last = getLast(node);
      return this.focusKey == last.key && this.focusOffset == last.length;
    }

    /**
     * Check whether focus point of the selection is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtStartOf',
    value: function hasFocusAtStartOf(node) {
      if (this.focusOffset != 0) return false;
      var first = getFirst(node);
      return this.focusKey == first.key;
    }

    /**
     * Check whether the focus edge of a selection is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusBetween',
    value: function hasFocusBetween(node, start, end) {
      return start <= this.focusOffset && this.focusOffset <= end && this.hasFocusIn(node);
    }

    /**
     * Check whether the focus edge of a selection is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusIn',
    value: function hasFocusIn(node) {
      return node.kind == 'text' ? node.key == this.focusKey : node.hasDescendant(this.focusKey);
    }

    /**
     * Check whether the selection is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtStartOf',
    value: function isAtStartOf(node) {
      return this.isCollapsed && this.hasAnchorAtStartOf(node);
    }

    /**
     * Check whether the selection is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtEndOf',
    value: function isAtEndOf(node) {
      return this.isCollapsed && this.hasAnchorAtEndOf(node);
    }

    /**
     * Focus the selection.
     *
     * @return {Selection}
     */

  }, {
    key: 'focus',
    value: function focus() {
      return this.merge({
        isFocused: true
      });
    }

    /**
     * Blur the selection.
     *
     * @return {Selection}
     */

  }, {
    key: 'blur',
    value: function blur() {
      return this.merge({
        isFocused: false
      });
    }

    /**
     * Unset the selection.
     *
     * @return {Selection}
     */

  }, {
    key: 'deselect',
    value: function deselect() {
      return this.merge({
        anchorKey: null,
        anchorOffset: 0,
        focusKey: null,
        focusOffset: 0,
        isFocused: false,
        isBackward: false
      });
    }

    /**
     * Flip the selection.
     *
     * @return {Selection}
     */

  }, {
    key: 'flip',
    value: function flip() {
      return this.merge({
        anchorKey: this.focusKey,
        anchorOffset: this.focusOffset,
        focusKey: this.anchorKey,
        focusOffset: this.anchorOffset,
        isBackward: this.isBackward == null ? null : !this.isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveAnchor',
    value: function moveAnchor() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      var anchorOffset = this.anchorOffset + n;
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: anchorKey == focusKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveFocus',
    value: function moveFocus() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          focusKey = this.focusKey,
          isBackward = this.isBackward;

      var focusOffset = this.focusOffset + n;
      return this.merge({
        focusOffset: focusOffset,
        isBackward: focusKey == anchorKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the selection's anchor point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Selection}
     */

  }, {
    key: 'moveAnchorTo',
    value: function moveAnchorTo(key, offset) {
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      return this.merge({
        anchorKey: key,
        anchorOffset: offset,
        isBackward: key == focusKey ? offset > focusOffset : key == anchorKey ? isBackward : null
      });
    }

    /**
     * Move the selection's focus point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Selection}
     */

  }, {
    key: 'moveFocusTo',
    value: function moveFocusTo(key, offset) {
      var focusKey = this.focusKey,
          anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          isBackward = this.isBackward;

      return this.merge({
        focusKey: key,
        focusOffset: offset,
        isBackward: key == anchorKey ? anchorOffset > offset : key == focusKey ? isBackward : null
      });
    }

    /**
     * Move the selection to `anchorOffset`.
     *
     * @param {Number} anchorOffset
     * @return {Selection}
     */

  }, {
    key: 'moveAnchorOffsetTo',
    value: function moveAnchorOffsetTo(anchorOffset) {
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: this.anchorKey == this.focusKey ? anchorOffset > this.focusOffset : this.isBackward
      });
    }

    /**
     * Move the selection to `focusOffset`.
     *
     * @param {Number} focusOffset
     * @return {Selection}
     */

  }, {
    key: 'moveFocusOffsetTo',
    value: function moveFocusOffsetTo(focusOffset) {
      return this.merge({
        focusOffset: focusOffset,
        isBackward: this.anchorKey == this.focusKey ? this.anchorOffset > focusOffset : this.isBackward
      });
    }

    /**
     * Move the selection to `anchorOffset` and `focusOffset`.
     *
     * @param {Number} anchorOffset
     * @param {Number} focusOffset (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveOffsetsTo',
    value: function moveOffsetsTo(anchorOffset) {
      var focusOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : anchorOffset;

      return this.moveAnchorOffsetTo(anchorOffset).moveFocusOffsetTo(focusOffset);
    }

    /**
     * Move the focus point to the anchor point.
     *
     * @return {Selection}
     */

  }, {
    key: 'moveToAnchor',
    value: function moveToAnchor() {
      return this.moveFocusTo(this.anchorKey, this.anchorOffset);
    }

    /**
     * Move the anchor point to the focus point.
     *
     * @return {Selection}
     */

  }, {
    key: 'moveToFocus',
    value: function moveToFocus() {
      return this.moveAnchorTo(this.focusKey, this.focusOffset);
    }

    /**
     * Move the selection's anchor point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Selection}
     */

  }, {
    key: 'moveAnchorToStartOf',
    value: function moveAnchorToStartOf(node) {
      node = getFirst(node);
      return this.moveAnchorTo(node.key, 0);
    }

    /**
     * Move the selection's anchor point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Selection}
     */

  }, {
    key: 'moveAnchorToEndOf',
    value: function moveAnchorToEndOf(node) {
      node = getLast(node);
      return this.moveAnchorTo(node.key, node.length);
    }

    /**
     * Move the selection's focus point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Selection}
     */

  }, {
    key: 'moveFocusToStartOf',
    value: function moveFocusToStartOf(node) {
      node = getFirst(node);
      return this.moveFocusTo(node.key, 0);
    }

    /**
     * Move the selection's focus point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Selection}
     */

  }, {
    key: 'moveFocusToEndOf',
    value: function moveFocusToEndOf(node) {
      node = getLast(node);
      return this.moveFocusTo(node.key, node.length);
    }

    /**
     * Move to the entire range of `start` and `end` nodes.
     *
     * @param {Node} start
     * @param {Node} end (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveToRangeOf',
    value: function moveToRangeOf(start) {
      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : start;

      return this.moveAnchorToStartOf(start).moveFocusToEndOf(end);
    }

    /**
     * Normalize the selection, relative to a `node`, ensuring that the anchor
     * and focus nodes of the selection always refer to leaf text nodes.
     *
     * @param {Node} node
     * @return {Selection}
     */

  }, {
    key: 'normalize',
    value: function normalize(node) {
      var selection = this;
      var anchorKey = selection.anchorKey,
          anchorOffset = selection.anchorOffset,
          focusKey = selection.focusKey,
          focusOffset = selection.focusOffset,
          isBackward = selection.isBackward;

      // If the selection isn't formed yet or is malformed, ensure that it is
      // properly zeroed out.

      if (anchorKey == null || focusKey == null || !node.hasDescendant(anchorKey) || !node.hasDescendant(focusKey)) {
        return selection.merge({
          anchorKey: null,
          anchorOffset: 0,
          focusKey: null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // Get the anchor and focus nodes.
      var anchorNode = node.getDescendant(anchorKey);
      var focusNode = node.getDescendant(focusKey);

      // If the anchor node isn't a text node, match it to one.
      if (anchorNode.kind != 'text') {
        (0, _warn2.default)('The selection anchor was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', anchorNode);
        var anchorText = anchorNode.getTextAtOffset(anchorOffset);
        var offset = anchorNode.getOffset(anchorText.key);
        anchorOffset = anchorOffset - offset;
        anchorNode = anchorText;
      }

      // If the focus node isn't a text node, match it to one.
      if (focusNode.kind != 'text') {
        (0, _warn2.default)('The selection focus was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', focusNode);
        var focusText = focusNode.getTextAtOffset(focusOffset);
        var _offset = focusNode.getOffset(focusText.key);
        focusOffset = focusOffset - _offset;
        focusNode = focusText;
      }

      // If `isBackward` is not set, derive it.
      if (isBackward == null) {
        if (anchorNode.key === focusNode.key) {
          isBackward = anchorOffset > focusOffset;
        } else {
          isBackward = !node.areDescendantsSorted(anchorNode.key, focusNode.key);
        }
      }

      // Merge in any updated properties.
      return selection.merge({
        anchorKey: anchorNode.key,
        anchorOffset: anchorOffset,
        focusKey: focusNode.key,
        focusOffset: focusOffset,
        isBackward: isBackward
      });
    }

    /**
     * Unset the selection.
     *
     * @return {Selection}
     */

  }, {
    key: 'unset',
    value: function unset() {
      (0, _warn2.default)('The `Selection.unset` method is deprecated, please switch to using `Selection.deselect` instead.');
      return this.deselect();
    }

    /**
     * Move the selection forward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveForward',
    value: function moveForward() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.moveForward(n)` method is deprecated, please switch to using `Selection.move(n)` instead.');
      return this.move(n);
    }

    /**
     * Move the selection backward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveBackward',
    value: function moveBackward() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.moveBackward(n)` method is deprecated, please switch to using `Selection.move(-n)` (with a negative number) instead.');
      return this.move(0 - n);
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveAnchorOffset',
    value: function moveAnchorOffset() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.moveAnchorOffset(n)` method is deprecated, please switch to using `Selection.moveAnchor(n)` instead.');
      return this.moveAnchor(n);
    }

    /**
     * Move the focus offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveFocusOffset',
    value: function moveFocusOffset() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.moveFocusOffset(n)` method is deprecated, please switch to using `Selection.moveFocus(n)` instead.');
      return this.moveFocus(n);
    }

    /**
     * Move the start offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveStartOffset',
    value: function moveStartOffset() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.moveStartOffset(n)` method is deprecated, please switch to using `Selection.moveStart(n)` instead.');
      return this.moveStart(n);
    }

    /**
     * Move the focus offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveEndOffset',
    value: function moveEndOffset() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.moveEndOffset(n)` method is deprecated, please switch to using `Selection.moveEnd(n)` instead.');
      return this.moveEnd(n);
    }

    /**
     * Extend the focus point forward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'extendForward',
    value: function extendForward() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.extendForward(n)` method is deprecated, please switch to using `Selection.extend(n)` instead.');
      return this.extend(n);
    }

    /**
     * Extend the focus point backward `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Selection}
     */

  }, {
    key: 'extendBackward',
    value: function extendBackward() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      (0, _warn2.default)('The `Selection.extendBackward(n)` method is deprecated, please switch to using `Selection.extend(-n)` (with a negative number) instead.');
      return this.extend(0 - n);
    }

    /**
     * Move the selection to `anchorOffset` and `focusOffset`.
     *
     * @param {Number} anchorOffset
     * @param {Number} focusOffset (optional)
     * @return {Selection}
     */

  }, {
    key: 'moveToOffsets',
    value: function moveToOffsets(anchorOffset) {
      var focusOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : anchorOffset;

      (0, _warn2.default)('The `Selection.moveToOffsets` method is deprecated, please switch to using `Selection.moveOffsetsTo` instead.');
      return this.moveOffsetsTo(anchorOffset, focusOffset);
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'selection';
    }

    /**
     * Check whether the selection is blurred.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return !this.isFocused;
    }

    /**
     * Check whether the selection is collapsed.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.anchorKey == this.focusKey && this.anchorOffset == this.focusOffset;
    }

    /**
     * Check whether the selection is expanded.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return !this.isCollapsed;
    }

    /**
     * Check whether the selection is forward.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.isBackward == null ? null : !this.isBackward;
    }

    /**
     * Check whether the selection's keys are set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isSet',
    get: function get() {
      return this.anchorKey != null && this.focusKey != null;
    }

    /**
     * Check whether the selection's keys are not set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isUnset',
    get: function get() {
      return !this.isSet;
    }

    /**
     * Get the start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.isBackward ? this.focusKey : this.anchorKey;
    }

    /**
     * Get the start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.isBackward ? this.focusOffset : this.anchorOffset;
    }

    /**
     * Get the end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.isBackward ? this.anchorKey : this.focusKey;
    }

    /**
     * Get the end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.isBackward ? this.anchorOffset : this.focusOffset;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Selection` with `properties`.
     *
     * @param {Object|Selection} properties
     * @return {Selection}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Selection) return properties;
      return new Selection(properties);
    }
  }]);

  return Selection;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in some "move" convenience methods.
 */

var MOVE_METHODS = [['move', ''], ['move', 'To'], ['move', 'ToStartOf'], ['move', 'ToEndOf']];

MOVE_METHODS.forEach(function (_ref2) {
  var _ref3 = _slicedToArray(_ref2, 2),
      p = _ref3[0],
      s = _ref3[1];

  Selection.prototype['' + p + s] = function () {
    var _ref4;

    return (_ref4 = this[p + 'Anchor' + s].apply(this, arguments))[p + 'Focus' + s].apply(_ref4, arguments);
  };
});

/**
 * Mix in the "start", "end" and "edge" convenience methods.
 */

var EDGE_METHODS = [['has', 'AtStartOf', true], ['has', 'AtEndOf', true], ['has', 'Between', true], ['has', 'In', true], ['collapseTo', ''], ['move', ''], ['moveTo', ''], ['move', 'To'], ['move', 'OffsetTo']];

EDGE_METHODS.forEach(function (_ref5) {
  var _ref6 = _slicedToArray(_ref5, 3),
      p = _ref6[0],
      s = _ref6[1],
      hasEdge = _ref6[2];

  var anchor = p + 'Anchor' + s;
  var focus = p + 'Focus' + s;

  Selection.prototype[p + 'Start' + s] = function () {
    return this.isBackward ? this[focus].apply(this, arguments) : this[anchor].apply(this, arguments);
  };

  Selection.prototype[p + 'End' + s] = function () {
    return this.isBackward ? this[anchor].apply(this, arguments) : this[focus].apply(this, arguments);
  };

  if (hasEdge) {
    Selection.prototype[p + 'Edge' + s] = function () {
      return this[anchor].apply(this, arguments) || this[focus].apply(this, arguments);
    };
  }
});

/**
 * Mix in some aliases for convenience / parallelism with the browser APIs.
 */

var ALIAS_METHODS = [['collapseTo', 'moveTo'], ['collapseToAnchor', 'moveToAnchor'], ['collapseToFocus', 'moveToFocus'], ['collapseToStart', 'moveToStart'], ['collapseToEnd', 'moveToEnd'], ['collapseToStartOf', 'moveToStartOf'], ['collapseToEndOf', 'moveToEndOf'], ['extend', 'moveFocus'], ['extendTo', 'moveFocusTo'], ['extendToStartOf', 'moveFocusToStartOf'], ['extendToEndOf', 'moveFocusToEndOf']];

ALIAS_METHODS.forEach(function (_ref7) {
  var _ref8 = _slicedToArray(_ref7, 2),
      alias = _ref8[0],
      method = _ref8[1];

  Selection.prototype[alias] = function () {
    return this[method].apply(this, arguments);
  };
});

/**
 * Get the first text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getFirst(node) {
  return node.kind == 'text' ? node : node.getFirstText();
}

/**
 * Get the last text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getLast(node) {
  return node.kind == 'text' ? node : node.getLastText();
}

/**
 * Export.
 *
 * @type {Selection}
 */

exports.default = Selection;

},{"../utils/warn":134}],97:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('../plugins/core');

var _core2 = _interopRequireDefault(_core);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _schema2 = require('./schema');

var _schema3 = _interopRequireDefault(_schema2);

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:stack');

/**
 * Methods that are triggered on events and can change the state.
 *
 * @type {Array}
 */

var EVENT_HANDLER_METHODS = ['onBeforeInput', 'onBlur', 'onFocus', 'onCopy', 'onCut', 'onDrop', 'onKeyDown', 'onPaste', 'onSelect'];

/**
 * Methods that accumulate an updated state.
 *
 * @type {Array}
 */

var STATE_ACCUMULATOR_METHODS = ['onBeforeChange', 'onChange'];

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  plugins: [],
  schema: new _schema3.default()
};

/**
 * Stack.
 *
 * @type {Stack}
 */

var Stack = function (_ref) {
  _inherits(Stack, _ref);

  function Stack() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, Stack);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Stack.__proto__ || Object.getPrototypeOf(Stack)).call.apply(_ref2, [this].concat(args))), _this), _this.render = function (state, editor, props) {
      debug('render');
      var plugins = _this.plugins.slice().reverse();
      var children = void 0;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var plugin = _step.value;

          if (!plugin.render) continue;
          children = plugin.render(props, state, editor);
          props.children = children;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return children;
    }, _this.renderPortal = function (state, editor) {
      debug('renderPortal');
      var portals = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _this.plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var plugin = _step2.value;

          if (!plugin.renderPortal) continue;
          var portal = plugin.renderPortal(state, editor);
          if (portal == null) continue;
          portals.push(portal);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return portals;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Stack, [{
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'stack';
    }

    /**
     * Invoke `render` on all of the plugins in reverse, building up a tree of
     * higher-order components.
     *
     * @param {State} state
     * @param {Editor} editor
     * @param {Object} children
     * @param {Object} props
     * @return {Component}
     */

    /**
     * Invoke `renderPortal` on all of the plugins, building a list of portals.
     *
     * @param {State} state
     * @param {Editor} editor
     * @return {Array}
     */

  }], [{
    key: 'create',


    /**
     * Constructor.
     *
     * @param {Object} properties
     *   @property {Array} plugins
     *   @property {Schema|Object} schema
     *   @property {Function} ...handlers
     */

    value: function create(properties) {
      var plugins = resolvePlugins(properties);
      var schema = resolveSchema(plugins);
      return new Stack({ plugins: plugins, schema: schema });
    }
  }]);

  return Stack;
}(new _immutable.Record(DEFAULTS));

/**
 * Mix in the event handler methods.
 *
 * @param {State} state
 * @param {Editor} editor
 * @param {Mixed} ...args
 * @return {State|Null}
 */

var _iteratorNormalCompletion3 = true;
var _didIteratorError3 = false;
var _iteratorError3 = undefined;

try {
  var _loop = function _loop() {
    var method = _step3.value;

    Stack.prototype[method] = function (state, editor) {
      debug(method);

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.plugins[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var plugin = _step6.value;

          if (!plugin[method]) continue;
          var next = plugin[method].apply(plugin, args.concat([state, editor]));
          if (next == null) continue;
          assertState(next);
          return next;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return state;
    };
  };

  for (var _iterator3 = EVENT_HANDLER_METHODS[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
    _loop();
  }

  /**
   * Mix in the state accumulator methods.
   *
   * @param {State} state
   * @param {Editor} editor
   * @param {Mixed} ...args
   * @return {State|Null}
   */
} catch (err) {
  _didIteratorError3 = true;
  _iteratorError3 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion3 && _iterator3.return) {
      _iterator3.return();
    }
  } finally {
    if (_didIteratorError3) {
      throw _iteratorError3;
    }
  }
}

var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;
var _iteratorError4 = undefined;

try {
  var _loop2 = function _loop2() {
    var method = _step4.value;

    Stack.prototype[method] = function (state, editor) {
      debug(method);

      if (method == 'onChange') {
        state = this.onBeforeChange(state, editor);
      }

      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.plugins[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var plugin = _step7.value;

          if (!plugin[method]) continue;
          var next = plugin[method].apply(plugin, args.concat([state, editor]));
          if (next == null) continue;
          assertState(next);
          state = next;
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return state;
    };
  };

  for (var _iterator4 = STATE_ACCUMULATOR_METHODS[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
    _loop2();
  }

  /**
   * Assert that a `value` is a state object.
   *
   * @param {Mixed} value
   */
} catch (err) {
  _didIteratorError4 = true;
  _iteratorError4 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion4 && _iterator4.return) {
      _iterator4.return();
    }
  } finally {
    if (_didIteratorError4) {
      throw _iteratorError4;
    }
  }
}

function assertState(value) {
  if (value instanceof _state2.default) return;
  throw new Error('A plugin returned an unexpected state value: ' + value);
}

/**
 * Resolve a schema from a set of `plugins`.
 *
 * @param {Array} plugins
 * @return {Schema}
 */

function resolveSchema(plugins) {
  var rules = [];

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = plugins[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var plugin = _step5.value;

      if (plugin.schema == null) continue;
      var _schema = _schema3.default.create(plugin.schema);
      rules = rules.concat(_schema.rules);
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  var schema = _schema3.default.create({ rules: rules });
  return schema;
}

/**
 * Resolve an array of plugins from `properties`.
 *
 * In addition to the plugins provided in `properties.plugins`, this will
 * create two other plugins:
 *
 * - A plugin made from the top-level `properties` themselves, which are
 * placed at the beginning of the stack. That way, you can add a `onKeyDown`
 * handler, and it will override all of the existing plugins.
 *
 * - A "core" functionality plugin that handles the most basic events in Slate,
 * like deleting characters, splitting blocks, etc.
 *
 * @param {Object} props
 * @return {Array}
 */

function resolvePlugins(props) {
  var _props$plugins = props.plugins,
      plugins = _props$plugins === undefined ? [] : _props$plugins,
      overridePlugin = _objectWithoutProperties(props, ['plugins']);

  var corePlugin = (0, _core2.default)(props);
  return [overridePlugin].concat(_toConsumableArray(plugins), [corePlugin]);
}

/**
 * Export.
 *
 * @type {Stack}
 */

exports.default = Stack;

},{"../plugins/core":101,"./schema":95,"./state":98,"debug":3}],98:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _core = require('../schemas/core');

var _core2 = _interopRequireDefault(_core);

var _selection = require('./selection');

var _selection2 = _interopRequireDefault(_selection);

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * History.
 *
 * @type {History}
 */

var History = new _immutable.Record({
  undos: new _immutable.Stack(),
  redos: new _immutable.Stack()
});

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  document: new _document2.default(),
  selection: new _selection2.default(),
  history: new History(),
  data: new _immutable.Map(),
  isNative: false
};

/**
 * State.
 *
 * @type {State}
 */

var State = function (_ref) {
  _inherits(State, _ref);

  function State() {
    _classCallCheck(this, State);

    return _possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).apply(this, arguments));
  }

  _createClass(State, [{
    key: 'transform',


    /**
     * Return a new `Transform` with the current state as a starting point.
     *
     * @param {Object} properties
     * @return {Transform}
     */

    value: function transform() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var state = this;
      return new _transform2.default(_extends({}, properties, {
        state: state
      }));
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'state';
    }

    /**
     * Are there undoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasUndos',
    get: function get() {
      return this.history.undos.size > 0;
    }

    /**
     * Are there redoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasRedos',
    get: function get() {
      return this.history.redos.size > 0;
    }

    /**
     * Is the current selection blurred?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return this.selection.isBlurred;
    }

    /**
     * Is the current selection focused?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isFocused',
    get: function get() {
      return this.selection.isFocused;
    }

    /**
     * Is the current selection collapsed?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.selection.isCollapsed;
    }

    /**
     * Is the current selection expanded?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return this.selection.isExpanded;
    }

    /**
     * Is the current selection backward?
     *
     * @return {Boolean} isBackward
     */

  }, {
    key: 'isBackward',
    get: function get() {
      return this.selection.isBackward;
    }

    /**
     * Is the current selection forward?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.selection.isForward;
    }

    /**
     * Get the current start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.selection.startKey;
    }

    /**
     * Get the current end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.selection.endKey;
    }

    /**
     * Get the current start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.selection.startOffset;
    }

    /**
     * Get the current end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.selection.endOffset;
    }

    /**
     * Get the current anchor key.
     *
     * @return {String}
     */

  }, {
    key: 'anchorKey',
    get: function get() {
      return this.selection.anchorKey;
    }

    /**
     * Get the current focus key.
     *
     * @return {String}
     */

  }, {
    key: 'focusKey',
    get: function get() {
      return this.selection.focusKey;
    }

    /**
     * Get the current anchor offset.
     *
     * @return {String}
     */

  }, {
    key: 'anchorOffset',
    get: function get() {
      return this.selection.anchorOffset;
    }

    /**
     * Get the current focus offset.
     *
     * @return {String}
     */

  }, {
    key: 'focusOffset',
    get: function get() {
      return this.selection.focusOffset;
    }

    /**
     * Get the current start text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'startBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.startKey);
    }

    /**
     * Get the current end text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'endBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.endKey);
    }

    /**
     * Get the current anchor text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'anchorBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.anchorKey);
    }

    /**
     * Get the current focus text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'focusBlock',
    get: function get() {
      return this.document.getClosestBlock(this.selection.focusKey);
    }

    /**
     * Get the current start text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'startInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.startKey);
    }

    /**
     * Get the current end text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'endInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.endKey);
    }

    /**
     * Get the current anchor text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'anchorInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.anchorKey);
    }

    /**
     * Get the current focus text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'focusInline',
    get: function get() {
      return this.document.getClosestInline(this.selection.focusKey);
    }

    /**
     * Get the current start text node.
     *
     * @return {Text}
     */

  }, {
    key: 'startText',
    get: function get() {
      return this.document.getDescendant(this.selection.startKey);
    }

    /**
     * Get the current end node.
     *
     * @return {Text}
     */

  }, {
    key: 'endText',
    get: function get() {
      return this.document.getDescendant(this.selection.endKey);
    }

    /**
     * Get the current anchor node.
     *
     * @return {Text}
     */

  }, {
    key: 'anchorText',
    get: function get() {
      return this.document.getDescendant(this.selection.anchorKey);
    }

    /**
     * Get the current focus node.
     *
     * @return {Text}
     */

  }, {
    key: 'focusText',
    get: function get() {
      return this.document.getDescendant(this.selection.focusKey);
    }

    /**
     * Get the characters in the current selection.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'characters',
    get: function get() {
      return this.document.getCharactersAtRange(this.selection);
    }

    /**
     * Get the marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'marks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.Set() : this.selection.marks || this.document.getMarksAtRange(this.selection);
    }

    /**
     * Get the block nodes in the current selection.
     *
     * @return {List<Block>}
     */

  }, {
    key: 'blocks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getBlocksAtRange(this.selection);
    }

    /**
     * Get the fragment of the current selection.
     *
     * @return {Document}
     */

  }, {
    key: 'fragment',
    get: function get() {
      return this.selection.isUnset ? _document2.default.create() : this.document.getFragmentAtRange(this.selection);
    }

    /**
     * Get the inline nodes in the current selection.
     *
     * @return {List<Inline>}
     */

  }, {
    key: 'inlines',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getInlinesAtRange(this.selection);
    }

    /**
     * Get the text nodes in the current selection.
     *
     * @return {List<Text>}
     */

  }, {
    key: 'texts',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getTextsAtRange(this.selection);
    }

    /**
     * Check whether the selection is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      var startOffset = this.startOffset,
          endOffset = this.endOffset;


      if (this.isCollapsed) {
        return true;
      }

      if (endOffset != 0 && startOffset != 0) {
        return false;
      }

      return this.fragment.text.length == 0;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `State` with `properties`.
     *
     * @param {Object|State} properties
     * @param {Object} options
     *   @property {Boolean} normalize
     * @return {State}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (properties instanceof State) return properties;

      var document = _document2.default.create(properties.document);
      var selection = _selection2.default.create(properties.selection);
      var data = new _immutable.Map();

      if (selection.isUnset) {
        var text = document.getFirstText();
        selection = selection.collapseToStartOf(text);
      }

      // Set default value for `data`.
      if (options.plugins) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var plugin = _step.value;

            if (plugin.data) data = data.merge(plugin.data);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      // Then add data provided in `properties`.
      if (properties.data) data = data.merge(properties.data);

      var state = new State({ document: document, selection: selection, data: data });

      return options.normalize === false ? state : state.transform().normalize(_core2.default).apply({ save: false });
    }
  }]);

  return State;
}(new _immutable.Record(DEFAULTS));

/**
 * Export.
 */

exports.default = State;

},{"../schemas/core":102,"./document":90,"./selection":96,"./transform":100}],99:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

var _range = require('./range');

var _range2 = _interopRequireDefault(_range);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  characters: new _immutable.List(),
  key: null
};

/**
 * Text.
 *
 * @type {Text}
 */

var Text = function (_ref) {
  _inherits(Text, _ref);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
  }

  _createClass(Text, [{
    key: 'addMark',


    /**
     * Add a `mark` at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @return {Text}
     */

    value: function addMark(index, length, mark) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char = char,
            marks = _char.marks;

        marks = marks.add(mark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Derive a set of decorated characters with `decorators`.
     *
     * @param {Array} decorators
     * @return {List<Character>}
     */

  }, {
    key: 'getDecorations',
    value: function getDecorations(decorators) {
      var node = this;
      var characters = node.characters;

      if (characters.size == 0) return characters;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = decorators[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var decorator = _step.value;

          var decorateds = decorator(node);
          characters = characters.merge(decorateds);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return characters;
    }

    /**
     * Get the decorations for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Array}
     */

  }, {
    key: 'getDecorators',
    value: function getDecorators(schema) {
      return schema.__getDecorators(this);
    }

    /**
     * Get all of the marks on the text.
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getMarks',
    value: function getMarks() {
      var array = this.getMarksAsArray();
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get all of the marks on the text as an array
     *
     * @return {Array}
     */

  }, {
    key: 'getMarksAsArray',
    value: function getMarksAsArray() {
      return this.characters.reduce(function (array, char) {
        return array.concat(char.marks.toArray());
      }, []);
    }

    /**
     * Get the marks on the text at `index`.
     *
     * @param {Number} index
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksAtIndex',
    value: function getMarksAtIndex(index) {
      if (index == 0) return _mark2.default.createSet();
      var characters = this.characters;

      var char = characters.get(index - 1);
      if (!char) return _mark2.default.createSet();
      return char.marks;
    }

    /**
     * Get a node by `key`, to parallel other nodes.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNode',
    value: function getNode(key) {
      return this.key == key ? this : null;
    }

    /**
     * Derive the ranges for a list of `characters`.
     *
     * @param {Array|Void} decorators (optional)
     * @return {List<Range>}
     */

  }, {
    key: 'getRanges',
    value: function getRanges() {
      var decorators = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var characters = this.getDecorations(decorators);
      var ranges = [];

      // PERF: cache previous values for faster lookup.
      var prevChar = void 0;
      var prevRange = void 0;

      // If there are no characters, return one empty range.
      if (characters.size == 0) {
        ranges.push({});
      }

      // Otherwise, loop the characters and build the ranges...
      else {
          characters.forEach(function (char, i) {
            var marks = char.marks,
                text = char.text;

            // The first one can always just be created.

            if (i == 0) {
              prevChar = char;
              prevRange = { text: text, marks: marks };
              ranges.push(prevRange);
              return;
            }

            // Otherwise, compare the current and previous marks.
            var prevMarks = prevChar.marks;
            var isSame = (0, _immutable.is)(marks, prevMarks);

            // If the marks are the same, add the text to the previous range.
            if (isSame) {
              prevChar = char;
              prevRange.text += text;
              return;
            }

            // Otherwise, create a new range.
            prevChar = char;
            prevRange = { text: text, marks: marks };
            ranges.push(prevRange);
          }, []);
        }

      // PERF: convert the ranges to immutable objects after iterating.
      ranges = new _immutable.List(ranges.map(function (object) {
        return new _range2.default(object);
      }));

      // Return the ranges.
      return ranges;
    }

    /**
     * Check if the node has a node by `key`, to parallel other nodes.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode(key) {
      return !!this.getNode(key);
    }

    /**
     * Insert `text` at `index`.
     *
     * @param {Numbder} index
     * @param {String} text
     * @param {String} marks (optional)
     * @return {Text}
     */

  }, {
    key: 'insertText',
    value: function insertText(index, text, marks) {
      marks = marks || this.getMarksAtIndex(index);
      var characters = this.characters;

      var chars = _character2.default.createListFromText(text, marks);

      characters = characters.slice(0, index).concat(chars).concat(characters.slice(index));

      return this.set('characters', characters);
    }

    /**
     * Regenerate the node's key.
     *
     * @return {Text}
     */

  }, {
    key: 'regenerateKey',
    value: function regenerateKey() {
      var key = (0, _generateKey2.default)();
      return this.set('key', key);
    }

    /**
     * Remove a `mark` at `index` and `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @return {Text}
     */

  }, {
    key: 'removeMark',
    value: function removeMark(index, length, mark) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char2 = char,
            marks = _char2.marks;

        marks = marks.remove(mark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Remove text from the text node at `index` for `length`.
     *
     * @param {Number} index
     * @param {Number} length
     * @return {Text}
     */

  }, {
    key: 'removeText',
    value: function removeText(index, length) {
      var characters = this.characters;

      var start = index;
      var end = index + length;
      characters = characters.filterNot(function (char, i) {
        return start <= i && i < end;
      });
      return this.set('characters', characters);
    }

    /**
     * Update a `mark` at `index` and `length` with `properties`.
     *
     * @param {Number} index
     * @param {Number} length
     * @param {Mark} mark
     * @param {Mark} newMark
     * @return {Text}
     */

  }, {
    key: 'updateMark',
    value: function updateMark(index, length, mark, newMark) {
      var characters = this.characters.map(function (char, i) {
        if (i < index) return char;
        if (i >= index + length) return char;
        var _char3 = char,
            marks = _char3.marks;

        if (!marks.has(mark)) return char;
        marks = marks.remove(mark);
        marks = marks.add(newMark);
        char = char.set('marks', marks);
        return char;
      });

      return this.set('characters', characters);
    }

    /**
     * Validate the text node against a `schema`.
     *
     * @param {Schema} schema
     * @return {Object|Void}
     */

  }, {
    key: 'validate',
    value: function validate(schema) {
      return schema.__validate(this);
    }
  }, {
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'text';
    }

    /**
     * Is the node empty?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the length of the concatenated text of the node.
     *
     * @return {Number}
     */

  }, {
    key: 'length',
    get: function get() {
      return this.text.length;
    }

    /**
     * Get the concatenated text of the node.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.characters.reduce(function (string, char) {
        return string + char.text;
      }, '');
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Text` with `properties`.
     *
     * @param {Object|Text} properties
     * @return {Text}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Text) return properties;
      properties.key = properties.key || (0, _generateKey2.default)();
      properties.characters = _character2.default.createList(properties.characters);
      return new Text(properties);
    }

    /**
     * Create a new `Text` from a string
     *
     * @param {String} text
     * @param {Set<Mark>} marks (optional)
     * @return {Text}
     */

  }, {
    key: 'createFromString',
    value: function createFromString(text) {
      var marks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _immutable.Set)();

      return Text.createFromRanges([_range2.default.create({ text: text, marks: marks })]);
    }

    /**
     * Create a new `Text` from a list of ranges
     *
     * @param {List<Range>|Array<Range>} ranges
     * @return {Text}
     */

  }, {
    key: 'createFromRanges',
    value: function createFromRanges(ranges) {
      return Text.create({
        characters: ranges.reduce(function (characters, range) {
          range = _range2.default.create(range);
          return characters.concat(range.getCharacters());
        }, _character2.default.createList())
      });
    }

    /**
     * Create a list of `Texts` from an array.
     *
     * @param {Array} elements
     * @return {List<Text>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements)) return elements;
      return new _immutable.List(elements.map(Text.create));
    }
  }]);

  return Text;
}(new _immutable.Record(DEFAULTS));

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Text.prototype, ['getMarks', 'getMarksAsArray'], {
  takesArguments: false
});

(0, _memoize2.default)(Text.prototype, ['getDecorations', 'getDecorators', 'getMarksAtIndex', 'getRanges', 'validate'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Text}
 */

exports.default = Text;

},{"../utils/generate-key":121,"../utils/memoize":126,"./character":88,"./mark":92,"./range":94}],100:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _transforms = require('../transforms');

var _transforms2 = _interopRequireDefault(_transforms);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:transform');

/**
 * Transform.
 *
 * @type {Transform}
 */

var Transform = function () {

  /**
   * Constructor.
   *
   * @param {Object} properties
   *   @property {State} state
   */

  function Transform(properties) {
    _classCallCheck(this, Transform);

    var state = properties.state;

    this.state = state;
    this.operations = [];
  }

  /**
   * Get the kind.
   *
   * @return {String}
   */

  _createClass(Transform, [{
    key: 'apply',


    /**
     * Apply the transform and return the new state.
     *
     * @param {Object} options
     *   @property {Boolean} isNative
     *   @property {Boolean} merge
     *   @property {Boolean} save
     * @return {State}
     */

    value: function apply() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var transform = this;
      var merge = options.merge,
          save = options.save,
          _options$isNative = options.isNative,
          isNative = _options$isNative === undefined ? false : _options$isNative;

      // Ensure that the selection is normalized.

      transform.normalizeSelection();

      var state = transform.state,
          operations = transform.operations;
      var history = state.history;
      var undos = history.undos;

      var previous = undos.peek();

      // If there are no operations, abort early.
      if (!operations.length) return state;

      // If there's a previous save point, determine if the new operations should
      // be merged into the previous ones.
      if (previous && merge == null) {
        merge = isOnlySelections(operations) || isContiguousInserts(operations, previous) || isContiguousRemoves(operations, previous);
      }

      // If the save flag isn't set, determine whether we should save.
      if (save == null) {
        save = !isOnlySelections(operations);
      }

      // Save the new operations.
      if (save) this.save({ merge: merge });

      // Return the new state with the `isNative` flag set.
      return this.state.set('isNative', !!isNative);
    }
  }, {
    key: 'kind',
    get: function get() {
      return 'transform';
    }
  }]);

  return Transform;
}();

/**
 * Add a transform method for each of the transforms.
 */

Object.keys(_transforms2.default).forEach(function (type) {
  Transform.prototype[type] = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    debug(type, { args: args });
    _transforms2.default[type].apply(_transforms2.default, [this].concat(args));
    return this;
  };
});

/**
 * Check whether a list of `operations` only contains selection operations.
 *
 * @param {Array} operations
 * @return {Boolean}
 */

function isOnlySelections(operations) {
  return operations.every(function (op) {
    return op.type == 'set_selection';
  });
}

/**
 * Check whether a list of `operations` and a list of `previous` operations are
 * contiguous text insertions.
 *
 * @param {Array} operations
 * @param {Array} previous
 */

function isContiguousInserts(operations, previous) {
  var edits = operations.filter(function (op) {
    return op.type != 'set_selection';
  });
  var prevEdits = previous.filter(function (op) {
    return op.type != 'set_selection';
  });
  if (!edits.length || !prevEdits.length) return false;

  var onlyInserts = edits.every(function (op) {
    return op.type == 'insert_text';
  });
  var prevOnlyInserts = prevEdits.every(function (op) {
    return op.type == 'insert_text';
  });
  if (!onlyInserts || !prevOnlyInserts) return false;

  var first = edits[0];
  var last = prevEdits[prevEdits.length - 1];
  if (first.key != last.key) return false;
  if (first.offset != last.offset + last.text.length) return false;

  return true;
}

/**
 * Check whether a list of `operations` and a list of `previous` operations are
 * contiguous text removals.
 *
 * @param {Array} operations
 * @param {Array} previous
 */

function isContiguousRemoves(operations, previous) {
  var edits = operations.filter(function (op) {
    return op.type != 'set_selection';
  });
  var prevEdits = previous.filter(function (op) {
    return op.type != 'set_selection';
  });
  if (!edits.length || !prevEdits.length) return false;

  var onlyRemoves = edits.every(function (op) {
    return op.type == 'remove_text';
  });
  var prevOnlyRemoves = prevEdits.every(function (op) {
    return op.type == 'remove_text';
  });
  if (!onlyRemoves || !prevOnlyRemoves) return false;

  var first = edits[0];
  var last = prevEdits[prevEdits.length - 1];
  if (first.key != last.key) return false;
  if (first.offset + first.length != last.offset) return false;

  return true;
}

/**
 * Export.
 *
 * @type {Transform}
 */

exports.default = Transform;

},{"../transforms":112,"debug":3}],101:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _content = require('../components/content');

var _content2 = _interopRequireDefault(_content);

var _character = require('../models/character');

var _character2 = _interopRequireDefault(_character);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _getPoint = require('../utils/get-point');

var _getPoint2 = _interopRequireDefault(_getPoint);

var _placeholder = require('../components/placeholder');

var _placeholder2 = _interopRequireDefault(_placeholder);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _findDomNode = require('../utils/find-dom-node');

var _findDomNode2 = _interopRequireDefault(_findDomNode);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:core');

/**
 * The default plugin.
 *
 * @param {Object} options
 *   @property {Element} placeholder
 *   @property {String} placeholderClassName
 *   @property {Object} placeholderStyle
 * @return {Object}
 */

function Plugin() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var placeholder = options.placeholder,
      placeholderClassName = options.placeholderClassName,
      placeholderStyle = options.placeholderStyle;

  /**
   * On before change, enforce the editor's schema.
   *
   * @param {State} state
   * @param {Editor} schema
   * @return {State}
   */

  function onBeforeChange(state, editor) {
    // Don't normalize with plugins schema when typing text in native mode
    if (state.isNative) return state;

    var schema = editor.getSchema();
    var prevState = editor.getState();

    // Since schema can only normalize the document, we avoid creating
    // a transform and normalize the selection if the document is the same
    if (prevState && state.document == prevState.document) return state;

    var newState = state.transform().normalize(schema).apply({ merge: true });

    debug('onBeforeChange');
    return newState;
  }

  /**
   * On before input, see if we can let the browser continue with it's native
   * input behavior, to avoid a re-render for performance.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function onBeforeInput(e, data, state, editor) {
    var document = state.document,
        startKey = state.startKey,
        startBlock = state.startBlock,
        startOffset = state.startOffset,
        startInline = state.startInline,
        startText = state.startText;

    var pText = startBlock.getPreviousText(startKey);
    var pInline = pText && startBlock.getClosestInline(pText.key);
    var nText = startBlock.getNextText(startKey);
    var nInline = nText && startBlock.getClosestInline(nText.key);

    // Determine what the characters would be if natively inserted.
    var schema = editor.getSchema();
    var decorators = document.getDescendantDecorators(startKey, schema);
    var initialChars = startText.getDecorations(decorators);
    var prevChar = startOffset === 0 ? null : initialChars.get(startOffset - 1);
    var nextChar = startOffset === initialChars.size ? null : initialChars.get(startOffset);
    var char = _character2.default.create({
      text: e.data,
      // When cursor is at start of a range of marks, without preceding text,
      // the native behavior is to insert inside the range of marks.
      marks: prevChar && prevChar.marks || nextChar && nextChar.marks || []
    });

    var chars = initialChars.insert(startOffset, char);

    var transform = state.transform();

    // COMPAT: In iOS, when choosing from the predictive text suggestions, the
    // native selection will be changed to span the existing word, so that the word
    // is replaced. But the `select` event for this change doesn't fire until after
    // the `beforeInput` event, even though the native selection is updated. So we
    // need to manually adjust the selection to be in sync. (03/18/2017)
    if (_environment.IS_SAFARI) {
      var window = (0, _getWindow2.default)(e.target);
      var native = window.getSelection();
      var anchorNode = native.anchorNode,
          anchorOffset = native.anchorOffset,
          focusNode = native.focusNode,
          focusOffset = native.focusOffset;

      var anchorPoint = (0, _getPoint2.default)(anchorNode, anchorOffset, state, editor);
      var focusPoint = (0, _getPoint2.default)(focusNode, focusOffset, state, editor);
      if (anchorPoint && focusPoint) {
        var selection = state.selection;

        if (selection.anchorKey !== anchorPoint.key || selection.anchorOffset !== anchorPoint.offset || selection.focusKey !== focusPoint.key || selection.focusOffset !== focusPoint.offset) {
          transform = transform.select({
            anchorKey: anchorPoint.key,
            anchorOffset: anchorPoint.offset,
            focusKey: focusPoint.key,
            focusOffset: focusPoint.offset
          });
        }
      }
    }

    // Determine what the characters should be, if not natively inserted.
    var next = transform.insertText(e.data).apply();

    var nextText = next.startText;
    var nextChars = nextText.getDecorations(decorators);

    // We do not have to re-render if the current selection is collapsed, the
    // current node is not empty, there are no marks on the cursor, the cursor
    // is not at the edge of an inline node, the cursor isn't at the starting
    // edge of a text node after an inline node, and the natively inserted
    // characters would be the same as the non-native.
    var isNative =
    // If the selection is expanded, we don't know what the edit will look
    // like so we can't let it happen natively.
    state.isCollapsed &&
    // If the selection has marks, then we need to render it non-natively
    // because we need to create the new marks as well.
    state.selection.marks == null &&
    // If the text node in question has no content, browsers might do weird
    // things so we need to insert it normally instead.
    state.startText.text != '' && (
    // COMPAT: Browsers do weird things when typing at the edges of inline
    // nodes, so we can't let them render natively. (?)
    !startInline || !state.selection.isAtStartOf(startInline)) && (!startInline || !state.selection.isAtEndOf(startInline)) &&
    // COMPAT: In Chrome & Safari, it isn't possible to have a selection at
    // the starting edge of a text node after another inline node. It will
    // have been automatically changed. So we can't render natively because
    // the cursor isn't technique in the right spot. (2016/12/01)
    !(pInline && !pInline.isVoid && startOffset == 0) && !(nInline && !nInline.isVoid && startOffset == startText.length) &&
    // If the
    chars.equals(nextChars);

    // Add the `isNative` flag directly, so we don't have to re-transform.
    if (isNative) {
      next = next.set('isNative', isNative);
    }

    // If not native, prevent default so that the DOM remains untouched.
    if (!isNative) e.preventDefault();

    debug('onBeforeInput', { data: data, isNative: isNative });
    return next;
  }

  /**
   * On blur.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onBlur(e, data, state) {
    debug('onBlur', { data: data });
    return state.transform().blur().apply();
  }

  /**
   * On copy.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onCopy(e, data, state) {
    debug('onCopy', data);
    onCutOrCopy(e, data, state);
  }

  /**
   * On cut.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function onCut(e, data, state, editor) {
    debug('onCut', data);
    onCutOrCopy(e, data, state);
    var window = (0, _getWindow2.default)(e.target);

    // Once the fake cut content has successfully been added to the clipboard,
    // delete the content in the current selection.
    window.requestAnimationFrame(function () {
      var next = editor.getState().transform().delete().apply();

      editor.onChange(next);
    });
  }

  /**
   * On cut or copy, create a fake selection so that we can add a Base 64
   * encoded copy of the fragment to the HTML, to decode on future pastes.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onCutOrCopy(e, data, state) {
    var window = (0, _getWindow2.default)(e.target);
    var native = window.getSelection();
    var endBlock = state.endBlock,
        endInline = state.endInline;

    var isVoidBlock = endBlock && endBlock.isVoid;
    var isVoidInline = endInline && endInline.isVoid;
    var isVoid = isVoidBlock || isVoidInline;

    // If the selection is collapsed, and it isn't inside a void node, abort.
    if (native.isCollapsed && !isVoid) return;

    var fragment = data.fragment;

    var encoded = _base2.default.serializeNode(fragment);
    var range = native.getRangeAt(0);
    var contents = range.cloneContents();
    var attach = contents.childNodes[0];

    // If the end node is a void node, we need to move the end of the range from
    // the void node's spacer span, to the end of the void node's content.
    if (isVoid) {
      var _r = range.cloneRange();
      var node = (0, _findDomNode2.default)(isVoidBlock ? endBlock : endInline);
      _r.setEndAfter(node);
      contents = _r.cloneContents();
      attach = contents.childNodes[contents.childNodes.length - 1].firstChild;
    }

    // Remove any zero-width space spans from the cloned DOM so that they don't
    // show up elsewhere when pasted.
    var zws = [].slice.call(contents.querySelectorAll('[data-slate-zero-width]'));
    zws.forEach(function (zw) {
      return zw.parentNode.removeChild(zw);
    });

    // COMPAT: In Chrome and Safari, if the last element in the selection to
    // copy has `contenteditable="false"` the copy will fail, and nothing will
    // be put in the clipboard. So we remove them all. (2017/05/04)
    if (_environment.IS_CHROME || _environment.IS_SAFARI) {
      var els = [].slice.call(contents.querySelectorAll('[contenteditable="false"]'));
      els.forEach(function (el) {
        return el.removeAttribute('contenteditable');
      });
    }

    // Set a `data-slate-fragment` attribute on a non-empty node, so it shows up
    // in the HTML, and can be used for intra-Slate pasting. If it's a text
    // node, wrap it in a `<span>` so we have something to set an attribute on.
    if (attach.nodeType == 3) {
      var span = window.document.createElement('span');
      span.appendChild(attach);
      contents.appendChild(span);
      attach = span;
    }

    attach.setAttribute('data-slate-fragment', encoded);

    // Add the phony content to the DOM, and select it, so it will be copied.
    var body = window.document.querySelector('body');
    var div = window.document.createElement('div');
    div.setAttribute('contenteditable', true);
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.appendChild(contents);
    body.appendChild(div);

    // COMPAT: In Firefox, trying to use the terser `native.selectAllChildren`
    // throws an error, so we use the older `range` equivalent. (2016/06/21)
    var r = window.document.createRange();
    r.selectNodeContents(div);
    native.removeAllRanges();
    native.addRange(r);

    // Revert to the previous selection right after copying.
    window.requestAnimationFrame(function () {
      body.removeChild(div);
      native.removeAllRanges();
      native.addRange(range);
    });
  }

  /**
   * On drop.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDrop(e, data, state) {
    debug('onDrop', { data: data });

    switch (data.type) {
      case 'text':
      case 'html':
        return onDropText(e, data, state);
      case 'fragment':
        return onDropFragment(e, data, state);
      case 'node':
        return onDropNode(e, data, state);
    }
  }

  /**
   * On drop node, insert the node wherever it is dropped.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropNode(e, data, state) {
    debug('onDropNode', { data: data });

    var selection = state.selection;
    var node = data.node,
        target = data.target,
        isInternal = data.isInternal;

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.

    if (isInternal && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.move(selection.startKey == selection.endKey ? 0 - selection.endOffset - selection.startOffset : 0 - selection.endOffset);
    }

    var transform = state.transform();

    if (isInternal) transform.delete();

    return transform.select(target).insertBlock(node).removeNodeByKey(node.key).apply();
  }

  /**
   * On drop fragment.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropFragment(e, data, state) {
    debug('onDropFragment', { data: data });

    var selection = state.selection;
    var fragment = data.fragment,
        target = data.target,
        isInternal = data.isInternal;

    // If the drag is internal and the target is after the selection, it
    // needs to account for the selection's content being deleted.

    if (isInternal && selection.endKey == target.endKey && selection.endOffset < target.endOffset) {
      target = target.move(selection.startKey == selection.endKey ? 0 - selection.endOffset - selection.startOffset : 0 - selection.endOffset);
    }

    var transform = state.transform();

    if (isInternal) transform.delete();

    return transform.select(target).insertFragment(fragment).apply();
  }

  /**
   * On drop text, split the blocks at new lines.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onDropText(e, data, state) {
    debug('onDropText', { data: data });

    var text = data.text,
        target = data.target;
    var document = state.document;

    var transform = state.transform().select(target);

    var hasVoidParent = document.hasVoidParent(target.anchorKey);

    // Insert text into nearest text node
    if (hasVoidParent) {
      var node = document.getNode(target.anchorKey);

      while (hasVoidParent) {
        node = document.getNextText(node.key);
        if (!node) break;
        hasVoidParent = document.hasVoidParent(node.key);
      }

      if (node) transform.collapseToStartOf(node);
    }

    text.split('\n').forEach(function (line, i) {
      if (i > 0) transform.splitBlock();
      transform.insertText(line);
    });

    return transform.apply();
  }

  /**
   * On key down.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDown(e, data, state) {
    debug('onKeyDown', { data: data });

    switch (data.key) {
      case 'enter':
        return onKeyDownEnter(e, data, state);
      case 'backspace':
        return onKeyDownBackspace(e, data, state);
      case 'delete':
        return onKeyDownDelete(e, data, state);
      case 'left':
        return onKeyDownLeft(e, data, state);
      case 'right':
        return onKeyDownRight(e, data, state);
      case 'up':
        return onKeyDownUp(e, data, state);
      case 'down':
        return onKeyDownDown(e, data, state);
      case 'd':
        return onKeyDownD(e, data, state);
      case 'h':
        return onKeyDownH(e, data, state);
      case 'k':
        return onKeyDownK(e, data, state);
      case 'y':
        return onKeyDownY(e, data, state);
      case 'z':
        return onKeyDownZ(e, data, state);
    }
  }

  /**
   * On `enter` key down, split the current block in half.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownEnter(e, data, state) {
    var document = state.document,
        startKey = state.startKey;

    var hasVoidParent = document.hasVoidParent(startKey);

    // For void nodes, we don't want to split. Instead we just move to the start
    // of the next text node if one exists.
    if (hasVoidParent) {
      var text = document.getNextText(startKey);
      if (!text) return;
      return state.transform().collapseToStartOf(text).apply();
    }

    return state.transform().splitBlock().apply();
  }

  /**
   * On `backspace` key down, delete backwards.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownBackspace(e, data, state) {
    var boundary = 'Char';
    if (data.isWord) boundary = 'Word';
    if (data.isLine) boundary = 'Line';

    return state.transform()['delete' + boundary + 'Backward']().apply();
  }

  /**
   * On `delete` key down, delete forwards.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownDelete(e, data, state) {
    var boundary = 'Char';
    if (data.isWord) boundary = 'Word';
    if (data.isLine) boundary = 'Line';

    return state.transform()['delete' + boundary + 'Forward']().apply();
  }

  /**
   * On `left` key down, move backward.
   *
   * COMPAT: This is required to make navigating with the left arrow work when
   * a void node is selected.
   *
   * COMPAT: This is also required to solve for the case where an inline node is
   * surrounded by empty text nodes with zero-width spaces in them. Without this
   * the zero-width spaces will cause two arrow keys to jump to the next text.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownLeft(e, data, state) {
    if (data.isCtrl) return;
    if (data.isAlt) return;
    if (state.isExpanded) return;

    var document = state.document,
        startKey = state.startKey,
        startText = state.startText;

    var hasVoidParent = document.hasVoidParent(startKey);

    // If the current text node is empty, or we're inside a void parent, we're
    // going to need to handle the selection behavior.
    if (startText.text == '' || hasVoidParent) {
      e.preventDefault();
      var previous = document.getPreviousText(startKey);

      // If there's no previous text node in the document, abort.
      if (!previous) return;

      // If the previous text is in the current block, and inside a non-void
      // inline node, move one character into the inline node.
      var startBlock = state.startBlock;

      var previousBlock = document.getClosestBlock(previous.key);
      var previousInline = document.getClosestInline(previous.key);

      if (previousBlock === startBlock && previousInline && !previousInline.isVoid) {
        var extendOrMove = data.isShift ? 'extend' : 'move';
        return state.transform().collapseToEndOf(previous)[extendOrMove](-1).apply();
      }

      // Otherwise, move to the end of the previous node.
      return state.transform().collapseToEndOf(previous).apply();
    }
  }

  /**
   * On `right` key down, move forward.
   *
   * COMPAT: This is required to make navigating with the right arrow work when
   * a void node is selected.
   *
   * COMPAT: This is also required to solve for the case where an inline node is
   * surrounded by empty text nodes with zero-width spaces in them. Without this
   * the zero-width spaces will cause two arrow keys to jump to the next text.
   *
   * COMPAT: In Chrome & Safari, selections that are at the zero offset of
   * an inline node will be automatically replaced to be at the last offset
   * of a previous inline node, which screws us up, so we never want to set the
   * selection to the very start of an inline node here. (2016/11/29)
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownRight(e, data, state) {
    if (data.isCtrl) return;
    if (data.isAlt) return;
    if (state.isExpanded) return;

    var document = state.document,
        startKey = state.startKey,
        startText = state.startText;

    var hasVoidParent = document.hasVoidParent(startKey);

    // If the current text node is empty, or we're inside a void parent, we're
    // going to need to handle the selection behavior.
    if (startText.text == '' || hasVoidParent) {
      e.preventDefault();
      var next = document.getNextText(startKey);

      // If there's no next text node in the document, abort.
      if (!next) return state;

      // If the next text is inside a void node, move to the end of it.
      var isInVoid = document.hasVoidParent(next.key);

      if (isInVoid) {
        return state.transform().collapseToEndOf(next).apply();
      }

      // If the next text is in the current block, and inside an inline node,
      // move one character into the inline node.
      var startBlock = state.startBlock;

      var nextBlock = document.getClosestBlock(next.key);
      var nextInline = document.getClosestInline(next.key);

      if (nextBlock == startBlock && nextInline) {
        var extendOrMove = data.isShift ? 'extend' : 'move';
        return state.transform().collapseToStartOf(next)[extendOrMove](1).apply();
      }

      // Otherwise, move to the start of the next text node.
      return state.transform().collapseToStartOf(next).apply();
    }
  }

  /**
   * On `up` key down, for Macs, move the selection to start of the block.
   *
   * COMPAT: Certain browsers don't handle the selection updates properly. In
   * Chrome, option-shift-up doesn't properly extend the selection. And in
   * Firefox, option-up doesn't properly move the selection.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownUp(e, data, state) {
    if (!_environment.IS_MAC || data.isCtrl || !data.isAlt) return;

    var transform = data.isShift ? 'extendToStartOf' : 'collapseToStartOf';
    var selection = state.selection,
        document = state.document,
        focusKey = state.focusKey,
        focusBlock = state.focusBlock;

    var block = selection.hasFocusAtStartOf(focusBlock) ? document.getPreviousBlock(focusKey) : focusBlock;

    if (!block) return;
    var text = block.getFirstText();

    e.preventDefault();
    return state.transform()[transform](text).apply();
  }

  /**
   * On `down` key down, for Macs, move the selection to end of the block.
   *
   * COMPAT: Certain browsers don't handle the selection updates properly. In
   * Chrome, option-shift-down doesn't properly extend the selection. And in
   * Firefox, option-down doesn't properly move the selection.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownDown(e, data, state) {
    if (!_environment.IS_MAC || data.isCtrl || !data.isAlt) return;

    var transform = data.isShift ? 'extendToEndOf' : 'collapseToEndOf';
    var selection = state.selection,
        document = state.document,
        focusKey = state.focusKey,
        focusBlock = state.focusBlock;

    var block = selection.hasFocusAtEndOf(focusBlock) ? document.getNextBlock(focusKey) : focusBlock;

    if (!block) return;
    var text = block.getLastText();

    e.preventDefault();
    return state.transform()[transform](text).apply();
  }

  /**
   * On `d` key down, for Macs, delete one character forward.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownD(e, data, state) {
    if (!_environment.IS_MAC || !data.isCtrl) return;
    e.preventDefault();
    return state.transform().deleteCharForward().apply();
  }

  /**
   * On `h` key down, for Macs, delete until the end of the line.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownH(e, data, state) {
    if (!_environment.IS_MAC || !data.isCtrl) return;
    e.preventDefault();
    return state.transform().deleteCharBackward().apply();
  }

  /**
   * On `k` key down, for Macs, delete until the end of the line.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownK(e, data, state) {
    if (!_environment.IS_MAC || !data.isCtrl) return;
    e.preventDefault();
    return state.transform().deleteLineForward().apply();
  }

  /**
   * On `y` key down, redo.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownY(e, data, state) {
    if (!data.isMod) return;

    return state.transform().redo().apply({ save: false });
  }

  /**
   * On `z` key down, undo or redo.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onKeyDownZ(e, data, state) {
    if (!data.isMod) return;

    return state.transform()[data.isShift ? 'redo' : 'undo']().apply({ save: false });
  }

  /**
   * On paste.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPaste(e, data, state) {
    debug('onPaste', { data: data });

    switch (data.type) {
      case 'fragment':
        return onPasteFragment(e, data, state);
      case 'text':
      case 'html':
        return onPasteText(e, data, state);
    }
  }

  /**
   * On paste fragment.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPasteFragment(e, data, state) {
    debug('onPasteFragment', { data: data });

    return state.transform().insertFragment(data.fragment).apply();
  }

  /**
   * On paste text, split blocks at new lines.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onPasteText(e, data, state) {
    debug('onPasteText', { data: data });

    var transform = state.transform();

    data.text.split('\n').forEach(function (line, i) {
      if (i > 0) transform.splitBlock();
      transform.insertText(line);
    });

    return transform.apply();
  }

  /**
   * On select.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  function onSelect(e, data, state) {
    debug('onSelect', { data: data });

    return state.transform().select(data.selection).apply();
  }

  /**
   * Render.
   *
   * @param {Object} props
   * @param {State} state
   * @param {Editor} editor
   * @return {Object}
   */

  function render(props, state, editor) {
    return _react2.default.createElement(_content2.default, {
      autoCorrect: props.autoCorrect,
      autoFocus: props.autoFocus,
      className: props.className,
      children: props.children,
      editor: editor,
      onBeforeInput: editor.onBeforeInput,
      onBlur: editor.onBlur,
      onFocus: editor.onFocus,
      onChange: editor.onChange,
      onCopy: editor.onCopy,
      onCut: editor.onCut,
      onDrop: editor.onDrop,
      onKeyDown: editor.onKeyDown,
      onPaste: editor.onPaste,
      onSelect: editor.onSelect,
      readOnly: props.readOnly,
      role: props.role,
      schema: editor.getSchema(),
      spellCheck: props.spellCheck,
      state: state,
      style: props.style,
      tabIndex: props.tabIndex
    });
  }

  /**
   * A default schema rule to render block nodes.
   *
   * @type {Object}
   */

  var BLOCK_RENDER_RULE = {
    match: function match(node) {
      return node.kind == 'block';
    },
    render: function render(props) {
      return _react2.default.createElement(
        'div',
        _extends({}, props.attributes, { style: { position: 'relative' } }),
        props.children,
        placeholder ? _react2.default.createElement(
          _placeholder2.default,
          {
            className: placeholderClassName,
            node: props.node,
            parent: props.state.document,
            state: props.state,
            style: placeholderStyle
          },
          placeholder
        ) : null
      );
    }
  };

  /**
   * A default schema rule to render inline nodes.
   *
   * @type {Object}
   */

  var INLINE_RENDER_RULE = {
    match: function match(node) {
      return node.kind == 'inline';
    },
    render: function render(props) {
      return _react2.default.createElement(
        'span',
        _extends({}, props.attributes, { style: { position: 'relative' } }),
        props.children
      );
    }
  };

  /**
   * Add default rendering rules to the schema.
   *
   * @type {Object}
   */

  var schema = {
    rules: [BLOCK_RENDER_RULE, INLINE_RENDER_RULE]
  };

  /**
   * Return the core plugin.
   *
   * @type {Object}
   */

  return {
    onBeforeChange: onBeforeChange,
    onBeforeInput: onBeforeInput,
    onBlur: onBlur,
    onCopy: onCopy,
    onCut: onCut,
    onDrop: onDrop,
    onKeyDown: onKeyDown,
    onPaste: onPaste,
    onSelect: onSelect,
    render: render,
    schema: schema
  };
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Plugin;

},{"../components/content":77,"../components/placeholder":81,"../constants/environment":83,"../models/character":88,"../serializers/base-64":103,"../utils/find-dom-node":120,"../utils/get-point":122,"debug":3,"get-window":62}],102:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Options object with normalize set to `false`.
 *
 * @type {Object}
 */

var OPTS = { normalize: false };

/**
 * Define the core schema rules, order-sensitive.
 *
 * @type {Array}
 */

var rules = [

/**
 * Only allow block nodes in documents.
 *
 * @type {Object}
 */

{
  match: function match(node) {
    return node.kind == 'document';
  },
  validate: function validate(document) {
    var invalids = document.nodes.filter(function (n) {
      return n.kind != 'block';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, document, invalids) {
    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Only allow block, inline and text nodes in blocks.
 *
 * @type {Object}
 */

{
  match: function match(node) {
    return node.kind == 'block';
  },
  validate: function validate(block) {
    var invalids = block.nodes.filter(function (n) {
      return n.kind != 'block' && n.kind != 'inline' && n.kind != 'text';
    });

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Only allow inline and text nodes in inlines.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'inline';
  },
  validate: function validate(inline) {
    var invalids = inline.nodes.filter(function (n) {
      return n.kind != 'inline' && n.kind != 'text';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, inline, invalids) {
    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Ensure that block and inline nodes have at least one text child.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    return node.nodes.size == 0;
  },
  normalize: function normalize(transform, node) {
    var text = _text2.default.create();
    transform.insertNodeByKey(node.key, 0, text, OPTS);
  }
},

/**
 * Ensure that void nodes contain a text node with a single space of text.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return (object.kind == 'inline' || object.kind == 'block') && object.isVoid;
  },
  validate: function validate(node) {
    return node.text !== ' ' || node.nodes.size !== 1;
  },
  normalize: function normalize(transform, node, result) {
    var text = _text2.default.createFromString(' ');
    var index = node.nodes.size;

    transform.insertNodeByKey(node.key, index, text, OPTS);

    node.nodes.forEach(function (child) {
      transform.removeNodeByKey(child.key, OPTS);
    });
  }
},

/**
 * Ensure that inline nodes are never empty.
 *
 * This rule is applied to all blocks, because when they contain an empty
 * inline, we need to remove the inline from that parent block. If `validate`
 * was to be memoized, it should be against the parent node, not the inline
 * themselves.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block';
  },
  validate: function validate(block) {
    var invalids = block.nodes.filter(function (n) {
      return n.kind == 'inline' && n.text == '';
    });
    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    // If all of the block's nodes are invalid, insert an empty text node so
    // that the selection will be preserved when they are all removed.
    if (block.nodes.size == invalids.size) {
      var text = _text2.default.create();
      transform.insertNodeByKey(block.key, 1, text, OPTS);
    }

    invalids.forEach(function (node) {
      transform.removeNodeByKey(node.key, OPTS);
    });
  }
},

/**
 * Ensure that inline void nodes are surrounded by text nodes, by adding extra
 * blank text nodes if necessary.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var invalids = node.nodes.reduce(function (list, child, index) {
      if (child.kind !== 'inline') return list;

      var prev = index > 0 ? node.nodes.get(index - 1) : null;
      var next = node.nodes.get(index + 1);
      // We don't test if "prev" is inline, since it has already been processed in the loop
      var insertBefore = !prev;
      var insertAfter = !next || next.kind == 'inline';

      if (insertAfter || insertBefore) {
        list = list.push({ insertAfter: insertAfter, insertBefore: insertBefore, index: index });
      }

      return list;
    }, new _immutable.List());

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, block, invalids) {
    // Shift for every text node inserted previously.
    var shift = 0;

    invalids.forEach(function (_ref) {
      var index = _ref.index,
          insertAfter = _ref.insertAfter,
          insertBefore = _ref.insertBefore;

      if (insertBefore) {
        transform.insertNodeByKey(block.key, shift + index, _text2.default.create(), OPTS);
        shift++;
      }

      if (insertAfter) {
        transform.insertNodeByKey(block.key, shift + index + 1, _text2.default.create(), OPTS);
        shift++;
      }
    });
  }
},

/**
 * Join adjacent text nodes.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var invalids = node.nodes.map(function (child, i) {
      var next = node.nodes.get(i + 1);
      if (child.kind != 'text') return;
      if (!next || next.kind != 'text') return;
      return [child, next];
    }).filter(Boolean);

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, node, pairs) {
    // We reverse the list to handle consecutive joins, since the earlier nodes
    // will always exist after each join.
    pairs.reverse().forEach(function (pair) {
      var _pair = _slicedToArray(pair, 2),
          first = _pair[0],
          second = _pair[1];

      return transform.joinNodeByKey(second.key, first.key, OPTS);
    });
  }
},

/**
 * Prevent extra empty text nodes, except when adjacent to inline void nodes.
 *
 * @type {Object}
 */

{
  match: function match(object) {
    return object.kind == 'block' || object.kind == 'inline';
  },
  validate: function validate(node) {
    var nodes = node.nodes;

    if (nodes.size <= 1) return;

    var invalids = nodes.filter(function (desc, i) {
      if (desc.kind != 'text') return;
      if (desc.length > 0) return;

      var prev = i > 0 ? nodes.get(i - 1) : null;
      var next = nodes.get(i + 1);

      // If it's the first node, and the next is a void, preserve it.
      if (!prev && next.kind == 'inline') return;

      // It it's the last node, and the previous is an inline, preserve it.
      if (!next && prev.kind == 'inline') return;

      // If it's surrounded by inlines, preserve it.
      if (next && prev && next.kind == 'inline' && prev.kind == 'inline') return;

      // Otherwise, remove it.
      return true;
    });

    return invalids.size ? invalids : null;
  },
  normalize: function normalize(transform, node, invalids) {
    invalids.forEach(function (text) {
      transform.removeNodeByKey(text.key, OPTS);
    });
  }
}];

/**
 * Create the core schema.
 *
 * @type {Schema}
 */

var SCHEMA = _schema2.default.create({ rules: rules });

/**
 * Export.
 *
 * @type {Schema}
 */

exports.default = SCHEMA;

},{"../models/schema":95,"../models/text":99}],103:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _raw = require('./raw');

var _raw2 = _interopRequireDefault(_raw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Encode a JSON `object` as base-64 `string`.
 *
 * @param {Object} object
 * @return {String}
 */

function encode(object) {
  var string = JSON.stringify(object);
  var encoded = window.btoa(window.encodeURIComponent(string));
  return encoded;
}

/**
 * Decode a base-64 `string` to a JSON `object`.
 *
 * @param {String} string
 * @return {Object}
 */

function decode(string) {
  var decoded = window.decodeURIComponent(window.atob(string));
  var object = JSON.parse(decoded);
  return object;
}

/**
 * Deserialize a State `string`.
 *
 * @param {String} string
 * @return {State}
 */

function deserialize(string, options) {
  var raw = decode(string);
  var state = _raw2.default.deserialize(raw, options);
  return state;
}

/**
 * Deserialize a Node `string`.
 *
 * @param {String} string
 * @return {Node}
 */

function deserializeNode(string, options) {
  var raw = decode(string);
  var node = _raw2.default.deserializeNode(raw, options);
  return node;
}

/**
 * Serialize a `state`.
 *
 * @param {State} state
 * @return {String}
 */

function serialize(state, options) {
  var raw = _raw2.default.serialize(state, options);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String}
 */

function serializeNode(node, options) {
  var raw = _raw2.default.serializeNode(node, options);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  deserialize: deserialize,
  deserializeNode: deserializeNode,
  serialize: serialize,
  serializeNode: serializeNode
};

},{"./raw":106}],104:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _raw = require('./raw');

var _raw2 = _interopRequireDefault(_raw);

var _react = (window.React);

var _react2 = _interopRequireDefault(_react);

var _server = (window.ReactDOMServer);

var _server2 = _interopRequireDefault(_server);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * String.
 *
 * @type {String}
 */

var String = new _immutable.Record({
  kind: 'string',
  text: ''
});

/**
 * A rule to (de)serialize text nodes. This is automatically added to the HTML
 * serializer so that users don't have to worry about text-level serialization.
 *
 * @type {Object}
 */

var TEXT_RULE = {
  deserialize: function deserialize(el) {
    if (el.tagName == 'br') {
      return {
        kind: 'text',
        text: '\n'
      };
    }

    if (el.nodeName == '#text') {
      if (el.value && el.value.match(/<!--.*?-->/)) return;

      return {
        kind: 'text',
        text: el.value
      };
    }
  },
  serialize: function serialize(obj, children) {
    if (obj.kind == 'string') {
      return children.split('\n').reduce(function (array, text, i) {
        if (i != 0) array.push(_react2.default.createElement('br', null));
        array.push(text);
        return array;
      }, []);
    }
  }
};

/**
 * HTML serializer.
 *
 * @type {Html}
 */

var Html =

/**
 * Create a new serializer with `rules`.
 *
 * @param {Object} options
 *   @property {Array} rules
 *   @property {String|Object} defaultBlockType
 *   @property {Function} parseHtml
 */

function Html() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Html);

  _initialiseProps.call(this);

  this.rules = [].concat(_toConsumableArray(options.rules || []), [TEXT_RULE]);

  this.defaultBlockType = options.defaultBlockType || 'paragraph';

  // Set DOM parser function or fallback to native DOMParser if present.
  if (options.parseHtml !== null) {
    this.parseHtml = options.parseHtml;
  } else if (typeof DOMParser !== 'undefined') {
    this.parseHtml = function (html) {
      return new DOMParser().parseFromString(html, 'application/xml');
    };
  } else {
    throw new Error('Native DOMParser is not present in this environment; you must supply a parse function via options.parseHtml');
  }
}

/**
 * Deserialize pasted HTML.
 *
 * @param {String} html
 * @param {Object} options
 *   @property {Boolean} toRaw
 * @return {State}
 */

/**
 * Deserialize an array of DOM elements.
 *
 * @param {Array} elements
 * @return {Array}
 */

/**
 * Deserialize a DOM element.
 *
 * @param {Object} element
 * @return {Any}
 */

/**
 * Deserialize a `mark` object.
 *
 * @param {Object} mark
 * @return {Array}
 */

/**
 * Serialize a `state` object into an HTML string.
 *
 * @param {State} state
 * @param {Object} options
 *   @property {Boolean} render
 * @return {String|Array}
 */

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String}
 */

/**
 * Serialize a `range`.
 *
 * @param {Range} range
 * @return {String}
 */

/**
 * Serialize a `string`.
 *
 * @param {String} string
 * @return {String}
 */

/**
 * Filter out cruft newline nodes inserted by the DOM parser.
 *
 * @param {Object} element
 * @return {Boolean}
 */

;

/**
 * Add a unique key to a React `element`.
 *
 * @param {Element} element
 * @return {Element}
 */

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.deserialize = function (html) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var children = _this.parseHtml(html).childNodes;
    var nodes = _this.deserializeElements(children);

    var defaultBlockType = _this.defaultBlockType;

    var defaults = typeof defaultBlockType == 'string' ? { type: defaultBlockType } : defaultBlockType;

    // HACK: ensure for now that all top-level inline are wrapped into a block.
    nodes = nodes.reduce(function (memo, node, i, original) {
      if (node.kind == 'block') {
        memo.push(node);
        return memo;
      }

      if (i > 0 && original[i - 1].kind != 'block') {
        var _block = memo[memo.length - 1];
        _block.nodes.push(node);
        return memo;
      }

      var block = _extends({
        kind: 'block',
        nodes: [node]
      }, defaults);

      memo.push(block);
      return memo;
    }, []);

    if (nodes.length === 0) {
      nodes = [_extends({
        kind: 'block',
        nodes: []
      }, defaults)];
    }

    var raw = {
      kind: 'state',
      document: {
        kind: 'document',
        nodes: nodes
      }
    };

    if (options.toRaw) {
      return raw;
    }

    var state = _raw2.default.deserialize(raw, { terse: true });
    return state;
  };

  this.deserializeElements = function () {
    var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var nodes = [];

    elements.filter(_this.cruftNewline).forEach(function (element) {
      var node = _this.deserializeElement(element);
      switch ((0, _typeOf2.default)(node)) {
        case 'array':
          nodes = nodes.concat(node);
          break;
        case 'object':
          nodes.push(node);
          break;
      }
    });

    return nodes;
  };

  this.deserializeElement = function (element) {
    var node = void 0;

    var next = function next(elements) {
      switch ((0, _typeOf2.default)(elements)) {
        case 'array':
          return _this.deserializeElements(elements);
        case 'object':
          return _this.deserializeElement(elements);
        case 'null':
        case 'undefined':
          return;
        default:
          throw new Error('The `next` argument was called with invalid children: "' + elements + '".');
      }
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _this.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var rule = _step.value;

        if (!rule.deserialize) continue;
        var ret = rule.deserialize(element, next);
        var type = (0, _typeOf2.default)(ret);

        if (type != 'array' && type != 'object' && type != 'null' && type != 'undefined') {
          throw new Error('A rule returned an invalid deserialized representation: "' + node + '".');
        }

        if (ret === undefined) continue;
        if (ret === null) return null;

        node = ret.kind == 'mark' ? _this.deserializeMark(ret) : ret;
        break;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return node || next(element.childNodes);
  };

  this.deserializeMark = function (mark) {
    var type = mark.type,
        value = mark.value;


    var applyMark = function applyMark(node) {
      if (node.kind == 'mark') {
        return _this.deserializeMark(node);
      } else if (node.kind == 'text') {
        if (!node.ranges) node.ranges = [{ text: node.text }];
        node.ranges = node.ranges.map(function (range) {
          range.marks = range.marks || [];
          range.marks.push({ type: type, value: value });
          return range;
        });
      } else {
        node.nodes = node.nodes.map(applyMark);
      }

      return node;
    };

    return mark.nodes.reduce(function (nodes, node) {
      var ret = applyMark(node);
      if (Array.isArray(ret)) return nodes.concat(ret);
      nodes.push(ret);
      return nodes;
    }, []);
  };

  this.serialize = function (state) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var document = state.document;

    var elements = document.nodes.map(_this.serializeNode);
    if (options.render === false) return elements;

    var html = _server2.default.renderToStaticMarkup(_react2.default.createElement(
      'body',
      null,
      elements
    ));
    var inner = html.slice(6, -7);
    return inner;
  };

  this.serializeNode = function (node) {
    if (node.kind == 'text') {
      var ranges = node.getRanges();
      return ranges.map(_this.serializeRange);
    }

    var children = node.nodes.map(_this.serializeNode);

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _this.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var rule = _step2.value;

        if (!rule.serialize) continue;
        var ret = rule.serialize(node, children);
        if (ret) return addKey(ret);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    throw new Error('No serializer defined for node of type "' + node.type + '".');
  };

  this.serializeRange = function (range) {
    var string = new String({ text: range.text });
    var text = _this.serializeString(string);

    return range.marks.reduce(function (children, mark) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var rule = _step3.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(mark, children);
          if (ret) return addKey(ret);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      throw new Error('No serializer defined for mark of type "' + mark.type + '".');
    }, text);
  };

  this.serializeString = function (string) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = _this.rules[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var rule = _step4.value;

        if (!rule.serialize) continue;
        var ret = rule.serialize(string, string.text);
        if (ret) return ret;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  };

  this.cruftNewline = function (element) {
    return !(element.nodeName == '#text' && element.value == '\n');
  };
};

var key = 0;

function addKey(element) {
  return _react2.default.cloneElement(element, { key: key++ });
}

/**
 * Export.
 *
 * @type {Html}
 */

exports.default = Html;

},{"./raw":106,"type-of":76}],105:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _raw = require('../serializers/raw');

var _raw2 = _interopRequireDefault(_raw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Deserialize a plain text `string` to a state.
 *
 * @param {String} string
 * @param {Object} options
 *   @property {Boolean} toRaw
 * @return {State}
 */

function deserialize(string) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var raw = {
    kind: 'state',
    document: {
      kind: 'document',
      nodes: string.split('\n').map(function (line) {
        return {
          kind: 'block',
          type: 'line',
          nodes: [{
            kind: 'text',
            ranges: [{
              text: line,
              marks: []
            }]
          }]
        };
      })
    }
  };

  return options.toRaw ? raw : _raw2.default.deserialize(raw);
}

/**
 * Serialize a `state` to plain text.
 *
 * @param {State} state
 * @return {String}
 */

function serialize(state) {
  return state.document.nodes.map(function (block) {
    return block.text;
  }).join('\n');
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  deserialize: deserialize,
  serialize: serialize
};

},{"../serializers/raw":106}],106:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _character = require('../models/character');

var _character2 = _interopRequireDefault(_character);

var _document = require('../models/document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _state = require('../models/state');

var _state2 = _interopRequireDefault(_state);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Raw.
 *
 * @type {Object}
 */

var Raw = {

  /**
   * Deserialize a JSON `object`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Block}
   */

  deserialize: function deserialize(object, options) {
    return Raw.deserializeState(object, options);
  },


  /**
   * Deserialize a JSON `object` representing a `Block`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Block}
   */

  deserializeBlock: function deserializeBlock(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyBlock(object);

    return _block2.default.create({
      key: object.key,
      type: object.type,
      data: object.data,
      isVoid: object.isVoid,
      nodes: _block2.default.createList(object.nodes.map(function (node) {
        return Raw.deserializeNode(node, options);
      }))
    });
  },


  /**
   * Deserialize a JSON `object` representing a `Document`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Document}
   */

  deserializeDocument: function deserializeDocument(object, options) {
    return _document2.default.create({
      key: object.key,
      data: object.data,
      nodes: _block2.default.createList(object.nodes.map(function (node) {
        return Raw.deserializeNode(node, options);
      }))
    });
  },


  /**
   * Deserialize a JSON `object` representing an `Inline`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Inline}
   */

  deserializeInline: function deserializeInline(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyInline(object);

    return _inline2.default.create({
      key: object.key,
      type: object.type,
      data: object.data,
      isVoid: object.isVoid,
      nodes: _inline2.default.createList(object.nodes.map(function (node) {
        return Raw.deserializeNode(node, options);
      }))
    });
  },


  /**
   * Deserialize a JSON `object` representing a `Mark`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Mark}
   */

  deserializeMark: function deserializeMark(object, options) {
    return _mark2.default.create(object);
  },


  /**
   * Deserialize a JSON object representing a `Node`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Node}
   */

  deserializeNode: function deserializeNode(object, options) {
    switch (object.kind) {
      case 'block':
        return Raw.deserializeBlock(object, options);
      case 'document':
        return Raw.deserializeDocument(object, options);
      case 'inline':
        return Raw.deserializeInline(object, options);
      case 'text':
        return Raw.deserializeText(object, options);
      default:
        {
          throw new Error('Unrecognized node kind "' + object.kind + '".');
        }
    }
  },


  /**
   * Deserialize a JSON `object` representing a `Range`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {List<Character>}
   */

  deserializeRange: function deserializeRange(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyRange(object);

    var marks = _mark2.default.createSet(object.marks.map(function (mark) {
      return Raw.deserializeMark(mark, options);
    }));

    return _character2.default.createList(object.text.split('').map(function (char) {
      return _character2.default.create({
        text: char,
        marks: marks
      });
    }));
  },


  /**
   * Deserialize a JSON `object` representing a `Selection`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {State}
   */

  deserializeSelection: function deserializeSelection(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return _selection2.default.create({
      anchorKey: object.anchorKey,
      anchorOffset: object.anchorOffset,
      focusKey: object.focusKey,
      focusOffset: object.focusOffset,
      isFocused: object.isFocused
    });
  },


  /**
   * Deserialize a JSON `object` representing a `State`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {State}
   */

  deserializeState: function deserializeState(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyState(object);

    var document = Raw.deserializeDocument(object.document, options);
    var selection = void 0;

    if (object.selection != null) {
      selection = Raw.deserializeSelection(object.selection, options);
    }

    return _state2.default.create({ data: object.data, document: document, selection: selection }, options);
  },


  /**
   * Deserialize a JSON `object` representing a `Text`.
   *
   * @param {Object} object
   * @param {Object} options (optional)
   * @return {Text}
   */

  deserializeText: function deserializeText(object) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.terse) object = Raw.untersifyText(object);

    return _text2.default.create({
      key: object.key,
      characters: object.ranges.reduce(function (characters, range) {
        return characters.concat(Raw.deserializeRange(range, options));
      }, _character2.default.createList())
    });
  },


  /**
   * Serialize a `model`.
   *
   * @param {Mixed} model
   * @param {Object} options (optional)
   * @return {Object}
   */

  serialize: function serialize(model, options) {
    return Raw.serializeState(model, options);
  },


  /**
   * Serialize a `block` node.
   *
   * @param {Block} block
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeBlock: function serializeBlock(block) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: block.data.toJSON(),
      key: block.key,
      kind: block.kind,
      isVoid: block.isVoid,
      type: block.type,
      nodes: block.nodes.toArray().map(function (node) {
        return Raw.serializeNode(node, options);
      })
    };

    if (!options.preserveKeys) {
      delete object.key;
    }

    return options.terse ? Raw.tersifyBlock(object) : object;
  },


  /**
   * Serialize a `document`.
   *
   * @param {Document} document
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeDocument: function serializeDocument(document) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: document.data.toJSON(),
      key: document.key,
      kind: document.kind,
      nodes: document.nodes.toArray().map(function (node) {
        return Raw.serializeNode(node, options);
      })
    };

    if (!options.preserveKeys) {
      delete object.key;
    }

    return options.terse ? Raw.tersifyDocument(object) : object;
  },


  /**
   * Serialize an `inline` node.
   *
   * @param {Inline} inline
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeInline: function serializeInline(inline) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: inline.data.toJSON(),
      key: inline.key,
      kind: inline.kind,
      isVoid: inline.isVoid,
      type: inline.type,
      nodes: inline.nodes.toArray().map(function (node) {
        return Raw.serializeNode(node, options);
      })
    };

    if (!options.preserveKeys) {
      delete object.key;
    }

    return options.terse ? Raw.tersifyInline(object) : object;
  },


  /**
   * Serialize a `mark`.
   *
   * @param {Mark} mark
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeMark: function serializeMark(mark) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      data: mark.data.toJSON(),
      kind: mark.kind,
      type: mark.type
    };

    return options.terse ? Raw.tersifyMark(object) : object;
  },


  /**
   * Serialize a `node`.
   *
   * @param {Node} node
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeNode: function serializeNode(node, options) {
    switch (node.kind) {
      case 'block':
        return Raw.serializeBlock(node, options);
      case 'document':
        return Raw.serializeDocument(node, options);
      case 'inline':
        return Raw.serializeInline(node, options);
      case 'text':
        return Raw.serializeText(node, options);
      default:
        {
          throw new Error('Unrecognized node kind "' + node.kind + '".');
        }
    }
  },


  /**
   * Serialize a `range`.
   *
   * @param {Range} range
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeRange: function serializeRange(range) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      kind: range.kind,
      text: range.text,
      marks: range.marks.toArray().map(function (mark) {
        return Raw.serializeMark(mark, options);
      })
    };

    return options.terse ? Raw.tersifyRange(object) : object;
  },


  /**
   * Serialize a `selection`.
   *
   * @param {Selection} selection
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeSelection: function serializeSelection(selection) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      kind: selection.kind,
      anchorKey: selection.anchorKey,
      anchorOffset: selection.anchorOffset,
      focusKey: selection.focusKey,
      focusOffset: selection.focusOffset,
      isBackward: selection.isBackward,
      isFocused: selection.isFocused
    };

    return options.terse ? Raw.tersifySelection(object) : object;
  },


  /**
   * Serialize a `state`.
   *
   * @param {State} state
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeState: function serializeState(state) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      document: Raw.serializeDocument(state.document, options),
      kind: state.kind
    };

    if (options.preserveSelection) {
      object.selection = Raw.serializeSelection(state.selection, options);
    }

    if (options.preserveStateData) {
      object.data = state.data.toJSON();
    }

    var ret = options.terse ? Raw.tersifyState(object) : object;

    return ret;
  },


  /**
   * Serialize a `text` node.
   *
   * @param {Text} text
   * @param {Object} options (optional)
   * @return {Object}
   */

  serializeText: function serializeText(text) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var object = {
      key: text.key,
      kind: text.kind,
      ranges: text.getRanges().toArray().map(function (range) {
        return Raw.serializeRange(range, options);
      })
    };

    if (!options.preserveKeys) {
      delete object.key;
    }

    return options.terse ? Raw.tersifyText(object) : object;
  },


  /**
   * Create a terse representation of a block `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyBlock: function tersifyBlock(object) {
    var ret = {};
    ret.kind = object.kind;
    ret.type = object.type;
    if (object.key) ret.key = object.key;
    if (!object.isVoid) ret.nodes = object.nodes;
    if (object.isVoid) ret.isVoid = object.isVoid;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a document `object.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyDocument: function tersifyDocument(object) {
    var ret = {};
    ret.nodes = object.nodes;
    if (object.key) ret.key = object.key;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a inline `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyInline: function tersifyInline(object) {
    var ret = {};
    ret.kind = object.kind;
    ret.type = object.type;
    if (object.key) ret.key = object.key;
    if (!object.isVoid) ret.nodes = object.nodes;
    if (object.isVoid) ret.isVoid = object.isVoid;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a mark `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyMark: function tersifyMark(object) {
    var ret = {};
    ret.type = object.type;
    if (!(0, _isEmpty2.default)(object.data)) ret.data = object.data;
    return ret;
  },


  /**
   * Create a terse representation of a range `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyRange: function tersifyRange(object) {
    var ret = {};
    ret.text = object.text;
    if (!(0, _isEmpty2.default)(object.marks)) ret.marks = object.marks;
    return ret;
  },


  /**
   * Create a terse representation of a selection `object.`
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifySelection: function tersifySelection(object) {
    return {
      anchorKey: object.anchorKey,
      anchorOffset: object.anchorOffset,
      focusKey: object.focusKey,
      focusOffset: object.focusOffset,
      isFocused: object.isFocused
    };
  },


  /**
   * Create a terse representation of a state `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyState: function tersifyState(object) {
    var data = object.data,
        document = object.document,
        selection = object.selection;

    var emptyData = (0, _isEmpty2.default)(data);

    if (!selection && emptyData) {
      return document;
    }

    var ret = { document: document };
    if (!emptyData) ret.data = data;
    if (selection) ret.selection = selection;
    return ret;
  },


  /**
   * Create a terse representation of a text `object`.
   *
   * @param {Object} object
   * @return {Object}
   */

  tersifyText: function tersifyText(object) {
    var ret = {};
    ret.kind = object.kind;
    if (object.key) ret.key = object.key;

    if (object.ranges.length == 1 && object.ranges[0].marks == null) {
      ret.text = object.ranges[0].text;
    } else {
      ret.ranges = object.ranges;
    }

    return ret;
  },


  /**
   * Convert a terse representation of a block `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyBlock: function untersifyBlock(object) {
    if (object.isVoid || !object.nodes || !object.nodes.length) {
      return {
        key: object.key,
        data: object.data,
        kind: object.kind,
        type: object.type,
        isVoid: object.isVoid,
        nodes: [{
          kind: 'text',
          text: ''
        }]
      };
    }

    return object;
  },


  /**
   * Convert a terse representation of a inline `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyInline: function untersifyInline(object) {
    if (object.isVoid || !object.nodes || !object.nodes.length) {
      return {
        key: object.key,
        data: object.data,
        kind: object.kind,
        type: object.type,
        isVoid: object.isVoid,
        nodes: [{
          kind: 'text',
          text: ''
        }]
      };
    }

    return object;
  },


  /**
   * Convert a terse representation of a range `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyRange: function untersifyRange(object) {
    return {
      kind: 'range',
      text: object.text,
      marks: object.marks || []
    };
  },


  /**
   * Convert a terse representation of a selection `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifySelection: function untersifySelection(object) {
    return {
      kind: 'selection',
      anchorKey: object.anchorKey,
      anchorOffset: object.anchorOffset,
      focusKey: object.focusKey,
      focusOffset: object.focusOffset,
      isBackward: null,
      isFocused: false
    };
  },


  /**
   * Convert a terse representation of a state `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyState: function untersifyState(object) {
    if (object.document) {
      return {
        kind: 'state',
        data: object.data,
        document: object.document,
        selection: object.selection
      };
    }

    return {
      kind: 'state',
      document: {
        data: object.data,
        key: object.key,
        kind: 'document',
        nodes: object.nodes
      }
    };
  },


  /**
   * Convert a terse representation of a text `object` into a non-terse one.
   *
   * @param {Object} object
   * @return {Object}
   */

  untersifyText: function untersifyText(object) {
    if (object.ranges) return object;

    return {
      key: object.key,
      kind: object.kind,
      ranges: [{
        text: object.text,
        marks: object.marks || []
      }]
    };
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Raw;

},{"../models/block":87,"../models/character":88,"../models/document":90,"../models/inline":91,"../models/mark":92,"../models/selection":96,"../models/state":98,"../models/text":99,"is-empty":64}],107:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _warn = require('../utils/warn');

var _warn2 = _interopRequireDefault(_warn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:operation');

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Operations.
 *
 * @type {Object}
 */

var OPERATIONS = {
  // Text operations.
  insert_text: insertText,
  remove_text: removeText,
  // Mark operations.
  add_mark: addMark,
  remove_mark: removeMark,
  set_mark: setMark,
  // Node operations.
  insert_node: insertNode,
  join_node: joinNode,
  move_node: moveNode,
  remove_node: removeNode,
  set_node: setNode,
  split_node: splitNode,
  // Selection operations.
  set_selection: setSelection,
  // State data operations.
  set_data: setData
};

/**
 * Apply an `operation` to the current state.
 *
 * @param {Transform} transform
 * @param {Object} operation
 */

Transforms.applyOperation = function (transform, operation) {
  var state = transform.state,
      operations = transform.operations;
  var type = operation.type;

  var fn = OPERATIONS[type];

  if (!fn) {
    throw new Error('Unknown operation type: "' + type + '".');
  }

  debug(type, operation);
  transform.state = fn(state, operation);
  transform.operations = operations.concat([operation]);
};

/**
 * Add mark to text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function addMark(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length,
      mark = operation.mark;
  var _state = state,
      document = _state.document;

  var node = document.assertPath(path);
  node = node.addMark(offset, length, mark);
  document = document.updateDescendant(node);
  state = state.set('document', document);
  return state;
}

/**
 * Insert a `node` at `index` in a node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function insertNode(state, operation) {
  var path = operation.path,
      index = operation.index,
      node = operation.node;
  var _state2 = state,
      document = _state2.document;

  var parent = document.assertPath(path);
  var isParent = document == parent;
  parent = parent.insertNode(index, node);
  document = isParent ? parent : document.updateDescendant(parent);
  state = state.set('document', document);
  return state;
}

/**
 * Insert `text` at `offset` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function insertText(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      text = operation.text,
      marks = operation.marks;
  var _state3 = state,
      document = _state3.document,
      selection = _state3.selection;
  var _selection = selection,
      anchorKey = _selection.anchorKey,
      focusKey = _selection.focusKey,
      anchorOffset = _selection.anchorOffset,
      focusOffset = _selection.focusOffset;

  var node = document.assertPath(path);

  // Update the document
  node = node.insertText(offset, text, marks);
  document = document.updateDescendant(node);

  // Update the selection
  if (anchorKey == node.key && anchorOffset >= offset) {
    selection = selection.moveAnchor(text.length);
  }
  if (focusKey == node.key && focusOffset >= offset) {
    selection = selection.moveFocus(text.length);
  }

  state = state.set('document', document).set('selection', selection);
  return state;
}

/**
 * Join a node by `path` with a node `withPath`.
 *
 * @param {State} state
 * @param {Object} operation
 *   @param {Boolean} operation.deep (optional) Join recursively the
 *   respective last node and first node of the nodes' children. Like a zipper :)
 * @return {State}
 */

function joinNode(state, operation) {
  var path = operation.path,
      withPath = operation.withPath,
      _operation$deep = operation.deep,
      deep = _operation$deep === undefined ? false : _operation$deep;
  var _state4 = state,
      document = _state4.document,
      selection = _state4.selection;

  var first = document.assertPath(withPath);
  var second = document.assertPath(path);

  document = document.joinNode(first, second, { deep: deep });

  // If the operation is deep, or the nodes are text nodes, it means we will be
  // merging two text nodes together, so we need to update the selection.
  if (deep || second.kind == 'text') {
    var _selection2 = selection,
        anchorKey = _selection2.anchorKey,
        anchorOffset = _selection2.anchorOffset,
        focusKey = _selection2.focusKey,
        focusOffset = _selection2.focusOffset;

    var firstText = first.kind == 'text' ? first : first.getLastText();
    var secondText = second.kind == 'text' ? second : second.getFirstText();

    if (anchorKey == secondText.key) {
      selection = selection.merge({
        anchorKey: firstText.key,
        anchorOffset: anchorOffset + firstText.characters.size
      });
    }

    if (focusKey == secondText.key) {
      selection = selection.merge({
        focusKey: firstText.key,
        focusOffset: focusOffset + firstText.characters.size
      });
    }
  }

  state = state.set('document', document).set('selection', selection);
  return state;
}

/**
 * Move a node by `path` to a new parent by `path` and `index`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function moveNode(state, operation) {
  var path = operation.path,
      newPath = operation.newPath,
      newIndex = operation.newIndex;
  var _state5 = state,
      document = _state5.document;

  var node = document.assertPath(path);
  var index = path[path.length - 1];
  var parentPath = path.slice(0, -1);

  // Remove the node from its current parent
  var parent = document.getParent(node.key);
  parent = parent.removeNode(index);
  document = parent.kind === 'document' ? parent : document.updateDescendant(parent);

  // Check if `parent` is an anchestor of `target`
  var isAncestor = parentPath.every(function (x, i) {
    return x === newPath[i];
  });

  var target = void 0;

  // If `parent` is an ancestor of `target` and their paths have same length,
  // then `parent` and `target` are equal.
  if (isAncestor && parentPath.length === newPath.length) {
    target = parent;
  }

  // Else if `parent` is an ancestor of `target` and `node` index is less than
  // the index of the `target` ancestor with the same depth of `node`,
  // then removing `node` changes the path to `target`.
  // So we have to adjust `newPath` before picking `target`.
  else if (isAncestor && index < newPath[parentPath.length]) {
      newPath[parentPath.length]--;
      target = document.assertPath(newPath);
    }

    // Else pick `target`
    else {
        target = document.assertPath(newPath);
      }

  // Insert the new node to its new parent
  target = target.insertNode(newIndex, node);
  document = target.kind === 'document' ? target : document.updateDescendant(target);

  state = state.set('document', document);
  return state;
}

/**
 * Remove mark from text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function removeMark(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length,
      mark = operation.mark;
  var _state6 = state,
      document = _state6.document;

  var node = document.assertPath(path);
  node = node.removeMark(offset, length, mark);
  document = document.updateDescendant(node);
  state = state.set('document', document);
  return state;
}

/**
 * Remove a node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function removeNode(state, operation) {
  var path = operation.path;
  var _state7 = state,
      document = _state7.document,
      selection = _state7.selection;
  var _selection3 = selection,
      startKey = _selection3.startKey,
      endKey = _selection3.endKey;

  var node = document.assertPath(path);

  // If the selection is set, check to see if it needs to be updated.
  if (selection.isSet) {
    var hasStartNode = node.hasNode(startKey);
    var hasEndNode = node.hasNode(endKey);

    // If one of the selection's nodes is being removed, we need to update it.
    if (hasStartNode) {
      var prev = document.getPreviousText(startKey);
      var next = document.getNextText(startKey);

      if (prev) {
        selection = selection.moveStartTo(prev.key, prev.length);
      } else if (next) {
        selection = selection.moveStartTo(next.key, 0);
      } else {
        selection = selection.deselect();
      }
    }

    if (hasEndNode) {
      var _prev = document.getPreviousText(endKey);
      var _next = document.getNextText(endKey);

      if (_prev) {
        selection = selection.moveEndTo(_prev.key, _prev.length);
      } else if (_next) {
        selection = selection.moveEndTo(_next.key, 0);
      } else {
        selection = selection.deselect();
      }
    }
  }

  // Remove the node from the document.
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);
  var isParent = document == parent;
  parent = parent.removeNode(index);
  document = isParent ? parent : document.updateDescendant(parent);

  // Update the document and selection.
  state = state.set('document', document).set('selection', selection);
  return state;
}

/**
 * Remove text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function removeText(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length;

  var rangeOffset = offset + length;
  var _state8 = state,
      document = _state8.document,
      selection = _state8.selection;
  var _selection4 = selection,
      anchorKey = _selection4.anchorKey,
      focusKey = _selection4.focusKey,
      anchorOffset = _selection4.anchorOffset,
      focusOffset = _selection4.focusOffset;

  var node = document.assertPath(path);

  // Update the selection
  if (anchorKey == node.key && anchorOffset >= rangeOffset) {
    selection = selection.moveAnchor(-length);
  }
  if (focusKey == node.key && focusOffset >= rangeOffset) {
    selection = selection.moveFocus(-length);
  }

  node = node.removeText(offset, length);
  document = document.updateDescendant(node);
  state = state.set('document', document).set('selection', selection);
  return state;
}

/**
 * Set `data` on `state`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setData(state, operation) {
  var properties = operation.properties;
  var _state9 = state,
      data = _state9.data;


  data = data.merge(properties);
  state = state.set('data', data);
  return state;
}

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setMark(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      length = operation.length,
      mark = operation.mark,
      newMark = operation.newMark;
  var _state10 = state,
      document = _state10.document;

  var node = document.assertPath(path);
  node = node.updateMark(offset, length, mark, newMark);
  document = document.updateDescendant(node);
  state = state.set('document', document);
  return state;
}

/**
 * Set `properties` on a node by `path`.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setNode(state, operation) {
  var path = operation.path,
      properties = operation.properties;
  var _state11 = state,
      document = _state11.document;

  var node = document.assertPath(path);

  // Deprecate the ability to overwite a node's children.
  if (properties.nodes && properties.nodes != node.nodes) {
    (0, _warn2.default)('Updating a Node\'s `nodes` property via `setNode()` is not allowed. Use the appropriate insertion and removal operations instead. The opeartion in question was:', operation);
    delete properties.nodes;
  }

  // Deprecate the ability to change a node's key.
  if (properties.key && properties.key != node.key) {
    (0, _warn2.default)('Updating a Node\'s `key` property via `setNode()` is not allowed. There should be no reason to do this. The opeartion in question was:', operation);
    delete properties.key;
  }

  node = node.merge(properties);
  document = node.kind === 'document' ? node : document.updateDescendant(node);
  state = state.set('document', document);
  return state;
}

/**
 * Set `properties` on the selection.
 *
 * @param {State} state
 * @param {Object} operation
 * @return {State}
 */

function setSelection(state, operation) {
  var properties = _extends({}, operation.properties);
  var _state12 = state,
      document = _state12.document,
      selection = _state12.selection;


  if (properties.anchorPath !== undefined) {
    properties.anchorKey = properties.anchorPath === null ? null : document.assertPath(properties.anchorPath).key;
    delete properties.anchorPath;
  }

  if (properties.focusPath !== undefined) {
    properties.focusKey = properties.focusPath === null ? null : document.assertPath(properties.focusPath).key;
    delete properties.focusPath;
  }

  selection = selection.merge(properties);
  selection = selection.normalize(document);
  state = state.set('selection', selection);
  return state;
}

/**
 * Split a node by `path` at `offset`.
 *
 * @param {State} state
 * @param {Object} operation
 *   @param {Array} operation.path The path of the node to split
 *   @param {Number} operation.offset (optional) Split using a relative offset
 *   @param {Number} operation.count (optional) Split after `count`
 *   children. Cannot be used in combination with offset.
 * @return {State}
 */

function splitNode(state, operation) {
  var path = operation.path,
      offset = operation.offset,
      count = operation.count;
  var _state13 = state,
      document = _state13.document,
      selection = _state13.selection;

  // If there's no offset, it's using the `count` instead.

  if (offset == null) {
    document = document.splitNodeAfter(path, count);
    state = state.set('document', document);
    return state;
  }

  // Otherwise, split using the `offset`, but calculate a few things first.
  var node = document.assertPath(path);
  var text = node.kind == 'text' ? node : node.getTextAtOffset(offset);
  var textOffset = node.kind == 'text' ? offset : offset - node.getOffset(text.key);
  var _selection5 = selection,
      anchorKey = _selection5.anchorKey,
      anchorOffset = _selection5.anchorOffset,
      focusKey = _selection5.focusKey,
      focusOffset = _selection5.focusOffset;


  document = document.splitNode(path, offset);

  // Determine whether we need to update the selection.
  var splitAnchor = text.key == anchorKey && textOffset <= anchorOffset;
  var splitFocus = text.key == focusKey && textOffset <= focusOffset;

  // If either the anchor of focus was after the split, we need to update them.
  if (splitFocus || splitAnchor) {
    var nextText = document.getNextText(text.key);

    if (splitAnchor) {
      selection = selection.merge({
        anchorKey: nextText.key,
        anchorOffset: anchorOffset - textOffset
      });
    }

    if (splitFocus) {
      selection = selection.merge({
        focusKey: nextText.key,
        focusOffset: focusOffset - textOffset
      });
    }
  }

  state = state.set('document', document).set('selection', selection);
  return state;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../utils/warn":134,"debug":3}],108:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Add a `mark` to the characters in the current selection.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 */

Transforms.addMark = function (transform, mark) {
  mark = _normalize2.default.mark(mark);
  var state = transform.state;
  var document = state.document,
      selection = state.selection;


  if (selection.isExpanded) {
    transform.addMarkAtRange(selection, mark);
    return;
  }

  if (selection.marks) {
    var _marks = selection.marks.add(mark);
    var _sel = selection.set('marks', _marks);
    transform.select(_sel);
    return;
  }

  var marks = document.getMarksAtRange(selection).add(mark);
  var sel = selection.set('marks', marks);
  transform.select(sel);
};

/**
 * Delete at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.delete = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  if (selection.isCollapsed) return;

  transform.snapshotSelection().deleteAtRange(selection)
  // Ensure that the selection is collapsed to the start, because in certain
  // cases when deleting across inline nodes this isn't guaranteed.
  .collapseToStart().snapshotSelection();
};

/**
 * Delete backward `n` characters at the current selection.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 */

Transforms.deleteBackward = function (transform) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = transform.state;
  var selection = state.selection;

  transform.deleteBackwardAtRange(selection, n);
};

/**
 * Delete backward until the character boundary at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.deleteCharBackward = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.deleteCharBackwardAtRange(selection);
};

/**
 * Delete backward until the line boundary at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.deleteLineBackward = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.deleteLineBackwardAtRange(selection);
};

/**
 * Delete backward until the word boundary at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.deleteWordBackward = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.deleteWordBackwardAtRange(selection);
};

/**
 * Delete forward `n` characters at the current selection.
 *
 * @param {Transform} transform
 * @param {Number} n (optional)
 */

Transforms.deleteForward = function (transform) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = transform.state;
  var selection = state.selection;

  transform.deleteForwardAtRange(selection, n);
};

/**
 * Delete forward until the character boundary at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.deleteCharForward = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.deleteCharForwardAtRange(selection);
};

/**
 * Delete forward until the line boundary at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.deleteLineForward = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.deleteLineForwardAtRange(selection);
};

/**
 * Delete forward until the word boundary at the current selection.
 *
 * @param {Transform} transform
 */

Transforms.deleteWordForward = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.deleteWordForwardAtRange(selection);
};

/**
 * Insert a `block` at the current selection.
 *
 * @param {Transform} transform
 * @param {String|Object|Block} block
 */

Transforms.insertBlock = function (transform, block) {
  block = _normalize2.default.block(block);
  var state = transform.state;
  var selection = state.selection;

  transform.insertBlockAtRange(selection, block);

  // If the node was successfully inserted, update the selection.
  var node = transform.state.document.getNode(block.key);
  if (node) transform.collapseToEndOf(node);
};

/**
 * Insert a `fragment` at the current selection.
 *
 * @param {Transform} transform
 * @param {Document} fragment
 */

Transforms.insertFragment = function (transform, fragment) {
  var state = transform.state;
  var _state = state,
      document = _state.document,
      selection = _state.selection;


  if (!fragment.nodes.size) return;

  var _state2 = state,
      startText = _state2.startText,
      endText = _state2.endText;

  var lastText = fragment.getLastText();
  var lastInline = fragment.getClosestInline(lastText.key);
  var keys = document.getTexts().map(function (text) {
    return text.key;
  });
  var isAppending = selection.hasEdgeAtEndOf(endText) || selection.hasEdgeAtStartOf(startText);

  transform.deselect();
  transform.insertFragmentAtRange(selection, fragment);
  state = transform.state;
  document = state.document;

  var newTexts = document.getTexts().filter(function (n) {
    return !keys.includes(n.key);
  });
  var newText = isAppending ? newTexts.last() : newTexts.takeLast(2).first();
  var after = void 0;

  if (newText && lastInline) {
    after = selection.collapseToEndOf(newText);
  } else if (newText) {
    after = selection.collapseToStartOf(newText).move(lastText.length);
  } else {
    after = selection.collapseToStart().move(lastText.length);
  }

  transform.select(after);
};

/**
 * Insert a `inline` at the current selection.
 *
 * @param {Transform} transform
 * @param {String|Object|Block} inline
 */

Transforms.insertInline = function (transform, inline) {
  inline = _normalize2.default.inline(inline);
  var state = transform.state;
  var selection = state.selection;

  transform.insertInlineAtRange(selection, inline);

  // If the node was successfully inserted, update the selection.
  var node = transform.state.document.getNode(inline.key);
  if (node) transform.collapseToEndOf(node);
};

/**
 * Insert a `text` string at the current selection.
 *
 * @param {Transform} transform
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 */

Transforms.insertText = function (transform, text, marks) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  marks = marks || selection.marks;
  transform.insertTextAtRange(selection, text, marks);

  // If the text was successfully inserted, and the selection had marks on it,
  // unset the selection's marks.
  if (selection.marks && document != transform.state.document) {
    transform.select({ marks: null });
  }
};

/**
 * Set `properties` of the block nodes in the current selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

Transforms.setBlock = function (transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  transform.setBlockAtRange(selection, properties);
};

/**
 * Set `properties` of the inline nodes in the current selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

Transforms.setInline = function (transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  transform.setInlineAtRange(selection, properties);
};

/**
 * Split the block node at the current selection, to optional `depth`.
 *
 * @param {Transform} transform
 * @param {Number} depth (optional)
 */

Transforms.splitBlock = function (transform) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var state = transform.state;
  var selection = state.selection;

  transform.snapshotSelection().splitBlockAtRange(selection, depth).collapseToEnd().snapshotSelection();
};

/**
 * Split the inline nodes at the current selection, to optional `depth`.
 *
 * @param {Transform} transform
 * @param {Number} depth (optional)
 */

Transforms.splitInline = function (transform) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
  var state = transform.state;
  var selection = state.selection;

  transform.snapshotSelection().splitInlineAtRange(selection, depth).snapshotSelection();
};

/**
 * Remove a `mark` from the characters in the current selection.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 */

Transforms.removeMark = function (transform, mark) {
  mark = _normalize2.default.mark(mark);
  var state = transform.state;
  var document = state.document,
      selection = state.selection;


  if (selection.isExpanded) {
    transform.removeMarkAtRange(selection, mark);
    return;
  }

  if (selection.marks) {
    var _marks2 = selection.marks.remove(mark);
    var _sel2 = selection.set('marks', _marks2);
    transform.select(_sel2);
    return;
  }

  var marks = document.getMarksAtRange(selection).remove(mark);
  var sel = selection.set('marks', marks);
  transform.select(sel);
};

/**
 * Add or remove a `mark` from the characters in the current selection,
 * depending on whether it's already there.
 *
 * @param {Transform} transform
 * @param {Mark} mark
 */

Transforms.toggleMark = function (transform, mark) {
  mark = _normalize2.default.mark(mark);
  var state = transform.state;

  var exists = state.marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    transform.removeMark(mark);
  } else {
    transform.addMark(mark);
  }
};

/**
 * Unwrap the current selection from a block parent with `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

Transforms.unwrapBlock = function (transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  transform.unwrapBlockAtRange(selection, properties);
};

/**
 * Unwrap the current selection from an inline parent with `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

Transforms.unwrapInline = function (transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  transform.unwrapInlineAtRange(selection, properties);
};

/**
 * Wrap the block nodes in the current selection with a new block node with
 * `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

Transforms.wrapBlock = function (transform, properties) {
  var state = transform.state;
  var selection = state.selection;

  transform.wrapBlockAtRange(selection, properties);
};

/**
 * Wrap the current selection in new inline nodes with `properties`.
 *
 * @param {Transform} transform
 * @param {Object|String} properties
 */

Transforms.wrapInline = function (transform, properties) {
  var state = transform.state;
  var _state3 = state,
      document = _state3.document,
      selection = _state3.selection;

  var after = void 0;

  var startKey = selection.startKey;


  transform.deselect();
  transform.wrapInlineAtRange(selection, properties);
  state = transform.state;
  document = state.document;

  // Determine what the selection should be after wrapping.
  if (selection.isCollapsed) {
    after = selection;
  } else if (selection.startOffset == 0) {
    // Find the inline that has been inserted.
    // We want to handle multiple wrap, so we need to take the highest parent
    var inline = document.getAncestors(startKey).find(function (parent) {
      return parent.kind == 'inline' && parent.getOffset(startKey) == 0;
    });

    var start = inline ? document.getPreviousText(inline.getFirstText().key) : document.getFirstText();
    var end = document.getNextText(inline ? inline.getLastText().key : start.key);

    // Move selection to wrap around the inline
    after = selection.moveAnchorToEndOf(start).moveFocusToStartOf(end);
  } else if (selection.startKey == selection.endKey) {
    var text = document.getNextText(selection.startKey);
    after = selection.moveToRangeOf(text);
  } else {
    var anchor = document.getNextText(selection.anchorKey);
    var focus = document.getDescendant(selection.focusKey);
    after = selection.merge({
      anchorKey: anchor.key,
      anchorOffset: 0,
      focusKey: focus.key,
      focusOffset: selection.focusOffset
    });
  }

  after = after.normalize(document);
  transform.select(after);
};

/**
 * Wrap the current selection with prefix/suffix.
 *
 * @param {Transform} transform
 * @param {String} prefix
 * @param {String} suffix
 */

Transforms.wrapText = function (transform, prefix) {
  var suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : prefix;
  var state = transform.state;
  var selection = state.selection;

  transform.wrapTextAtRange(selection, prefix, suffix);

  // If the selection was collapsed, it will have moved the start offset too.
  if (selection.isCollapsed) {
    transform.moveStart(0 - prefix.length);
  }

  // Adding the suffix will have pushed the end of the selection further on, so
  // we need to move it back to account for this.
  transform.moveEnd(0 - suffix.length);

  // There's a chance that the selection points moved "through" each other,
  // resulting in a now-incorrect selection direction.
  if (selection.isForward != transform.state.selection.isForward) {
    transform.flip();
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../utils/normalize":129}],109:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _string = require('../utils/string');

var _string2 = _interopRequireDefault(_string);

var _core = require('../schemas/core');

var _core2 = _interopRequireDefault(_core);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * @type {Object}
 */

/* eslint no-console: 0 */

var Transforms = {};

/**
 * An options object with normalize set to `false`.
 *
 * @type {Object}
 */

var OPTS = {
  normalize: false
};

/**
 * Add a new `mark` to the characters at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.addMarkAtRange = function (transform, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize;
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  var texts = document.getTextsAtRange(range);

  texts.forEach(function (text) {
    var key = text.key;

    var index = 0;
    var length = text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    transform.addMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Delete everything in a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteAtRange = function (transform, range) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (range.isCollapsed) return;

  var _options$normalize2 = options.normalize,
      normalize = _options$normalize2 === undefined ? true : _options$normalize2;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  // If the start and end key are the same, we can just remove text.

  if (startKey == endKey) {
    var index = startOffset;
    var length = endOffset - startOffset;
    transform.removeTextByKey(startKey, index, length, { normalize: normalize });
    return;
  }

  // Split at the range edges within a common ancestor, without normalizing.
  var state = transform.state;
  var _state = state,
      document = _state.document;

  var ancestor = document.getCommonAncestor(startKey, endKey);
  var startChild = ancestor.getFurthestAncestor(startKey);
  var endChild = ancestor.getFurthestAncestor(endKey);
  var startOff = (startChild.kind == 'text' ? 0 : startChild.getOffset(startKey)) + startOffset;
  var endOff = (endChild.kind == 'text' ? 0 : endChild.getOffset(endKey)) + endOffset;

  transform.splitNodeByKey(startChild.key, startOff, OPTS);
  transform.splitNodeByKey(endChild.key, endOff, OPTS);

  // Refresh variables.
  state = transform.state;
  document = state.document;
  ancestor = document.getCommonAncestor(startKey, endKey);
  startChild = ancestor.getFurthestAncestor(startKey);
  endChild = ancestor.getFurthestAncestor(endKey);
  var startIndex = ancestor.nodes.indexOf(startChild);
  var endIndex = ancestor.nodes.indexOf(endChild);
  var middles = ancestor.nodes.slice(startIndex + 1, endIndex + 1);

  // Remove all of the middle nodes, between the splits.
  if (middles.size) {
    middles.forEach(function (child) {
      transform.removeNodeByKey(child.key, OPTS);
    });
  }

  // If the start and end block are different, move all of the nodes from the
  // end block into the start block.
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(document.getNextText(endKey).key);

  if (startBlock.key !== endBlock.key) {
    endBlock.nodes.forEach(function (child, i) {
      var newKey = startBlock.key;
      var newIndex = startBlock.nodes.size + i;
      transform.moveNodeByKey(child.key, newKey, newIndex, OPTS);
    });

    // Remove parents of endBlock as long as they have a single child
    var lonely = document.getFurthestOnlyChildAncestor(endBlock.key) || endBlock;
    transform.removeNodeByKey(lonely.key, OPTS);
  }

  if (normalize) {
    transform.normalizeNodeByKey(ancestor.key, _core2.default);
  }
};

/**
 * Delete backward until the character boundary at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteCharBackwardAtRange = function (transform, range, options) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetBackward(text, o);
  transform.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward until the line boundary at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteLineBackwardAtRange = function (transform, range, options) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  transform.deleteBackwardAtRange(range, o, options);
};

/**
 * Delete backward until the word boundary at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteWordBackwardAtRange = function (transform, range, options) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetBackward(text, o);
  transform.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward `n` characters at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteBackwardAtRange = function (transform, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize3 = options.normalize,
      normalize = _options$normalize3 === undefined ? true : _options$normalize3;
  var state = transform.state;
  var document = state.document;
  var _range = range,
      startKey = _range.startKey,
      focusOffset = _range.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    transform.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);
  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    transform.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }
  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    transform.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    transform.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtStartOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtStartOf(text)) {
    var prev = document.getPreviousText(text.key);
    var prevBlock = document.getClosestBlock(prev.key);
    var prevInline = document.getClosestInline(prev.key);

    // If the previous block is void, remove it.
    if (prevBlock && prevBlock.isVoid) {
      transform.removeNodeByKey(prevBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (prevInline && prevInline.isVoid) {
      transform.removeNodeByKey(prevInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to join the two blocks together.
    if (n == 1 && prevBlock != block) {
      range = range.merge({
        anchorKey: prev.key,
        anchorOffset: prev.length
      });

      transform.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the focus offset is farther than the number of characters to delete,
  // just remove the characters backwards inside the current node.
  if (n < focusOffset) {
    range = range.merge({
      focusOffset: focusOffset - n,
      isBackward: true
    });

    transform.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes backwards to go.
  var node = text;
  var offset = 0;
  var traversed = focusOffset;

  while (n > traversed) {
    node = document.getPreviousText(node.key);
    var next = traversed + node.length;
    if (n <= next) {
      offset = next - n;
      break;
    } else {
      traversed = next;
    }
  }

  // If the focus node is inside a void, go up until right after it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getNextText(parent.key);
    offset = 0;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset,
    isBackward: true
  });

  transform.deleteAtRange(range, { normalize: normalize });
};

/**
 * Delete forward until the character boundary at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteCharForwardAtRange = function (transform, range, options) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetForward(text, o);
  transform.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward until the line boundary at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteLineForwardAtRange = function (transform, range, options) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  transform.deleteForwardAtRange(range, o, options);
};

/**
 * Delete forward until the word boundary at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteWordForwardAtRange = function (transform, range, options) {
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetForward(text, o);
  transform.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward `n` characters at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.deleteForwardAtRange = function (transform, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize4 = options.normalize,
      normalize = _options$normalize4 === undefined ? true : _options$normalize4;
  var state = transform.state;
  var document = state.document;
  var _range2 = range,
      startKey = _range2.startKey,
      focusOffset = _range2.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    transform.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);
  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    transform.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }
  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    transform.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    transform.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtEndOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtEndOf(text)) {
    var next = document.getNextText(text.key);
    var nextBlock = document.getClosestBlock(next.key);
    var nextInline = document.getClosestInline(next.key);

    // If the previous block is void, remove it.
    if (nextBlock && nextBlock.isVoid) {
      transform.removeNodeByKey(nextBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (nextInline && nextInline.isVoid) {
      transform.removeNodeByKey(nextInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to join the two blocks together.
    if (n == 1 && nextBlock != block) {
      range = range.merge({
        focusKey: next.key,
        focusOffset: 0
      });

      transform.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the remaining characters to the end of the node is greater than or equal
  // to the number of characters to delete, just remove the characters forwards
  // inside the current node.
  if (n <= text.length - focusOffset) {
    range = range.merge({
      focusOffset: focusOffset + n
    });

    transform.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes forwards to go.
  var node = text;
  var offset = focusOffset;
  var traversed = text.length - focusOffset;

  while (n > traversed) {
    node = document.getNextText(node.key);
    var _next = traversed + node.length;
    if (n <= _next) {
      offset = n - traversed;
      break;
    } else {
      traversed = _next;
    }
  }

  // If the focus node is inside a void, go up until right before it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getPreviousText(parent.key);
    offset = node.length;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset
  });

  transform.deleteAtRange(range, { normalize: normalize });
};

/**
 * Insert a `block` node at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Block|String|Object} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.insertBlockAtRange = function (transform, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _normalize2.default.block(block);
  var _options$normalize5 = options.normalize,
      normalize = _options$normalize5 === undefined ? true : _options$normalize5;


  if (range.isExpanded) {
    transform.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var state = transform.state;
  var document = state.document;
  var _range3 = range,
      startKey = _range3.startKey,
      startOffset = _range3.startOffset;

  var startText = document.assertDescendant(startKey);
  var startBlock = document.getClosestBlock(startKey);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);

  if (startBlock.isVoid) {
    transform.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else if (startBlock.isEmpty) {
    transform.removeNodeByKey(startBlock.key);
    transform.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtStartOf(startBlock)) {
    transform.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtEndOf(startBlock)) {
    transform.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else {
    var offset = startBlock.getOffset(startText.key) + startOffset;
    transform.splitNodeByKey(startBlock.key, offset, { normalize: normalize });
    transform.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  }

  if (normalize) {
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert a `fragment` at a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Document} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.insertFragmentAtRange = function (transform, range, fragment) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize6 = options.normalize,
      normalize = _options$normalize6 === undefined ? true : _options$normalize6;

  // If the range is expanded, delete it first.

  if (range.isExpanded) {
    transform.deleteAtRange(range, OPTS);
    range = range.collapseToStart();
  }

  // If the fragment is empty, there's nothing to do after deleting.
  if (!fragment.nodes.size) return;

  // Regenerate the keys for all of the fragments nodes, so that they're
  // guaranteed not to collide with the existing keys in the document. Otherwise
  // they will be rengerated automatically and we won't have an easy way to
  // reference them.
  fragment = fragment.mapDescendants(function (child) {
    return child.regenerateKey();
  });

  // Calculate a few things...
  var _range4 = range,
      startKey = _range4.startKey,
      startOffset = _range4.startOffset;
  var state = transform.state;
  var _state2 = state,
      document = _state2.document;

  var startText = document.getDescendant(startKey);
  var startBlock = document.getClosestBlock(startText.key);
  var startChild = startBlock.getFurthestAncestor(startText.key);
  var isAtStart = range.isAtStartOf(startBlock);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);
  var offset = startChild == startText ? startOffset : startChild.getOffset(startText.key) + startOffset;

  var blocks = fragment.getBlocks();
  var firstBlock = blocks.first();
  var lastBlock = blocks.last();

  // If the fragment only contains a void block, use `insertBlock` instead.
  if (firstBlock == lastBlock && firstBlock.isVoid) {
    transform.insertBlockAtRange(range, firstBlock, options);
    return;
  }

  // If the first and last block aren't the same, we need to insert all of the
  // nodes after the fragment's first block at the index.
  if (firstBlock != lastBlock) {
    var lonelyParent = fragment.getFurthest(firstBlock.key, function (p) {
      return p.nodes.size == 1;
    });
    var lonelyChild = lonelyParent || firstBlock;
    var startIndex = parent.nodes.indexOf(startBlock);
    fragment = fragment.removeDescendant(lonelyChild.key);

    fragment.nodes.forEach(function (node, i) {
      var newIndex = startIndex + i + 1;
      transform.insertNodeByKey(parent.key, newIndex, node, OPTS);
    });
  }

  // Check if we need to split the node.
  if (startOffset != 0) {
    transform.splitNodeByKey(startChild.key, offset, OPTS);
  }

  // Update our variables with the new state.
  state = transform.state;
  document = state.document;
  startText = document.getDescendant(startKey);
  startBlock = document.getClosestBlock(startKey);
  startChild = startBlock.getFurthestAncestor(startText.key);

  // If the first and last block aren't the same, we need to move any of the
  // starting block's children after the split into the last block of the
  // fragment, which has already been inserted.
  if (firstBlock != lastBlock) {
    var nextChild = isAtStart ? startChild : startBlock.getNextSibling(startChild.key);
    var nextNodes = nextChild ? startBlock.nodes.skipUntil(function (n) {
      return n.key == nextChild.key;
    }) : (0, _immutable.List)();
    var lastIndex = lastBlock.nodes.size;

    nextNodes.forEach(function (node, i) {
      var newIndex = lastIndex + i;
      transform.moveNodeByKey(node.key, lastBlock.key, newIndex, OPTS);
    });
  }

  // If the starting block is empty, we replace it entirely with the first block
  // of the fragment, since this leads to a more expected behavior for the user.
  if (startBlock.isEmpty) {
    transform.removeNodeByKey(startBlock.key, OPTS);
    transform.insertNodeByKey(parent.key, index, firstBlock, OPTS);
  }

  // Otherwise, we maintain the starting block, and insert all of the first
  // block's inline nodes into it at the split point.
  else {
      var inlineChild = startBlock.getFurthestAncestor(startText.key);
      var inlineIndex = startBlock.nodes.indexOf(inlineChild);

      firstBlock.nodes.forEach(function (inline, i) {
        var o = startOffset == 0 ? 0 : 1;
        var newIndex = inlineIndex + i + o;
        transform.insertNodeByKey(startBlock.key, newIndex, inline, OPTS);
      });
    }

  // Normalize if requested.
  if (normalize) {
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert an `inline` node at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Inline|String|Object} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.insertInlineAtRange = function (transform, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize7 = options.normalize,
      normalize = _options$normalize7 === undefined ? true : _options$normalize7;

  inline = _normalize2.default.inline(inline);

  if (range.isExpanded) {
    transform.deleteAtRange(range, OPTS);
    range = range.collapseToStart();
  }

  var state = transform.state;
  var document = state.document;
  var _range5 = range,
      startKey = _range5.startKey,
      startOffset = _range5.startOffset;

  var parent = document.getParent(startKey);
  var startText = document.assertDescendant(startKey);
  var index = parent.nodes.indexOf(startText);

  if (parent.isVoid) return;

  transform.splitNodeByKey(startKey, startOffset, OPTS);
  transform.insertNodeByKey(parent.key, index + 1, inline, OPTS);

  if (normalize) {
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert `text` at a `range`, with optional `marks`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.insertTextAtRange = function (transform, range, text, marks) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var normalize = options.normalize;
  var state = transform.state;
  var document = state.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var parent = document.getParent(startKey);

  if (parent.isVoid) return;

  if (range.isExpanded) {
    transform.deleteAtRange(range, OPTS);
  }

  // PERF: Unless specified, don't normalize if only inserting text.
  if (normalize !== undefined) {
    normalize = range.isExpanded;
  }

  transform.insertTextByKey(startKey, startOffset, text, marks, { normalize: normalize });
};

/**
 * Remove an existing `mark` to the characters at `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Mark|String} mark (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.removeMarkAtRange = function (transform, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var _options$normalize8 = options.normalize,
      normalize = _options$normalize8 === undefined ? true : _options$normalize8;
  var state = transform.state;
  var document = state.document;

  var texts = document.getTextsAtRange(range);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  texts.forEach(function (text) {
    var key = text.key;

    var index = 0;
    var length = text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    transform.removeMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Set the `properties` of block nodes in a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.setBlockAtRange = function (transform, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize9 = options.normalize,
      normalize = _options$normalize9 === undefined ? true : _options$normalize9;
  var state = transform.state;
  var document = state.document;

  var blocks = document.getBlocksAtRange(range);

  blocks.forEach(function (block) {
    transform.setNodeByKey(block.key, properties, { normalize: normalize });
  });
};

/**
 * Set the `properties` of inline nodes in a `range`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.setInlineAtRange = function (transform, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize10 = options.normalize,
      normalize = _options$normalize10 === undefined ? true : _options$normalize10;
  var state = transform.state;
  var document = state.document;

  var inlines = document.getInlinesAtRange(range);

  inlines.forEach(function (inline) {
    transform.setNodeByKey(inline.key, properties, { normalize: normalize });
  });
};

/**
 * Split the block nodes at a `range`, to optional `height`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.splitBlockAtRange = function (transform, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize11 = options.normalize,
      normalize = _options$normalize11 === undefined ? true : _options$normalize11;


  if (range.isExpanded) {
    transform.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range6 = range,
      startKey = _range6.startKey,
      startOffset = _range6.startOffset;
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestBlock(node.key);
  var offset = startOffset;
  var h = 0;

  while (parent && parent.kind == 'block' && h < height) {
    offset += parent.getOffset(node.key);
    node = parent;
    parent = document.getClosestBlock(parent.key);
    h++;
  }

  transform.splitNodeByKey(node.key, offset, { normalize: normalize });
};

/**
 * Split the inline nodes at a `range`, to optional `height`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.splitInlineAtRange = function (transform, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize12 = options.normalize,
      normalize = _options$normalize12 === undefined ? true : _options$normalize12;


  if (range.isExpanded) {
    transform.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range7 = range,
      startKey = _range7.startKey,
      startOffset = _range7.startOffset;
  var state = transform.state;
  var document = state.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestInline(node.key);
  var offset = startOffset;
  var h = 0;

  while (parent && parent.kind == 'inline' && h < height) {
    offset += parent.getOffset(node.key);
    node = parent;
    parent = document.getClosestInline(parent.key);
    h++;
  }

  transform.splitNodeByKey(node.key, offset, { normalize: normalize });
};

/**
 * Add or remove a `mark` from the characters at `range`, depending on whether
 * it's already there.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.toggleMarkAtRange = function (transform, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  mark = _normalize2.default.mark(mark);

  var _options$normalize13 = options.normalize,
      normalize = _options$normalize13 === undefined ? true : _options$normalize13;
  var state = transform.state;
  var document = state.document;

  var marks = document.getMarksAtRange(range);
  var exists = marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    transform.removeMarkAtRange(range, mark, { normalize: normalize });
  } else {
    transform.addMarkAtRange(range, mark, { normalize: normalize });
  }
};

/**
 * Unwrap all of the block nodes in a `range` from a block with `properties`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.unwrapBlockAtRange = function (transform, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _normalize2.default.nodeProperties(properties);

  var _options$normalize14 = options.normalize,
      normalize = _options$normalize14 === undefined ? true : _options$normalize14;
  var state = transform.state;
  var _state3 = state,
      document = _state3.document;

  var blocks = document.getBlocksAtRange(range);
  var wrappers = blocks.map(function (block) {
    return document.getClosest(block.key, function (parent) {
      if (parent.kind != 'block') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  wrappers.forEach(function (block) {
    var first = block.nodes.first();
    var last = block.nodes.last();
    var parent = document.getParent(block.key);
    var index = parent.nodes.indexOf(block);

    var children = block.nodes.filter(function (child) {
      return blocks.some(function (b) {
        return child == b || child.hasDescendant(b.key);
      });
    });

    var firstMatch = children.first();
    var lastMatch = children.last();

    if (first == firstMatch && last == lastMatch) {
      block.nodes.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + i, OPTS);
      });

      transform.removeNodeByKey(block.key, OPTS);
    } else if (last == lastMatch) {
      block.nodes.skipUntil(function (n) {
        return n == firstMatch;
      }).forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + 1 + i, OPTS);
      });
    } else if (first == firstMatch) {
      block.nodes.takeUntil(function (n) {
        return n == lastMatch;
      }).push(lastMatch).forEach(function (child, i) {
        transform.moveNodeByKey(child.key, parent.key, index + i, OPTS);
      });
    } else {
      var offset = block.getOffset(firstMatch.key);

      transform.splitNodeByKey(block.key, offset, OPTS);
      state = transform.state;
      document = state.document;

      children.forEach(function (child, i) {
        if (i == 0) {
          var extra = child;
          child = document.getNextBlock(child.key);
          transform.removeNodeByKey(extra.key, OPTS);
        }

        transform.moveNodeByKey(child.key, parent.key, index + 1 + i, OPTS);
      });
    }
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    transform.normalizeDocument(_core2.default);
  }
};

/**
 * Unwrap the inline nodes in a `range` from an inline with `properties`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.unwrapInlineAtRange = function (transform, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _normalize2.default.nodeProperties(properties);

  var _options$normalize15 = options.normalize,
      normalize = _options$normalize15 === undefined ? true : _options$normalize15;
  var state = transform.state;
  var document = state.document;

  var texts = document.getTextsAtRange(range);
  var inlines = texts.map(function (text) {
    return document.getClosest(text.key, function (parent) {
      if (parent.kind != 'inline') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  inlines.forEach(function (inline) {
    var parent = transform.state.document.getParent(inline.key);
    var index = parent.nodes.indexOf(inline);

    inline.nodes.forEach(function (child, i) {
      transform.moveNodeByKey(child.key, parent.key, index + i, OPTS);
    });
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    transform.normalizeDocument(_core2.default);
  }
};

/**
 * Wrap all of the blocks in a `range` in a new `block`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Block|Object|String} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.wrapBlockAtRange = function (transform, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _normalize2.default.block(block);
  block = block.set('nodes', block.nodes.clear());

  var _options$normalize16 = options.normalize,
      normalize = _options$normalize16 === undefined ? true : _options$normalize16;
  var state = transform.state;
  var document = state.document;


  var blocks = document.getBlocksAtRange(range);
  var firstblock = blocks.first();
  var lastblock = blocks.last();
  var parent = void 0,
      siblings = void 0,
      index = void 0;

  // If there is only one block in the selection then we know the parent and
  // siblings.
  if (blocks.length === 1) {
    parent = document.getParent(firstblock.key);
    siblings = blocks;
  }

  // Determine closest shared parent to all blocks in selection.
  else {
      parent = document.getClosest(firstblock.key, function (p1) {
        return !!document.getClosest(lastblock.key, function (p2) {
          return p1 == p2;
        });
      });
    }

  // If no shared parent could be found then the parent is the document.
  if (parent == null) parent = document;

  // Create a list of direct children siblings of parent that fall in the
  // selection.
  if (siblings == null) {
    var indexes = parent.nodes.reduce(function (ind, node, i) {
      if (node == firstblock || node.hasDescendant(firstblock.key)) ind[0] = i;
      if (node == lastblock || node.hasDescendant(lastblock.key)) ind[1] = i;
      return ind;
    }, []);

    index = indexes[0];
    siblings = parent.nodes.slice(indexes[0], indexes[1] + 1);
  }

  // Get the index to place the new wrapped node at.
  if (index == null) {
    index = parent.nodes.indexOf(siblings.first());
  }

  // Inject the new block node into the parent.
  transform.insertNodeByKey(parent.key, index, block, OPTS);

  // Move the sibling nodes into the new block node.
  siblings.forEach(function (node, i) {
    transform.moveNodeByKey(node.key, block.key, i, OPTS);
  });

  if (normalize) {
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Wrap the text and inlines in a `range` in a new `inline`.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {Inline|Object|String} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.wrapInlineAtRange = function (transform, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var state = transform.state;
  var _state4 = state,
      document = _state4.document;
  var _options$normalize17 = options.normalize,
      normalize = _options$normalize17 === undefined ? true : _options$normalize17;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (range.isCollapsed) {
    // Wrapping an inline void
    var inlineParent = document.getClosestInline(startKey);
    if (!inlineParent.isVoid) {
      return;
    }

    return transform.wrapInlineByKey(inlineParent.key, inline, options);
  }

  inline = _normalize2.default.inline(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var blocks = document.getBlocksAtRange(range);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);
  var startChild = startBlock.getFurthestAncestor(startKey);
  var endChild = endBlock.getFurthestAncestor(endKey);
  var startIndex = startBlock.nodes.indexOf(startChild);
  var endIndex = endBlock.nodes.indexOf(endChild);

  var startOff = startChild.key == startKey ? startOffset : startChild.getOffset(startKey) + startOffset;

  var endOff = endChild.key == endKey ? endOffset : endChild.getOffset(endKey) + endOffset;

  if (startBlock == endBlock) {
    if (endOff != endChild.length) {
      transform.splitNodeByKey(endChild.key, endOff, OPTS);
    }

    if (startOff != 0) {
      transform.splitNodeByKey(startChild.key, startOff, OPTS);
    }

    state = transform.state;
    document = state.document;
    startBlock = document.getClosestBlock(startKey);
    startChild = startBlock.getFurthestAncestor(startKey);

    var startInner = startOff == 0 ? startChild : document.getNextSibling(startChild.key);

    var startInnerIndex = startBlock.nodes.indexOf(startInner);

    var endInner = startKey == endKey ? startInner : startBlock.getFurthestAncestor(endKey);
    var inlines = startBlock.nodes.skipUntil(function (n) {
      return n == startInner;
    }).takeUntil(function (n) {
      return n == endInner;
    }).push(endInner);

    var node = inline.regenerateKey();

    transform.insertNodeByKey(startBlock.key, startInnerIndex, node, OPTS);

    inlines.forEach(function (child, i) {
      transform.moveNodeByKey(child.key, node.key, i, OPTS);
    });

    if (normalize) {
      transform.normalizeNodeByKey(startBlock.key, _core2.default);
    }
  } else {
    transform.splitNodeByKey(startChild.key, startOff, OPTS);
    transform.splitNodeByKey(endChild.key, endOff, OPTS);

    state = transform.state;
    document = state.document;
    startBlock = document.getDescendant(startBlock.key);
    endBlock = document.getDescendant(endBlock.key);

    var startInlines = startBlock.nodes.slice(startIndex + 1);
    var endInlines = endBlock.nodes.slice(0, endIndex + 1);
    var startNode = inline.regenerateKey();
    var endNode = inline.regenerateKey();

    transform.insertNodeByKey(startBlock.key, startIndex - 1, startNode, OPTS);
    transform.insertNodeByKey(endBlock.key, endIndex, endNode, OPTS);

    startInlines.forEach(function (child, i) {
      transform.moveNodeByKey(child.key, startNode.key, i, OPTS);
    });

    endInlines.forEach(function (child, i) {
      transform.moveNodeByKey(child.key, endNode.key, i, OPTS);
    });

    if (normalize) {
      transform.normalizeNodeByKey(startBlock.key, _core2.default).normalizeNodeByKey(endBlock.key, _core2.default);
    }

    blocks.slice(1, -1).forEach(function (block) {
      var node = inline.regenerateKey();
      transform.insertNodeByKey(block.key, 0, node, OPTS);

      block.nodes.forEach(function (child, i) {
        transform.moveNodeByKey(child.key, node.key, i, OPTS);
      });

      if (normalize) {
        transform.normalizeNodeByKey(block.key, _core2.default);
      }
    });
  }
};

/**
 * Wrap the text in a `range` in a prefix/suffix.
 *
 * @param {Transform} transform
 * @param {Selection} range
 * @param {String} prefix
 * @param {String} suffix (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.wrapTextAtRange = function (transform, range, prefix) {
  var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : prefix;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize18 = options.normalize,
      normalize = _options$normalize18 === undefined ? true : _options$normalize18;
  var startKey = range.startKey,
      endKey = range.endKey;

  var start = range.collapseToStart();
  var end = range.collapseToEnd();

  if (startKey == endKey) {
    end = end.move(prefix.length);
  }

  transform.insertTextAtRange(start, prefix, [], { normalize: normalize });
  transform.insertTextAtRange(end, suffix, [], { normalize: normalize });
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../schemas/core":102,"../utils/normalize":129,"../utils/string":133}],110:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _core = require('../schemas/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Add mark to text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.addMarkByKey = function (transform, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = _normalize2.default.mark(mark);
  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.addMarkOperation(path, offset, length, mark);

  if (normalize) {
    var parent = document.getParent(key);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Insert a `node` at `index` in a node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} index
 * @param {Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.insertNodeByKey = function (transform, key, index, node) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize2 = options.normalize,
      normalize = _options$normalize2 === undefined ? true : _options$normalize2;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.insertNodeOperation(path, index, node);

  if (normalize) {
    transform.normalizeNodeByKey(key, _core2.default);
  }
};

/**
 * Insert `text` at `offset` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.insertTextByKey = function (transform, key, offset, text, marks) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var _options$normalize3 = options.normalize,
      normalize = _options$normalize3 === undefined ? true : _options$normalize3;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.insertTextOperation(path, offset, text, marks);

  if (normalize) {
    var parent = document.getParent(key);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Join a node by `key` with a node `withKey`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {String} withKey
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.joinNodeByKey = function (transform, key, withKey) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize4 = options.normalize,
      normalize = _options$normalize4 === undefined ? true : _options$normalize4;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  var withPath = document.getPath(withKey);

  transform.joinNodeOperation(path, withPath);

  if (normalize) {
    var parent = document.getCommonAncestor(key, withKey);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Move a node by `key` to a new parent by `newKey` and `index`.
 * `newKey` is the key of the container (it can be the document itself)
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {String} newKey
 * @param {Number} index
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.moveNodeByKey = function (transform, key, newKey, newIndex) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize5 = options.normalize,
      normalize = _options$normalize5 === undefined ? true : _options$normalize5;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);
  var newPath = document.getPath(newKey);

  transform.moveNodeOperation(path, newPath, newIndex);

  if (normalize) {
    var parent = document.getCommonAncestor(key, newKey);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Remove mark from text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.removeMarkByKey = function (transform, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = _normalize2.default.mark(mark);
  var _options$normalize6 = options.normalize,
      normalize = _options$normalize6 === undefined ? true : _options$normalize6;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.removeMarkOperation(path, offset, length, mark);

  if (normalize) {
    var parent = document.getParent(key);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Remove a node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.removeNodeByKey = function (transform, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$normalize7 = options.normalize,
      normalize = _options$normalize7 === undefined ? true : _options$normalize7;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.removeNodeOperation(path);

  if (normalize) {
    var parent = document.getParent(key);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Remove text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.removeTextByKey = function (transform, key, offset, length) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize8 = options.normalize,
      normalize = _options$normalize8 === undefined ? true : _options$normalize8;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.removeTextOperation(path, offset, length);

  if (normalize) {
    var block = document.getClosestBlock(key);
    transform.normalizeNodeByKey(block.key, _core2.default);
  }
};

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.setMarkByKey = function (transform, key, offset, length, mark, properties) {
  var options = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};

  mark = _normalize2.default.mark(mark);
  properties = _normalize2.default.markProperties(properties);
  var _options$normalize9 = options.normalize,
      normalize = _options$normalize9 === undefined ? true : _options$normalize9;

  var newMark = mark.merge(properties);
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.setMarkOperation(path, offset, length, mark, newMark);

  if (normalize) {
    var parent = document.getParent(key);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Set `properties` on a node by `key`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.setNodeByKey = function (transform, key, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _normalize2.default.nodeProperties(properties);
  var _options$normalize10 = options.normalize,
      normalize = _options$normalize10 === undefined ? true : _options$normalize10;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.setNodeOperation(path, properties);

  if (normalize) {
    var node = key === document.key ? document : document.getParent(key);
    transform.normalizeNodeByKey(node.key, _core2.default);
  }
};

/**
 * Split a node by `key` at `offset`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Number} offset
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.splitNodeByKey = function (transform, key, offset) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize11 = options.normalize,
      normalize = _options$normalize11 === undefined ? true : _options$normalize11;
  var state = transform.state;
  var document = state.document;

  var path = document.getPath(key);

  transform.splitNodeAtOffsetOperation(path, offset);

  if (normalize) {
    var parent = document.getParent(key);
    transform.normalizeNodeByKey(parent.key, _core2.default);
  }
};

/**
 * Unwrap content from an inline parent with `properties`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.unwrapInlineByKey = function (transform, key, properties, options) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  transform.unwrapInlineAtRange(range, properties, options);
};

/**
 * Unwrap content from a block parent with `properties`.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.unwrapBlockByKey = function (transform, key, properties, options) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  transform.unwrapBlockAtRange(range, properties, options);
};

/**
 * Unwrap a single node from its parent.
 *
 * If the node is surrounded with siblings, its parent will be
 * split. If the node is the only child, the parent is removed, and
 * simply replaced by the node itself.  Cannot unwrap a root node.
 *
 * @param {Transform} transform
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.unwrapNodeByKey = function (transform, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$normalize12 = options.normalize,
      normalize = _options$normalize12 === undefined ? true : _options$normalize12;
  var state = transform.state;
  var document = state.document;

  var parent = document.getParent(key);
  var node = parent.getChild(key);

  var index = parent.nodes.indexOf(node);
  var isFirst = index === 0;
  var isLast = index === parent.nodes.size - 1;

  var parentParent = document.getParent(parent.key);
  var parentIndex = parentParent.nodes.indexOf(parent);

  if (parent.nodes.size === 1) {
    transform.moveNodeByKey(key, parentParent.key, parentIndex, { normalize: false });
    transform.removeNodeByKey(parent.key, options);
  } else if (isFirst) {
    // Just move the node before its parent.
    transform.moveNodeByKey(key, parentParent.key, parentIndex, options);
  } else if (isLast) {
    // Just move the node after its parent.
    transform.moveNodeByKey(key, parentParent.key, parentIndex + 1, options);
  } else {
    var parentPath = document.getPath(parent.key);
    // Split the parent.
    transform.splitNodeOperation(parentPath, index);
    // Extract the node in between the splitted parent.
    transform.moveNodeByKey(key, parentParent.key, parentIndex + 1, { normalize: false });

    if (normalize) {
      transform.normalizeNodeByKey(parentParent.key, _core2.default);
    }
  }
};

/**
 * Wrap a node in an inline with `properties`.
 *
 * @param {Transform} transform
 * @param {String} key The node to wrap
 * @param {Block|Object|String} inline The wrapping inline (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.wrapInlineByKey = function (transform, key, inline, options) {
  inline = _normalize2.default.inline(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var document = transform.state.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  transform.insertNodeByKey(parent.key, index, inline, { normalize: false });
  transform.moveNodeByKey(node.key, inline.key, 0, options);
};

/**
 * Wrap a node in a block with `properties`.
 *
 * @param {Transform} transform
 * @param {String} key The node to wrap
 * @param {Block|Object|String} block The wrapping block (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Transforms.wrapBlockByKey = function (transform, key, block, options) {
  block = _normalize2.default.block(block);
  block = block.set('nodes', block.nodes.clear());

  var document = transform.state.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  transform.insertNodeByKey(parent.key, index, block, { normalize: false });
  transform.moveNodeByKey(node.key, block.key, 0, options);
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../schemas/core":102,"../utils/normalize":129}],111:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Call a `fn` as if it was a core transform. This is a convenience method to
 * make using non-core transforms easier to read and chain.
 *
 * @param {Transform} transform
 * @param {Function} fn
 * @param {Mixed} ...args
 */

Transforms.call = function (transform, fn) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  fn.apply(undefined, [transform].concat(args));
  return;
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{}],112:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _applyOperation = require('./apply-operation');

var _applyOperation2 = _interopRequireDefault(_applyOperation);

var _atCurrentRange = require('./at-current-range');

var _atCurrentRange2 = _interopRequireDefault(_atCurrentRange);

var _atRange = require('./at-range');

var _atRange2 = _interopRequireDefault(_atRange);

var _byKey = require('./by-key');

var _byKey2 = _interopRequireDefault(_byKey);

var _call = require('./call');

var _call2 = _interopRequireDefault(_call);

var _normalize = require('./normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _onHistory = require('./on-history');

var _onHistory2 = _interopRequireDefault(_onHistory);

var _onSelection = require('./on-selection');

var _onSelection2 = _interopRequireDefault(_onSelection);

var _operations = require('./operations');

var _operations2 = _interopRequireDefault(_operations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = _extends({}, _applyOperation2.default, _atCurrentRange2.default, _atRange2.default, _byKey2.default, _call2.default, _normalize2.default, _onHistory2.default, _onSelection2.default, _operations2.default);

},{"./apply-operation":107,"./at-current-range":108,"./at-range":109,"./by-key":110,"./call":111,"./normalize":113,"./on-history":114,"./on-selection":115,"./operations":116}],113:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _schema = require('../models/schema');

var _schema2 = _interopRequireDefault(_schema);

var _warn = require('../utils/warn');

var _warn2 = _interopRequireDefault(_warn);

var _immutable = (window.Immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Normalize the document and selection with a `schema`.
 *
 * @param {Transform} transform
 * @param {Schema} schema
 */

Transforms.normalize = function (transform, schema) {
  transform.normalizeDocument(schema);
  transform.normalizeSelection(schema);
};

/**
 * Normalize the document with a `schema`.
 *
 * @param {Transform} transform
 * @param {Schema} schema
 */

Transforms.normalizeDocument = function (transform, schema) {
  var state = transform.state;
  var document = state.document;

  transform.normalizeNodeByKey(document.key, schema);
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Transform} transform
 * @param {Node|String} key
 * @param {Schema} schema
 */

Transforms.normalizeNodeByKey = function (transform, key, schema) {
  assertSchema(schema);

  // If the schema has no validation rules, there's nothing to normalize.
  if (!schema.hasValidators) return;

  key = _normalize2.default.key(key);
  var state = transform.state;
  var document = state.document;

  var node = document.assertNode(key);

  normalizeNodeAndChildren(transform, node, schema);
};

/**
 * Normalize the selection.
 *
 * @param {Transform} transform
 */

Transforms.normalizeSelection = function (transform) {
  var state = transform.state;
  var _state = state,
      document = _state.document,
      selection = _state.selection;

  // If document is empty, return

  if (document.nodes.size === 0) {
    return;
  }

  selection = selection.normalize(document);

  // If the selection is unset, or the anchor or focus key in the selection are
  // pointing to nodes that no longer exist, warn (if not unset) and reset the selection.
  if (selection.isUnset || !document.hasDescendant(selection.anchorKey) || !document.hasDescendant(selection.focusKey)) {
    if (!selection.isUnset) {
      (0, _warn2.default)('The selection was invalid and was reset to start of the document. The selection in question was:', selection);
    }

    var firstText = document.getFirstText();
    selection = selection.merge({
      anchorKey: firstText.key,
      anchorOffset: 0,
      focusKey: firstText.key,
      focusOffset: 0,
      isBackward: false
    });
  }

  state = state.set('selection', selection);
  transform.state = state;
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNodeAndChildren(transform, node, schema) {
  if (node.kind == 'text') {
    normalizeNode(transform, node, schema);
    return;
  }

  // We can't just loop the children and normalize them, because in the process
  // of normalizing one child, we might end up creating another. Instead, we
  // have to normalize one at a time, and check for new children along the way.
  // PERF: use a mutable array here instead of an immutable stack.
  var keys = node.nodes.toArray().map(function (n) {
    return n.key;
  });

  // While there is still a child key that hasn't been normalized yet...

  var _loop = function _loop() {
    var ops = transform.operations.length;
    var key = void 0;

    // PERF: use a mutable set here since we'll be add to it a lot.
    var set = new _immutable.Set().asMutable();

    // Unwind the stack, normalizing every child and adding it to the set.
    while (key = keys[0]) {
      var child = node.getChild(key);
      normalizeNodeAndChildren(transform, child, schema);
      set.add(key);
      keys.shift();
    }

    // Turn the set immutable to be able to compare against it.
    set = set.asImmutable();

    // PERF: Only re-find the node and re-normalize any new children if
    // operations occured that might have changed it.
    if (transform.operations.length != ops) {
      node = refindNode(transform, node);

      // Add any new children back onto the stack.
      node.nodes.forEach(function (n) {
        if (set.has(n.key)) return;
        keys.unshift(n.key);
      });
    }
  };

  while (keys.length) {
    _loop();
  }

  // Normalize the node itself if it still exists.
  if (node) {
    normalizeNode(transform, node, schema);
  }
}

/**
 * Re-find a reference to a node that may have been modified or removed
 * entirely by a transform.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @return {Node}
 */

function refindNode(transform, node) {
  var state = transform.state;
  var document = state.document;

  return node.kind == 'document' ? document : document.getDescendant(node.key);
}

/**
 * Normalize a `node` with a `schema`, but not its children.
 *
 * @param {Transform} transform
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNode(transform, node, schema) {
  var max = schema.rules.length;
  var iterations = 0;

  function iterate(t, n) {
    var failure = n.validate(schema);
    if (!failure) return;

    // Run the `normalize` function for the rule with the invalid value.
    var value = failure.value,
        rule = failure.rule;

    rule.normalize(t, n, value);

    // Re-find the node reference, in case it was updated. If the node no longer
    // exists, we're done for this branch.
    n = refindNode(t, n);
    if (!n) return;

    // Increment the iterations counter, and check to make sure that we haven't
    // exceeded the max. Without this check, it's easy for the `validate` or
    // `normalize` function of a schema rule to be written incorrectly and for
    // an infinite invalid loop to occur.
    iterations++;

    if (iterations > max) {
      throw new Error('A schema rule could not be validated after sufficient iterations. This is usually due to a `rule.validate` or `rule.normalize` function of a schema being incorrectly written, causing an infinite loop.');
    }

    // Otherwise, iterate again.
    iterate(t, n);
  }

  iterate(transform, node);
}

/**
 * Assert that a `schema` exists.
 *
 * @param {Schema} schema
 */

function assertSchema(schema) {
  if (schema instanceof _schema2.default) {
    return;
  } else if (schema == null) {
    throw new Error('You must pass a `schema` object.');
  } else {
    throw new Error('You passed an invalid `schema` object: ' + schema + '.');
  }
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../models/schema":95,"../utils/normalize":129,"../utils/warn":134}],114:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Redo to the next state in the history.
 *
 * @param {Transform} transform
 */

Transforms.redo = function (transform) {
  var state = transform.state;
  var _state = state,
      history = _state.history;
  var _history = history,
      undos = _history.undos,
      redos = _history.redos;

  // If there's no next snapshot, abort.

  var next = redos.peek();
  if (!next) return;

  // Shift the next state into the undo stack.
  redos = redos.pop();
  undos = undos.push(next);

  // Replay the next operations.
  next.forEach(function (op) {
    transform.applyOperation(op);
  });

  // Update the history.
  state = transform.state;
  history = history.set('undos', undos).set('redos', redos);
  state = state.set('history', history);

  // Update the transform.
  transform.state = state;
};

/**
 * Save the operations into the history.
 *
 * @param {Transform} transform
 * @param {Object} options
 */

Transforms.save = function (transform) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$merge = options.merge,
      merge = _options$merge === undefined ? false : _options$merge;
  var state = transform.state,
      operations = transform.operations;
  var _state2 = state,
      history = _state2.history;
  var _history2 = history,
      undos = _history2.undos,
      redos = _history2.redos;

  var previous = undos.peek();

  // If there are no operations, abort.
  if (!operations.length) return;

  // Create a new save point or merge the operations into the previous one.
  if (merge && previous) {
    undos = undos.pop();
    previous = previous.concat(operations);
    undos = undos.push(previous);
  } else {
    undos = undos.push(operations);
  }

  // Clear the redo stack and constrain the undos stack.
  if (undos.size > 100) undos = undos.take(100);
  redos = redos.clear();

  // Update the state.
  history = history.set('undos', undos).set('redos', redos);
  state = state.set('history', history);

  // Update the transform.
  transform.state = state;
};

/**
 * Undo the previous operations in the history.
 *
 * @param {Transform} transform
 */

Transforms.undo = function (transform) {
  var state = transform.state;
  var _state3 = state,
      history = _state3.history;
  var _history3 = history,
      undos = _history3.undos,
      redos = _history3.redos;

  // If there's no previous snapshot, abort.

  var previous = undos.peek();
  if (!previous) return;

  // Shift the previous operations into the redo stack.
  undos = undos.pop();
  redos = redos.push(previous);

  // Replay the inverse of the previous operations.
  previous.slice().reverse().forEach(function (op) {
    op.inverse.forEach(function (inv) {
      transform.applyOperation(inv);
    });
  });

  // Update the history.
  state = transform.state;
  history = history.set('undos', undos).set('redos', redos);
  state = state.set('history', history);

  // Update the transform.
  transform.state = state;
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{}],115:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _warn = require('../utils/warn');

var _warn2 = _interopRequireDefault(_warn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Set `properties` on the selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

Transforms.select = function (transform, properties) {
  transform.setSelectionOperation(properties);
};

/**
 * Selects the whole selection.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

Transforms.selectAll = function (transform) {
  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var next = selection.moveToRangeOf(document);
  transform.setSelectionOperation(next);
};

/**
 * Snapshot the current selection.
 *
 * @param {Transform} transform
 */

Transforms.snapshotSelection = function (transform) {
  var state = transform.state;
  var selection = state.selection;

  transform.setSelectionOperation(selection, { snapshot: true });
};

/**
 * Set `properties` on the selection.
 *
 * @param {Mixed} ...args
 * @param {Transform} transform
 */

Transforms.moveTo = function (transform, properties) {
  (0, _warn2.default)('The `moveTo()` transform is deprecated, please use `select()` instead.');
  transform.select(properties);
};

/**
 * Unset the selection's marks.
 *
 * @param {Transform} transform
 */

Transforms.unsetMarks = function (transform) {
  (0, _warn2.default)('The `unsetMarks()` transform is deprecated.');
  transform.setSelectionOperation({ marks: null });
};

/**
 * Unset the selection, removing an association to a node.
 *
 * @param {Transform} transform
 */

Transforms.unsetSelection = function (transform) {
  (0, _warn2.default)('The `unsetSelection()` transform is deprecated, please use `deselect()` instead.');
  transform.setSelectionOperation({
    anchorKey: null,
    anchorOffset: 0,
    focusKey: null,
    focusOffset: 0,
    isFocused: false,
    isBackward: false
  });
};

/**
 * Mix in selection transforms that are just a proxy for the selection method.
 */

var PROXY_TRANSFORMS = ['blur', 'collapseTo', 'collapseToAnchor', 'collapseToEnd', 'collapseToEndOf', 'collapseToFocus', 'collapseToStart', 'collapseToStartOf', 'extend', 'extendTo', 'extendToEndOf', 'extendToStartOf', 'flip', 'focus', 'move', 'moveAnchor', 'moveAnchorOffsetTo', 'moveAnchorTo', 'moveAnchorToEndOf', 'moveAnchorToStartOf', 'moveEnd', 'moveEndOffsetTo', 'moveEndTo', 'moveFocus', 'moveFocusOffsetTo', 'moveFocusTo', 'moveFocusToEndOf', 'moveFocusToStartOf', 'moveOffsetsTo', 'moveStart', 'moveStartOffsetTo', 'moveStartTo',
// 'moveTo', Commented out for now, since it conflicts with a deprecated one.
'moveToEnd', 'moveToEndOf', 'moveToRangeOf', 'moveToStart', 'moveToStartOf', 'deselect'];

PROXY_TRANSFORMS.forEach(function (method) {
  Transforms[method] = function (transform) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var normalize = method != 'deselect';
    var state = transform.state;
    var document = state.document,
        selection = state.selection;

    var next = selection[method].apply(selection, args);
    if (normalize) next = next.normalize(document);
    transform.setSelectionOperation(next);
  };
});

/**
 * Mix in node-related transforms.
 */

var PREFIXES = ['moveTo', 'collapseTo', 'extendTo'];

var DIRECTIONS = ['Next', 'Previous'];

var KINDS = ['Block', 'Inline', 'Text'];

PREFIXES.forEach(function (prefix) {
  var edges = ['Start', 'End'];

  if (prefix == 'moveTo') {
    edges.push('Range');
  }

  edges.forEach(function (edge) {
    DIRECTIONS.forEach(function (direction) {
      KINDS.forEach(function (kind) {
        var get = 'get' + direction + kind;
        var getAtRange = 'get' + kind + 'sAtRange';
        var index = direction == 'Next' ? 'last' : 'first';
        var method = '' + prefix + edge + 'Of';
        var name = '' + method + direction + kind;

        Transforms[name] = function (transform) {
          var state = transform.state;
          var document = state.document,
              selection = state.selection;

          var nodes = document[getAtRange](selection);
          var node = nodes[index]();
          var target = document[get](node.key);
          if (!target) return;
          var next = selection[method](target);
          transform.setSelectionOperation(next);
        };
      });
    });
  });
});

/**
 * Mix in deprecated transforms with a warning.
 */

var DEPRECATED_TRANSFORMS = [['extendBackward', 'extend', 'The `extendBackward(n)` transform is deprecated, please use `extend(n)` instead with a negative offset.'], ['extendForward', 'extend', 'The `extendForward(n)` transform is deprecated, please use `extend(n)` instead.'], ['moveBackward', 'move', 'The `moveBackward(n)` transform is deprecated, please use `move(n)` instead with a negative offset.'], ['moveForward', 'move', 'The `moveForward(n)` transform is deprecated, please use `move(n)` instead.'], ['moveStartOffset', 'moveStart', 'The `moveStartOffset(n)` transform is deprecated, please use `moveStart(n)` instead.'], ['moveEndOffset', 'moveEnd', 'The `moveEndOffset(n)` transform is deprecated, please use `moveEnd()` instead.'], ['moveToOffsets', 'moveOffsetsTo', 'The `moveToOffsets()` transform is deprecated, please use `moveOffsetsTo()` instead.'], ['flipSelection', 'flip', 'The `flipSelection()` transform is deprecated, please use `flip()` instead.']];

DEPRECATED_TRANSFORMS.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 3),
      old = _ref2[0],
      current = _ref2[1],
      warning = _ref2[2];

  Transforms[old] = function (transform) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    (0, _warn2.default)(warning);
    var state = transform.state;
    var document = state.document,
        selection = state.selection;

    var sel = selection[current].apply(selection, args).normalize(document);
    transform.setSelectionOperation(sel);
  };
});

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../utils/warn":134}],116:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _normalize = require('../utils/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms.
 *
 * @type {Object}
 */

var Transforms = {};

/**
 * Add mark to text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 */

Transforms.addMarkOperation = function (transform, path, offset, length, mark) {
  var inverse = [{
    type: 'remove_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark
  }];

  var operation = {
    type: 'add_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Insert a `node` at `index` in a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} index
 * @param {Node} node
 */

Transforms.insertNodeOperation = function (transform, path, index, node) {
  var inversePath = path.slice().concat([index]);
  var inverse = [{
    type: 'remove_node',
    path: inversePath
  }];

  var operation = {
    type: 'insert_node',
    path: path,
    index: index,
    node: node,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Insert `text` at `offset` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 */

Transforms.insertTextOperation = function (transform, path, offset, text, marks) {
  var inverseLength = text.length;
  var inverse = [{
    type: 'remove_text',
    path: path,
    offset: offset,
    length: inverseLength
  }];

  var operation = {
    type: 'insert_text',
    path: path,
    offset: offset,
    text: text,
    marks: marks,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Join a node by `path` with a node `withPath`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Array} withPath
 */

Transforms.joinNodeOperation = function (transform, path, withPath) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(withPath);

  var inverse = void 0;
  if (node.kind === 'text') {
    var offset = node.length;

    inverse = [{
      type: 'split_node',
      path: withPath,
      offset: offset
    }];
  } else {
    // The number of children after which we split
    var count = node.nodes.count();

    inverse = [{
      type: 'split_node',
      path: withPath,
      count: count
    }];
  }

  var operation = {
    type: 'join_node',
    path: path,
    withPath: withPath,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Move a node by `path` to a `newPath` and `newIndex`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Array} newPath
 * @param {Number} newIndex
 */

Transforms.moveNodeOperation = function (transform, path, newPath, newIndex) {
  var parentPath = path.slice(0, -1);
  var parentIndex = path[path.length - 1];
  var inversePath = newPath.slice().concat([newIndex]);

  var inverse = [{
    type: 'move_node',
    path: inversePath,
    newPath: parentPath,
    newIndex: parentIndex
  }];

  var operation = {
    type: 'move_node',
    path: path,
    newPath: newPath,
    newIndex: newIndex,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Remove mark from text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 */

Transforms.removeMarkOperation = function (transform, path, offset, length, mark) {
  var inverse = [{
    type: 'add_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark
  }];

  var operation = {
    type: 'remove_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Remove a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 */

Transforms.removeNodeOperation = function (transform, path) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var inversePath = path.slice(0, -1);
  var inverseIndex = path[path.length - 1];

  var inverse = [{
    type: 'insert_node',
    path: inversePath,
    index: inverseIndex,
    node: node
  }];

  var operation = {
    type: 'remove_node',
    path: path,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Remove text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 */

Transforms.removeTextOperation = function (transform, path, offset, length) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var ranges = node.getRanges();
  var inverse = [];

  // Loop the ranges of text in the node, creating inverse insert operations for
  // each of the ranges that overlap with the remove operation. This is
  // necessary because insert's can only have a single set of marks associated
  // with them, but removes can remove many.
  ranges.reduce(function (start, range) {
    var text = range.text,
        marks = range.marks;

    var end = start + text.length;
    if (start > offset + length) return end;
    if (end <= offset) return end;

    var endOffset = Math.min(end, offset + length);
    var string = text.slice(offset - start, endOffset - start);

    inverse.push({
      type: 'insert_text',
      path: path,
      offset: offset,
      text: string,
      marks: marks
    });

    return end;
  }, 0);

  var operation = {
    type: 'remove_text',
    path: path,
    offset: offset,
    length: length,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Merge `properties` into state `data`.
 *
 * @param {Transform} transform
 * @param {Object} properties
 */

Transforms.setDataOperation = function (transform, properties) {
  var state = transform.state;
  var data = state.data;

  var inverseProps = {};

  for (var k in properties) {
    inverseProps[k] = data[k];
  }

  var inverse = [{
    type: 'set_data',
    properties: inverseProps
  }];

  var operation = {
    type: 'set_data',
    properties: properties,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Mark} newMark
 */

Transforms.setMarkOperation = function (transform, path, offset, length, mark, newMark) {
  var inverse = [{
    type: 'set_mark',
    path: path,
    offset: offset,
    length: length,
    mark: newMark,
    newMark: mark
  }];

  var operation = {
    type: 'set_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    newMark: newMark,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Set `properties` on a node by `path`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Object} properties
 */

Transforms.setNodeOperation = function (transform, path, properties) {
  var state = transform.state;
  var document = state.document;

  var node = document.assertPath(path);
  var inverseProps = {};

  for (var k in properties) {
    inverseProps[k] = node[k];
  }

  var inverse = [{
    type: 'set_node',
    path: path,
    properties: inverseProps
  }];

  var operation = {
    type: 'set_node',
    path: path,
    properties: properties,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Set the selection to a new `selection`.
 *
 * @param {Transform} transform
 * @param {Mixed} selection
 */

Transforms.setSelectionOperation = function (transform, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  properties = _normalize2.default.selectionProperties(properties);

  var state = transform.state;
  var document = state.document,
      selection = state.selection;

  var prevProps = {};
  var props = {};

  // Remove any properties that are already equal to the current selection. And
  // create a dictionary of the previous values for all of the properties that
  // are being changed, for the inverse operation.
  for (var k in properties) {
    if (!options.snapshot && properties[k] == selection[k]) continue;
    props[k] = properties[k];
    prevProps[k] = selection[k];
  }

  // If the selection moves, clear any marks, unless the new selection
  // does change the marks in some way
  var moved = ['anchorKey', 'anchorOffset', 'focusKey', 'focusOffset'].some(function (p) {
    return props.hasOwnProperty(p);
  });

  if (selection.marks && properties.marks == selection.marks && moved) {
    props.marks = null;
  }

  // Resolve the selection keys into paths.
  if (props.anchorKey) {
    props.anchorPath = document.getPath(props.anchorKey);
    delete props.anchorKey;
  }

  if (prevProps.anchorKey) {
    prevProps.anchorPath = document.getPath(prevProps.anchorKey);
    delete prevProps.anchorKey;
  }

  if (props.focusKey) {
    props.focusPath = document.getPath(props.focusKey);
    delete props.focusKey;
  }

  if (prevProps.focusKey) {
    prevProps.focusPath = document.getPath(prevProps.focusKey);
    delete prevProps.focusKey;
  }

  // Define an inverse of the operation for undoing.
  var inverse = [{
    type: 'set_selection',
    properties: prevProps
  }];

  // Define the operation.
  var operation = {
    type: 'set_selection',
    properties: props,
    inverse: inverse
  };

  // Apply the operation.
  transform.applyOperation(operation);
};

/**
 * Split a node by `path` at `offset`.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} offset
 */

Transforms.splitNodeAtOffsetOperation = function (transform, path, offset) {
  var inversePath = path.slice();
  inversePath[path.length - 1] += 1;

  var inverse = [{
    type: 'join_node',
    path: inversePath,
    withPath: path,
    // We will split down to the text nodes, so we must join nodes recursively.
    deep: true
  }];

  var operation = {
    type: 'split_node',
    path: path,
    offset: offset,
    count: null,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Split a node by `path` after its 'count' child.
 *
 * @param {Transform} transform
 * @param {Array} path
 * @param {Number} count
 */

Transforms.splitNodeOperation = function (transform, path, count) {
  var inversePath = path.slice();
  inversePath[path.length - 1] += 1;

  var inverse = [{
    type: 'join_node',
    path: inversePath,
    withPath: path,
    deep: false
  }];

  var operation = {
    type: 'split_node',
    path: path,
    offset: null,
    count: count,
    inverse: inverse
  };

  transform.applyOperation(operation);
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Transforms;

},{"../utils/normalize":129}],117:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Extends the given selection to a given node and offset
 *
 * @param {Selection} selection Selection instance
 * @param {Element} el Node to extend to
 * @param {Number} offset Text offset to extend to
 * @returns {Selection} Mutated Selection instance
 */

function extendSelection(selection, el, offset) {
  // Use native method when possible
  if (typeof selection.extend === 'function') return selection.extend(el, offset);

  // See https://gist.github.com/tyler-johnson/0a3e8818de3f115b2a2dc47468ac0099
  var range = document.createRange();
  var anchor = document.createRange();
  anchor.setStart(selection.anchorNode, selection.anchorOffset);

  var focus = document.createRange();
  focus.setStart(el, offset);

  var v = focus.compareBoundaryPoints(Range.START_TO_START, anchor);
  if (v >= 0) {
    // Focus is after anchor
    range.setStart(selection.anchorNode, selection.anchorOffset);
    range.setEnd(el, offset);
  } else {
    // Anchor is after focus
    range.setStart(el, offset);
    range.setEnd(selection.anchorNode, selection.anchorOffset);
  }

  selection.removeAllRanges();
  selection.addRange(range);

  return selection;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = extendSelection;

},{}],118:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Find the closest ancestor of a DOM `element` that matches a given selector.
 *
 * @param {Element} node
 * @param {String} selector
 * @return {Element}
 */

function findClosestNode(node, selector) {
  if (typeof node.closest === 'function') return node.closest(selector);

  // See https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
  var matches = (node.document || node.ownerDocument).querySelectorAll(selector);
  var i = void 0;
  var parentNode = node;
  do {
    i = matches.length;
    while (--i >= 0 && matches.item(i) !== parentNode) {}
  } while (i < 0 && (parentNode = parentNode.parentElement));

  return parentNode;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findClosestNode;

},{}],119:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Find the deepest descendant of a DOM `element`.
 *
 * @param {Element} node
 * @return {Element}
 */

function findDeepestNode(element) {
  return element.firstChild ? findDeepestNode(element.firstChild) : element;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findDeepestNode;

},{}],120:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Find the DOM node for a `node`.
 *
 * @param {Node} node
 * @return {Element}
 */

function findDOMNode(node) {
  var el = window.document.querySelector("[data-key=\"" + node.key + "\"]");

  if (!el) {
    throw new Error("Unable to find a DOM node for \"" + node.key + "\". This is\noften because of forgetting to add `props.attributes` to a component\nreturned from `renderNode`.");
  }

  return el;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = findDOMNode;

},{}],121:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * An auto-incrementing index for generating keys.
 *
 * @type {Number}
 */

var n = void 0;

/**
 * The global key generating function.
 *
 * @type {Function}
 */

var generate = void 0;

/**
 * Generate a key.
 *
 * @return {String}
 */

function generateKey() {
  return generate();
}

/**
 * Set a different unique ID generating `function`.
 *
 * @param {Function} func
 */

function setKeyGenerator(func) {
  generate = func;
}

/**
 * Reset the key generating function to its initial state.
 */

function resetKeyGenerator() {
  n = 0;
  generate = function generate() {
    return "" + n++;
  };
}

/**
 * Set the initial state.
 */

resetKeyGenerator();

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = generateKey;
exports.setKeyGenerator = setKeyGenerator;
exports.resetKeyGenerator = resetKeyGenerator;

},{}],122:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _offsetKey = require('./offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get a point from a native selection's DOM `element` and `offset`.
 *
 * @param {Element} element
 * @param {Number} offset
 * @param {State} state
 * @param {Editor} editor
 * @return {Object}
 */

function getPoint(element, offset, state, editor) {
  var document = state.document;

  var schema = editor.getSchema();

  // If we can't find an offset key, we can't get a point.
  var offsetKey = _offsetKey2.default.findKey(element, offset);
  if (!offsetKey) return null;

  // COMPAT: If someone is clicking from one Slate editor into another, the
  // select event fires two, once for the old editor's `element` first, and
  // then afterwards for the correct `element`. (2017/03/03)
  var key = offsetKey.key;

  var node = document.getDescendant(key);
  if (!node) return null;

  var decorators = document.getDescendantDecorators(key, schema);
  var ranges = node.getRanges(decorators);
  var point = _offsetKey2.default.findPoint(offsetKey, ranges);
  return point;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getPoint;

},{"./offset-key":130}],123:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _base = require('../serializers/base-64');

var _base2 = _interopRequireDefault(_base);

var _types = require('../constants/types');

var _types2 = _interopRequireDefault(_types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Fragment matching regexp for HTML nodes.
 *
 * @type {RegExp}
 */

var FRAGMENT_MATCHER = / data-slate-fragment="([^\s]+)"/;

/**
 * Get the data and type from a native data `transfer`.
 *
 * @param {DataTransfer} transfer
 * @return {Object}
 */

function getTransferData(transfer) {
  var fragment = transfer.getData(_types2.default.FRAGMENT) || null;
  var node = transfer.getData(_types2.default.NODE) || null;
  var html = transfer.getData('text/html') || null;
  var rich = transfer.getData('text/rtf') || null;
  var text = transfer.getData('text/plain') || null;
  var files = void 0;

  // If there isn't a fragment, but there is HTML, check to see if the HTML is
  // actually an encoded fragment.
  if (!fragment && html && ~html.indexOf(' data-slate-fragment="')) {
    var matches = FRAGMENT_MATCHER.exec(html);

    var _matches = _slicedToArray(matches, 2),
        full = _matches[0],
        encoded = _matches[1]; // eslint-disable-line no-unused-vars


    if (encoded) fragment = encoded;
  }

  // COMPAT: Edge doesn't handle custom data types
  // These will be embedded in text/plain in this case (2017/7/12)
  if (text) {
    var embeddedTypes = getEmbeddedTypes(text);

    if (embeddedTypes[_types2.default.FRAGMENT]) fragment = embeddedTypes[_types2.default.FRAGMENT];
    if (embeddedTypes[_types2.default.NODE]) node = embeddedTypes[_types2.default.NODE];
    if (embeddedTypes['text/plain']) text = embeddedTypes['text/plain'];
  }

  // Decode a fragment or node if they exist.
  if (fragment) fragment = _base2.default.deserializeNode(fragment);
  if (node) node = _base2.default.deserializeNode(node);

  // COMPAT: Edge sometimes throws 'NotSupportedError'
  // when accessing `transfer.items` (2017/7/12)
  try {
    // Get and normalize files if they exist.
    if (transfer.items && transfer.items.length) {
      files = Array.from(transfer.items).map(function (item) {
        return item.kind == 'file' ? item.getAsFile() : null;
      }).filter(function (exists) {
        return exists;
      });
    } else if (transfer.files && transfer.files.length) {
      files = Array.from(transfer.files);
    }
  } catch (err) {
    if (transfer.files && transfer.files.length) {
      files = Array.from(transfer.files);
    }
  }

  // Determine the type of the data.
  var data = { files: files, fragment: fragment, html: html, node: node, rich: rich, text: text };
  data.type = getTransferType(data);
  return data;
}

/**
 * Takes text input, checks whether contains embedded data
 * and returns object with original text +/- additional data
 *
 * @param {String} text
 * @return {Object}
 */

function getEmbeddedTypes(text) {
  var prefix = 'SLATE-DATA-EMBED::';

  if (text.substring(0, prefix.length) !== prefix) {
    return { 'text/plain': text };
  }

  // Attempt to parse, if fails then just standard text/plain
  // Otherwise, already had data embedded
  try {
    return JSON.parse(text.substring(prefix.length));
  } catch (err) {
    throw new Error('Unable to parse custom embedded drag data');
  }
}

/**
 * Get the type of a transfer from its `data`.
 *
 * @param {Object} data
 * @return {String}
 */

function getTransferType(data) {
  if (data.fragment) return 'fragment';
  if (data.node) return 'node';

  // COMPAT: Microsoft Word adds an image of the selected text to the data.
  // Since files are preferred over HTML or text, this would cause the type to
  // be considered `files`. But it also adds rich text data so we can check
  // for that and properly set the type to `html` or `text`. (2016/11/21)
  if (data.rich && data.html) return 'html';
  if (data.rich && data.text) return 'text';

  if (data.files && data.files.length) return 'files';
  if (data.html) return 'html';
  if (data.text) return 'text';
  return 'unknown';
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = getTransferData;

},{"../constants/types":85,"../serializers/base-64":103}],124:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Check if an `index` of a `text` node is in a `range`.
 *
 * @param {Number} index
 * @param {Text} text
 * @param {Selection} range
 * @return {Boolean}
 */

function isInRange(index, text, range) {
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (text.key == startKey && text.key == endKey) {
    return startOffset <= index && index < endOffset;
  } else if (text.key == startKey) {
    return startOffset <= index;
  } else if (text.key == endKey) {
    return index < endOffset;
  } else {
    return true;
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = isInRange;

},{}],125:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Check if an `object` is a React component.
 *
 * @param {Object} object
 * @return {Boolean}
 */

function isReactComponent(object) {
  return object && object.prototype && object.prototype.isReactComponent;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = isReactComponent;

},{}],126:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__enable = exports.__clear = exports.default = undefined;

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _isDev = require('../constants/is-dev');

var _isDev2 = _interopRequireDefault(_isDev);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * GLOBAL: True if memoization should is enabled. Only effective when `IS_DEV`.
 *
 * @type {Boolean}
 */

var ENABLED = true;

/**
 * GLOBAL: Changing this cache key will clear all previous cached results.
 * Only effective when `IS_DEV`.
 *
 * @type {Number}
 */

var CACHE_KEY = 0;

/**
 * The leaf node of a cache tree. Used to support variable argument length. A
 * unique object, so that native Maps will key it by reference.
 *
 * @type {Object}
 */

var LEAF = {};

/**
 * A value to represent a memoized undefined value. Allows efficient value
 * retrieval using Map.get only.
 *
 * @type {Object}
 */

var UNDEFINED = {};

/**
 * Default value for unset keys in native Maps
 *
 * @type {Undefined}
 */

var UNSET = undefined;

/**
 * Memoize all of the `properties` on a `object`.
 *
 * @param {Object} object
 * @param {Array} properties
 * @return {Record}
 */

function memoize(object, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$takesArgumen = options.takesArguments,
      takesArguments = _options$takesArgumen === undefined ? true : _options$takesArgumen;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var property = _step.value;

      var original = object[property];

      if (!original) {
        throw new Error('Object does not have a property named "' + property + '".');
      }

      object[property] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (_isDev2.default) {
          // If memoization is disabled, call into the original method.
          if (!ENABLED) return original.apply(this, args);

          // If the cache key is different, previous caches must be cleared.
          if (CACHE_KEY !== this.__cache_key) {
            this.__cache_key = CACHE_KEY;
            this.__cache = new _es6Map2.default();
          }
        }

        if (!this.__cache) {
          this.__cache = new _es6Map2.default();
        }

        var cachedValue = void 0;
        var keys = void 0;

        if (takesArguments) {
          keys = [property].concat(args);
          cachedValue = getIn(this.__cache, keys);
        } else {
          cachedValue = this.__cache.get(property);
        }

        // If we've got a result already, return it.
        if (cachedValue !== UNSET) {
          return cachedValue === UNDEFINED ? undefined : cachedValue;
        }

        // Otherwise calculate what it should be once and cache it.
        var value = original.apply(this, args);
        var v = value === undefined ? UNDEFINED : value;

        if (takesArguments) {
          this.__cache = setIn(this.__cache, keys, v);
        } else {
          this.__cache.set(property, v);
        }

        return value;
      };
    };

    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

/**
 * Get a value at a key path in a tree of Map.
 *
 * If not set, returns UNSET.
 * If the set value is undefined, returns UNDEFINED.
 *
 * @param {Map} map
 * @param {Array} keys
 * @return {Any|UNSET|UNDEFINED}
 */

function getIn(map, keys) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      map = map.get(key);
      if (map === UNSET) return UNSET;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return map.get(LEAF);
}

/**
 * Set a value at a key path in a tree of Map, creating Maps on the go.
 *
 * @param {Map} map
 * @param {Array} keys
 * @param {Any} value
 * @return {Map}
 */

function setIn(map, keys, value) {
  var parent = map;
  var child = void 0;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      child = parent.get(key);

      // If the path was not created yet...
      if (child === UNSET) {
        child = new _es6Map2.default();
        parent.set(key, child);
      }

      parent = child;
    }

    // The whole path has been created, so set the value to the bottom most map.
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  child.set(LEAF, value);
  return map;
}

/**
 * In DEV mode, clears the previously memoized values, globally.
 *
 * @return {Void}
 */

function __clear() {
  CACHE_KEY++;

  if (CACHE_KEY >= Number.MAX_SAFE_INTEGER) {
    CACHE_KEY = 0;
  }
}

/**
 * In DEV mode, enable or disable the use of memoize values, globally.
 *
 * @param {Boolean} enabled
 * @return {Void}
 */

function __enable(enabled) {
  ENABLED = enabled;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = memoize;
exports.__clear = __clear;
exports.__enable = __enable;

},{"../constants/is-dev":84,"es6-map":45}],127:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Noop.
 *
 * @return {Void}
 */

function noop() {}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = noop;

},{}],128:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * From a DOM selection's `node` and `offset`, normalize so that it always
 * refers to a text node.
 *
 * @param {Element} node
 * @param {Number} offset
 * @return {Object}
 */

function normalizeNodeAndOffset(node, offset) {
  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (node.nodeType == 1 && node.childNodes.length) {
    var isLast = offset == node.childNodes.length;
    var direction = isLast ? 'backward' : 'forward';
    var index = isLast ? offset - 1 : offset;
    node = getEditableChild(node, index, direction);

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (node.nodeType == 1 && node.childNodes.length) {
      var i = isLast ? node.childNodes.length - 1 : 0;
      node = getEditableChild(node, i, direction);
    }

    // Determine the new offset inside the text node.
    offset = isLast ? node.textContent.length : 0;
  }

  // Return the node and offset.
  return { node: node, offset: offset };
}

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 *
 * @param {Element} parent
 * @param {Number} index
 * @param {String} direction ('forward' or 'backward')
 * @return {Element|Null}
 */

function getEditableChild(parent, index, direction) {
  var childNodes = parent.childNodes;

  var child = childNodes[index];
  var i = index;
  var triedForward = false;
  var triedBackward = false;

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (child.nodeType == 8 || child.nodeType == 1 && child.childNodes.length == 0 || child.nodeType == 1 && child.getAttribute('contenteditable') == 'false') {
    if (triedForward && triedBackward) break;

    if (i >= childNodes.length) {
      triedForward = true;
      i = index - 1;
      direction = 'backward';
      continue;
    }

    if (i < 0) {
      triedBackward = true;
      i = index + 1;
      direction = 'forward';
      continue;
    }

    child = childNodes[i];
    if (direction == 'forward') i++;
    if (direction == 'backward') i--;
  }

  return child || null;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = normalizeNodeAndOffset;

},{}],129:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _document = require('../models/document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _data = require('../models/data');

var _data2 = _interopRequireDefault(_data);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _selection = require('../models/selection');

var _selection2 = _interopRequireDefault(_selection);

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

var _warn = require('./warn');

var _warn2 = _interopRequireDefault(_warn);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Normalize a block argument `value`.
 *
 * @param {Block|String|Object} value
 * @return {Block}
 */

function block(value) {
  if (value instanceof _block2.default) return value;

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
    case 'object':
      return _block2.default.create(nodeProperties(value));

    default:
      throw new Error('Invalid `block` argument! It must be a block, an object, or a string. You passed: "' + value + '".');
  }
}

/**
 * Normalize an inline argument `value`.
 *
 * @param {Inline|String|Object} value
 * @return {Inline}
 */

function inline(value) {
  if (value instanceof _inline2.default) return value;

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
    case 'object':
      return _inline2.default.create(nodeProperties(value));

    default:
      throw new Error('Invalid `inline` argument! It must be an inline, an object, or a string. You passed: "' + value + '".');
  }
}

/**
 * Normalize a key argument `value`.
 *
 * @param {String|Node} value
 * @return {String}
 */

function key(value) {
  if ((0, _typeOf2.default)(value) == 'string') return value;

  (0, _warn2.default)('An object was passed to a Node method instead of a `key` string. This was previously supported, but is being deprecated because it can have a negative impact on performance. The object in question was:', value);
  if (value instanceof _block2.default) return value.key;
  if (value instanceof _document2.default) return value.key;
  if (value instanceof _inline2.default) return value.key;
  if (value instanceof _text2.default) return value.key;

  throw new Error('Invalid `key` argument! It must be either a block, an inline, a text, or a string. You passed: "' + value + '".');
}

/**
 * Normalize a mark argument `value`.
 *
 * @param {Mark|String|Object} value
 * @return {Mark}
 */

function mark(value) {
  if (value instanceof _mark2.default) return value;

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
    case 'object':
      return _mark2.default.create(markProperties(value));

    default:
      throw new Error('Invalid `mark` argument! It must be a mark, an object, or a string. You passed: "' + value + '".');
  }
}

/**
 * Normalize a mark properties argument `value`.
 *
 * @param {String|Object|Mark} value
 * @return {Object}
 */

function markProperties() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
      ret.type = value;
      break;

    case 'object':
      for (var k in value) {
        if (k == 'data') {
          if (value[k] !== undefined) ret[k] = _data2.default.create(value[k]);
        } else {
          ret[k] = value[k];
        }
      }
      break;

    default:
      throw new Error('Invalid mark `properties` argument! It must be an object, a string or a mark. You passed: "' + value + '".');
  }

  return ret;
}

/**
 * Normalize a node properties argument `value`.
 *
 * @param {String|Object|Node} value
 * @return {Object}
 */

function nodeProperties() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};

  switch ((0, _typeOf2.default)(value)) {
    case 'string':
      ret.type = value;
      break;

    case 'object':
      if (value.isVoid !== undefined) ret.isVoid = !!value.isVoid;
      for (var k in value) {
        if (k == 'data') {
          if (value[k] !== undefined) ret[k] = _data2.default.create(value[k]);
        } else {
          ret[k] = value[k];
        }
      }
      break;

    default:
      throw new Error('Invalid node `properties` argument! It must be an object, a string or a node. You passed: "' + value + '".');
  }

  return ret;
}

/**
 * Normalize a selection argument `value`.
 *
 * @param {Selection|Object} value
 * @return {Selection}
 */

function selection(value) {
  if (value instanceof _selection2.default) return value;

  switch ((0, _typeOf2.default)(value)) {
    case 'object':
      return _selection2.default.create(value);

    default:
      throw new Error('Invalid `selection` argument! It must be a selection or an object. You passed: "' + value + '".');
  }
}

/**
 * Normalize a selection properties argument `value`.
 *
 * @param {Object|Selection} value
 * @return {Object}
 */

function selectionProperties() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var ret = {};

  switch ((0, _typeOf2.default)(value)) {
    case 'object':
      if (value.anchorKey !== undefined) ret.anchorKey = value.anchorKey;
      if (value.anchorOffset !== undefined) ret.anchorOffset = value.anchorOffset;
      if (value.focusKey !== undefined) ret.focusKey = value.focusKey;
      if (value.focusOffset !== undefined) ret.focusOffset = value.focusOffset;
      if (value.isBackward !== undefined) ret.isBackward = !!value.isBackward;
      if (value.isFocused !== undefined) ret.isFocused = !!value.isFocused;
      if (value.marks !== undefined) ret.marks = value.marks;
      break;

    default:
      throw new Error('Invalid selection `properties` argument! It must be an object or a selection. You passed: "' + value + '".');
  }

  return ret;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  block: block,
  inline: inline,
  key: key,
  mark: mark,
  markProperties: markProperties,
  nodeProperties: nodeProperties,
  selection: selection,
  selectionProperties: selectionProperties
};

},{"../models/block":87,"../models/data":89,"../models/document":90,"../models/inline":91,"../models/mark":92,"../models/selection":96,"../models/text":99,"./warn":134,"type-of":76}],130:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _normalizeNodeAndOffset = require('./normalize-node-and-offset');

var _normalizeNodeAndOffset2 = _interopRequireDefault(_normalizeNodeAndOffset);

var _findClosestNode = require('./find-closest-node');

var _findClosestNode2 = _interopRequireDefault(_findClosestNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Offset key parser regex.
 *
 * @type {RegExp}
 */

var PARSER = /^(\w+)(?:-(\d+))?$/;

/**
 * Offset key attribute name.
 *
 * @type {String}
 */

var ATTRIBUTE = 'data-offset-key';

/**
 * Offset key attribute selector.
 *
 * @type {String}
 */

var SELECTOR = '[' + ATTRIBUTE + ']';

/**
 * Void node selection.
 *
 * @type {String}
 */

var VOID_SELECTOR = '[data-slate-void]';

/**
 * Find the start and end bounds from an `offsetKey` and `ranges`.
 *
 * @param {Number} index
 * @param {List<Range>} ranges
 * @return {Object}
 */

function findBounds(index, ranges) {
  var range = ranges.get(index);
  var start = ranges.slice(0, index).reduce(function (memo, r) {
    return memo += r.text.length;
  }, 0);

  return {
    start: start,
    end: start + range.text.length
  };
}

/**
 * From a DOM node, find the closest parent's offset key.
 *
 * @param {Element} rawNode
 * @param {Number} rawOffset
 * @return {Object}
 */

function findKey(rawNode, rawOffset) {
  var _normalizeNodeAndOffs = (0, _normalizeNodeAndOffset2.default)(rawNode, rawOffset),
      node = _normalizeNodeAndOffs.node,
      offset = _normalizeNodeAndOffs.offset;

  var parentNode = node.parentNode;

  // Find the closest parent with an offset key attribute.

  var closest = (0, _findClosestNode2.default)(parentNode, SELECTOR);

  // For void nodes, the element with the offset key will be a cousin, not an
  // ancestor, so find it by going down from the nearest void parent.
  if (!closest) {
    var closestVoid = (0, _findClosestNode2.default)(parentNode, VOID_SELECTOR);
    if (!closestVoid) return null;
    closest = closestVoid.querySelector(SELECTOR);
    offset = closest.textContent.length;
  }

  // Get the string value of the offset key attribute.
  var offsetKey = closest.getAttribute(ATTRIBUTE);

  // If we still didn't find an offset key, abort.
  if (!offsetKey) return null;

  // Return the parsed the offset key.
  var parsed = parse(offsetKey);
  return {
    key: parsed.key,
    index: parsed.index,
    offset: offset
  };
}

/**
 * Find the selection point from an `offsetKey` and `ranges`.
 *
 * @param {Object} offsetKey
 * @param {List<Range>} ranges
 * @return {Object}
 */

function findPoint(offsetKey, ranges) {
  var key = offsetKey.key,
      index = offsetKey.index,
      offset = offsetKey.offset;

  var _findBounds = findBounds(index, ranges),
      start = _findBounds.start,
      end = _findBounds.end;

  // Don't let the offset be outside of the start and end bounds.


  offset = start + offset;
  offset = Math.max(offset, start);
  offset = Math.min(offset, end);

  return {
    key: key,
    index: index,
    start: start,
    end: end,
    offset: offset
  };
}

/**
 * Parse an offset key `string`.
 *
 * @param {String} string
 * @return {Object}
 */

function parse(string) {
  var matches = PARSER.exec(string);
  if (!matches) throw new Error('Invalid offset key string "' + string + '".');

  var _matches = _slicedToArray(matches, 3),
      original = _matches[0],
      key = _matches[1],
      index = _matches[2]; // eslint-disable-line no-unused-vars


  return {
    key: key,
    index: parseInt(index, 10)
  };
}

/**
 * Stringify an offset key `object`.
 *
 * @param {Object} object
 *   @property {String} key
 *   @property {Number} index
 * @return {String}
 */

function stringify(object) {
  return object.key + '-' + object.index;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  findBounds: findBounds,
  findKey: findKey,
  findPoint: findPoint,
  parse: parse,
  stringify: stringify
};

},{"./find-closest-node":118,"./normalize-node-and-offset":128}],131:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getWindow = require('get-window');

var _getWindow2 = _interopRequireDefault(_getWindow);

var _selectionIsBackward = require('selection-is-backward');

var _selectionIsBackward2 = _interopRequireDefault(_selectionIsBackward);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Scroll the current selection's focus point into view if needed.
 *
 * @param {Selection} selection
 */

function scrollToSelection(selection) {
  if (!selection.anchorNode) return;

  var window = (0, _getWindow2.default)(selection.anchorNode);
  var backward = (0, _selectionIsBackward2.default)(selection);
  var range = selection.getRangeAt(0);
  var rect = range.getBoundingClientRect();
  var innerWidth = window.innerWidth,
      innerHeight = window.innerHeight,
      pageYOffset = window.pageYOffset,
      pageXOffset = window.pageXOffset;

  var top = (backward ? rect.top : rect.bottom) + pageYOffset;
  var left = (backward ? rect.left : rect.right) + pageXOffset;

  var x = left < pageXOffset || innerWidth + pageXOffset < left ? left - innerWidth / 2 : pageXOffset;

  var y = top < pageYOffset || innerHeight + pageYOffset < top ? top - innerHeight / 2 : pageYOffset;

  window.scrollTo(x, y);
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = scrollToSelection;

},{"get-window":62,"selection-is-backward":75}],132:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Set data on dataTransfer
 * COMPAT: In Edge, custom types throw errors, so embed all non-standard
 * types in text/plain compound object. (2017/7/12)
 *
 * @param {DataTransfer} dataTransfer
 * @param {String} type
 * @param {String} content
 */

function setTransferData(dataTransfer, type, content) {
  try {
    dataTransfer.setData(type, content);
  } catch (err) {
    var prefix = 'SLATE-DATA-EMBED::';
    var obj = {};
    var text = dataTransfer.getData('text/plain');

    // If prefixed, assume embedded drag data
    if (text.substring(0, prefix.length) === prefix) {
      try {
        obj = JSON.parse(text.substring(prefix.length));
      } catch (err2) {
        throw new Error('Unable to parse custom embedded drag data');
      }
    } else {
      obj['text/plain'] = text;
    }

    obj[type] = content;

    dataTransfer.setData('text/plain', '' + prefix + JSON.stringify(obj));
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = setTransferData;

},{}],133:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _esrever = require('esrever');

/**
 * Surrogate pair start and end points.
 *
 * @type {Number}
 */

var SURROGATE_START = 0xD800;
var SURROGATE_END = 0xDFFF;

/**
 * A regex to match space characters.
 *
 * @type {RegExp}
 */

var SPACE = /\s/;

/**
 * A regex to match chameleon characters, that count as word characters as long
 * as they are inside of a word.
 *
 * @type {RegExp}
 */

var CHAMELEON = /['\u2018\u2019]/;

/**
 * A regex that matches punctuation.
 *
 * @type {RegExp}
 */

var PUNCTUATION = /[\u0021-\u0023\u0025-\u002A\u002C-\u002F\u003A\u003B\u003F\u0040\u005B-\u005D\u005F\u007B\u007D\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/;

/**
 * Is a character `code` in a surrogate character.
 *
 * @param {Number} code
 * @return {Boolean}
 */

function isSurrogate(code) {
  return SURROGATE_START <= code && code <= SURROGATE_END;
}

/**
 * Is a character a word character? Needs the `remaining` characters too.
 *
 * @param {String} char
 * @param {String|Void} remaining
 * @return {Boolean}
 */

function isWord(char, remaining) {
  if (SPACE.test(char)) return false;

  // If it's a chameleon character, recurse to see if the next one is or not.
  if (CHAMELEON.test(char)) {
    var next = remaining.charAt(0);
    var length = getCharLength(next);
    next = remaining.slice(0, length);
    var rest = remaining.slice(length);
    if (isWord(next, rest)) return true;
  }

  if (PUNCTUATION.test(char)) return false;
  return true;
}

/**
 * Get the length of a `character`.
 *
 * @param {String} char
 * @return {Number}
 */

function getCharLength(char) {
  return isSurrogate(char.charCodeAt(0)) ? 2 : 1;
}

/**
 * Get the offset to the end of the first character in `text`.
 *
 * @param {String} text
 * @return {Number}
 */

function getCharOffset(text) {
  var char = text.charAt(0);
  return getCharLength(char);
}

/**
 * Get the offset to the end of the character before an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getCharOffsetBackward(text, offset) {
  text = text.slice(0, offset);
  text = (0, _esrever.reverse)(text);
  return getCharOffset(text);
}

/**
 * Get the offset to the end of the character after an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getCharOffsetForward(text, offset) {
  text = text.slice(offset);
  return getCharOffset(text);
}

/**
 * Get the offset to the end of the first word in `text`.
 *
 * @param {String} text
 * @return {Number}
 */

function getWordOffset(text) {
  var length = 0;
  var i = 0;
  var started = false;
  var char = void 0;

  while (char = text.charAt(i)) {
    var l = getCharLength(char);
    char = text.slice(i, i + l);
    var rest = text.slice(i + l);

    if (isWord(char, rest)) {
      started = true;
      length += l;
    } else if (!started) {
      length += l;
    } else {
      break;
    }

    i += l;
  }

  return length;
}

/**
 * Get the offset to the end of the word before an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getWordOffsetBackward(text, offset) {
  text = text.slice(0, offset);
  text = (0, _esrever.reverse)(text);
  var o = getWordOffset(text);
  return o;
}

/**
 * Get the offset to the end of the word after an `offset` in `text`.
 *
 * @param {String} text
 * @param {Number} offset
 * @return {Number}
 */

function getWordOffsetForward(text, offset) {
  text = text.slice(offset);
  var o = getWordOffset(text);
  return o;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  getCharOffsetForward: getCharOffsetForward,
  getCharOffsetBackward: getCharOffsetBackward,
  getWordOffsetBackward: getWordOffsetBackward,
  getWordOffsetForward: getWordOffsetForward
};

},{"esrever":56}],134:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isDev = require('../constants/is-dev');

var _isDev2 = _interopRequireDefault(_isDev);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Log a development warning.
 *
 * @param {String} message
 * @param {Any} ...args
 */

function warn(message) {
  if (!_isDev2.default) {
    return;
  }

  if (typeof console !== 'undefined') {
    var _console;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    (_console = console).warn.apply(_console, ['Warning: ' + message].concat(args)); // eslint-disable-line no-console
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = warn;

},{"../constants/is-dev":84}]},{},[86])(86)
});