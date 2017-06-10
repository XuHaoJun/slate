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