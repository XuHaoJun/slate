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