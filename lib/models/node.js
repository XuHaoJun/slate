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

var _immutable = require('immutable');

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
      return memo.concat(char.marks.toArray());
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