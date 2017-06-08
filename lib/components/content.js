'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

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

    return target.isContentEditable && (target == element || (0, _findClosestNode2.default)(target, '[data-slate-editor]') == element);
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

    var dataTransfer = event.nativeEvent.dataTransfer;

    var data = (0, _getTransferData2.default)(dataTransfer);

    // Prevent default when nodes are dragged to allow dropping.
    if (data.type == 'node') {
      event.preventDefault();
    }

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
    dataTransfer.setData(_types2.default.FRAGMENT, encoded);

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

    // If the target is inside a void node, abort.
    if (state.document.hasVoidParent(point.key)) return;

    // Add drop-specific information to the data.
    data.target = target;
    data.effect = dataTransfer.dropEffect;

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