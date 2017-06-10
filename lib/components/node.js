'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

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

    var encoded = _base2.default.serializeNode(node, { preserveKeys: true });
    var data = e.nativeEvent.dataTransfer;
    data.setData(_types2.default.NODE, encoded);

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