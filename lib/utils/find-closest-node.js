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