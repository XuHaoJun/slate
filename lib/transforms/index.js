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