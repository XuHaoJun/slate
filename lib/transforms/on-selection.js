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