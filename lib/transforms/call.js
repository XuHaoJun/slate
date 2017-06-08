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