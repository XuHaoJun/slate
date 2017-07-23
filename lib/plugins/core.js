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

var _react = require('react');

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