/**
 * Quanter JavaScript CSS Selector Engine v4.2.0
 * A lightweight CSS selector engine designed to be easily select DOM-Elements.
 * https://github.com/jqrony/quanter
 * 
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://github.com/jqrony/quanter/blob/main/LICENSE
 * 
 * @author Indian Modassir
 * 
 * Date: 01-07-2025 12:28 PM
 */
(function(window) {

"use strict";

var version = "4.2.0",
  i,
  support,
  uniqueSort,
  Expr,
  getText,
  isXML,
  tokenize,
  select,
  nodeName,
  contains,
  _quanter,
  attrVal,

  // Local document vars
  documentIsHTML,
  document,
  docElem,
  setDocument,
  
  // Instance array-obj methods
  hasOwn  = ({}).hasOwnProperty,
  arr     = [],
  indexOf = arr.indexOf,
  concat  = arr.concat,
  push    = arr.push,
  slice   = arr.slice,
  
  // Instance-specific data
  expando = "quanter" + 1 * Date.now(),
  preferredDoc = window.document,
  
  // Used for iframes
  // See setDocument()
  // Removing the function wrapper causes a "Permission Denied"
  // error in IE
  unloadHandler = function() {
		setDocument();
	},
  
  // Used for QSA Elements
  // Selecting all elements using context.querySelectorAll()
  // Returns NodeList[]
  selectAll = function(selector, context) {
		return (context || document).querySelectorAll(selector);
	},

  /* booleans */
  booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
		"ismap|loop|multiple|open|readonly|required|scoped",

  // Regular expressions sources
  // http://www.w3.org/TR/css3-selectors/#whitespace
  whitespace = "[\\x20\\t\\r\\n\\f]",

  // https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
  identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
  "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

  // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
  attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

  // Operator (capture 2)
  "*([*^$|!~]?=)" + whitespace +

  // "Attribute values must be CSS identifiers [capture 5]
  // or strings [capture 3 or capture 4]"
  "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
  whitespace + "*\\]",

  // Pseudos selectors: https://www.w3.org/TR/selectors/#pseudo-classes
  pseudos = ":(" + identifier + ")(?:\\((" +

  // 1. quoted (capture 3; capture 4 or capture 5)
  "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

  // 2. simple (capture 6)
  "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

  // 3. anything else (capture 2)
  ".*" + ")\\)|)",

  // Regular Expressions
  // https://www.w3.org/TR/CSS2/text.html#egbidiwscollapse
  // Leading and non-escaped trailing whitespace,
  // capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp(whitespace + "+", "g"),

	rcombinators = new RegExp("^" + whitespace+ "*([>+~<]|" +whitespace+ ")" + whitespace + "*"),
	rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

  ridentifier = new RegExp("^" + identifier + "$"),

  // Use for XPath Expression
  // Trimming left XPath Identifier
  ltrim = new RegExp("^" + whitespace + "*([.]{1,2})?([\\/]{1,2})"),

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
  rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

  // Meta theme matcher
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color
  rthemes = /^(?:theme-color|apple-mobile-web-app-status-bar-style|msapplication-TileColor|msapplication-navbutton-color)$/i,

  // Easily-parseable/retrievable inline TAG
  ritags = /^(?:img|input|meta|area|keygen|base|link|br|hr|source|col|param|track|wbr|embed|command)/i,

  rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
  rinputs = /^(?:input|select|textarea|button)/i,
  rplayable = /^(?:audio|video)$/i,
  rheader = /^h[1-6]$/i,
  ropen = /^(?:dialog|details)$/,
  rhtml = /HTML$/i,
  rnative = /^[^{]+\{\s*\[native \w/,
  rnodeType = /^(?:1|9|11)$/,
  rnoAnimation = /^(none)\s*(0s)\s*(ease)\s*(0s).*(running)/,

  /* XPATH-MATCHES */
  XPathMatches = {
    "ATTR": new RegExp("^(?:(?:(\\*|" + identifier + ")*\\[)(?:(" + identifier +
      ").*?)?(?:(?:@(" + identifier + ")|(" + identifier + ")\\(\\))(?:" + whitespace +
      "*(?:([*^$|!~]?=|,))" + whitespace +
      "*(?:(['\"])(.*?)\\6))?).*?\\]|@(" + identifier + "))"),

    "SIBLING": new RegExp("^(?:(\\/\\/)|(\\/))(?:(?:(following-sibling)|(descendant)|(child))::)?"),
    "CHILD": new RegExp("^\\[" + whitespace + "*(" + identifier + ")"+ whitespace + "*\\]")
  },

  /* MATCH-EXPR */
  matchExpr = {
    "ID": new RegExp("^#(" + identifier + ")"),
    "CLASS": new RegExp("^\\.(" + identifier + ")"),
    "TAG": new RegExp("^(" + identifier + "|[*])"),
    "ATTR": new RegExp("^" + attributes),
    "PSEUDO": new RegExp("^" + pseudos),
    "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),

    // For use in libraries implementing .is()
    // We use this for POS matching in `select`
    "needsContext": new RegExp("^" + whitespace +
      "*[>+~<]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
      "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
  };

/**
 * Safely invoke a method on an object with one argument
 * 
 * @param {object} target [required] The object containing the method
 * @param {string} method [required] The name of the method to invoke
 * @param {mixed} arg     [required] The argument to pass to the method
 * @returns The result of the method call
 */
function invoke(target, method, arg) {
  return rnative.test(target[method]) && target[method](arg);
}

// Quanter support
// Expose support vars for convenience
support = Quanter.support = {};

/**
 * Creates a Quanter public API
 * The main function for finding elements. Uses querySelectorAll if available.
 * Otherwise find elements to other method.
 * 
 * @param {String|NodeList}      selector [required]
 * @param {Document|HTMLElement} context  [optional]
 * @param {Array<HTMLElement>}   results  [optional]
 * @param {Array<HTMLElement>}   seed     [optional]
 * 
 * @returns {Array<HTMLElement>}  All elements matching the selector
 */
function Quanter(selector, context, results, seed) {
  var s, match, elem, notDoc,
    newContext = context && context.ownerDocument,

    // nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;
    results = results || [];

  // Return early from calls with invalid selector or context
  if (typeof selector !== "string" || !selector || !rnodeType.test(nodeType)) {
    return results;
  }

  // Try to shortcut find operations (as opposed) in HTML documents
  if (!seed) {
    setDocument(context);
		context = context || document;
    
    if (documentIsHTML) {
      if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {

        /* ID Selector */
        if ((s = match[1])) {
          elem = ((notDoc = nodeType !== 9) ? newContext : context).getElementById(s);

          // Support: IE, Opera, Webkit
          // getElementById can match elements by name instead of ID
          return (notDoc ?
            elem.id === s && contains(context, elem) :
            elem.id === s
          ) &&
            results.push(elem),
            results;

        /* Type or Class selector */
        } else if ((s = match[2] || match[3])) {
          elem = context["getElementsBy" + (match[2] ? "Tag" : "Class") + "Name"](s);
          push.apply(results, elem);
          return results;
        }
      }

      /* QSA Support */
      // Take advantage of querySelectorAll
      if (support.QSA) {
        try {
          // push.apply(results, selectAll(selector, context));
          // return results;
        } catch(_e) {}
      }
    }
  }

  // All others complex selectors
  return select(selector.replace(rtrim, "$1"), context, results, seed);
}

/**
 * Utility function to test whether a given feature or behavior is supported by the browser.
 * 
 * Internal assert used for support
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert(fn) {
	var elem = document.createElement("fieldset");
	try {
		return !!fn(elem);
	}
	catch(e) {
		return false;
	}
	finally {
		elem.parentNode && elem.parentNode.removeChild(elem);
		elem = null;
	}
}

/**
 * Returns a Function marked with unique quanter expando, special treat for fn.
 * 
 * @param {Function} fn [required]
 * @returns {Function} Marked function with unique quanter expando
 */
function markFunction(fn) {
  fn[expando] = true;
  return fn;
}

/**
 * This function returns the nodeName of the given element (elem).
 * It ensures case-insensitive handling of the tag name and handles undefined or null elements gracefully.
 * 
 * @param {HTMLElement} elem [required]
 * @param {String}      name [required]
 * @returns {Boolean} The matched nodeName of the name,
 * or false if the element has no nodeName exists.
 */
function nodeName(elem, name) {
  var _nodeName = elem && elem.nodeName.toLowerCase();
  return name ? _nodeName === name.toLowerCase() : _nodeName;
}

/**
 * isXML - Checks if a given string is a valid XML document.
 * 
 * This function tries to parse the input string using the DOMParser.
 * If parsing is successful and there are no parser errors,
 * the string is valid XML.
 * 
 * @param {HTMLElement} elem [required]
 * @returns {Boolean} Returns isXML for true, Otherwise false
 */
isXML = Quanter.isXML = function(elem) {
  var namespace = elem && elem.namespaceURI,
		docElem = elem && (elem.ownerDocument || elem).documentElement;
	return !rhtml.test(namespace || nodeName(docElem) || "HTML");
};

/**
 * Sets document-related variables once based on the current document.
 * 
 * @param {HTMLElement} node An element or document object to use to set the document
 * @returns {HTMLDocument} Rreturns current HTML document
 */
setDocument = Quanter.setDocument = function(node) {
  var combinator, hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc,
    relative = Expr.relative;
    
  // Return early if doc is invalid or already selected
  // Support: IE 11+, Edge 17 - 18+
  // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
  // two documents; shallow comparisons work.
  // eslint-disable-next-line eqeqeq
  if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
    return document;
  }
  
  // Update global variables
  document 			 = doc;
  docElem				 = document.documentElement;
  documentIsHTML = !isXML(document);
  
  // Support: IE 9 - 11+, Edge 12 - 18+
  // Accessing iframe documents after unload throws "permission denied" errors
  // Support: IE 11+, Edge 17 - 18+
  // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
  // two documents; shallow comparisons work.
  // eslint-disable-next-line eqeqeq
  if (preferredDoc != document &&
    (subWindow = document.defaultView) && subWindow.top !== subWindow) {

    // Support: IE 11, Edge
    subWindow.addEventListener && subWindow.addEventListener("unload", unloadHandler, false),

    // Support: IE 9 - 10 only
    subWindow.attachEvent && subWindow.attachEvent("onunload", unloadHandler);
  }
  
  // Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
  // Safari 4 - 5 only, Opera <=11.6 - 12.x only
  // IE/Edge & older browsers don't support the :scope pseudo-class.
  // Support: Safari 6.0 only
  // Safari 6.0 supports :scope but it's an alias of :root there.
  support.scope = assert(function(el) {
    docElem.appendChild(el).appendChild(document.createElement("div"));
    return invoke(el, "querySelectorAll", ":scope fieldset div").length;
  });

  // Support: IE<8
  // Verify that getAttribute really returns attributes and not properties
  // (excepting IE8 booleans)
  support.attributes = assert(function(el) {
    el.className = "s";
    return !el.getAttribute("className");
  });
  
  // Verify that children really returns children and exists element node
  // (excepting IE8 booleans)
  support.children = assert(function(el) {
    el.appendChild(document.createElement("div"));
    return !!el.children.length;
  });

  /* getElement(s)By */

  // Check if getElementsByTagName("*") returns only elements
  support.getByTag = assert(function(el) {
    el.appendChild(document.createComment(""));
		return !el.getElementsByTagName("*").length;
  });
  
  // Support: IE<10
  // Check if getElementById returns elements by name
  // The broken getElementById methods don't pick up programmatically-set names,
  // so use a roundabout getElementsByName test
  support.getById = assert(function(el) {
    docElem.appendChild(el).id = expando;
    return !invoke(document, "getElementsByName", expando).length;
  });
  
  // Support: IE<9
  // Check if getElementsByClassName
  support.getByClass = rnative.test(document.getElementsByClassName);
  
  // Support: Chrome, Firefox, Safari, Edge, Opera
  // Check if XPath selenium evaluate with document
  support.XPath = rnative.test(document.evaluate);
  
  // Support: IE8+
  // Check if querySelectorAll
  support.QSA = rnative.test(document.querySelectorAll);
  
  // Support: Modern browsers only
  // Check if the Custom Elements API is available
  // Ensures 'customElements' is an object and a valid instance of CustomElementRegistry
  // Older browsers or polyfilled environments may not support this natively
  support.customElements = typeof customElements === "object" && customElements instanceof CustomElementRegistry;

  /* CLASS */
  Expr.find["CLASS"] = support.getByClass ?
    function(className, context) {
      if (documentIsHTML) {
        return context.getElementsByClassName(className) || selectAll(className, context);
      }
    } :
    function(className, context) {
      return Quanter(className, context);
    };

  /* CHILDREN */
  Expr.find["CHILDREN"] = support.children ?
    function(context) {
      return slice.call(context.children);
    } :
    function(context) {
      var elem,
        results = context.childNodes,
        tmp = [],
        i = 0;

      while ( ( elem = results[ i++ ] ) ) {
        if ( elem.nodeType === 1 ) {
          tmp.push( elem );
        }
      }
      return tmp;
    };

  /* TAG */
  Expr.find["TAG"] = support.getByTag ?
    function(tag, context) {
      return context.getElementsByTagName(tag);
    } :
    function(tag, context) {
      var elem,
        tmp = [],
        i = 0,
        
        // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes
        results = context.getElementsByTagName(tag);
        
      // Filter out possible comments
			if ( tag === "*" ) {
				while ( ( elem = results[ i++ ] ) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
    };

  /* ELEMENTS */
  Expr.find["ELEMENTS"] = function(elem) {
    return slice.call(Expr.find["TAG"]("*", elem));
  };

  /* ID */
  if (support.getById) {
    Expr.filter["ID"] = function(id) {
      return function(elem) {
        return elem.getAttribute("id") === id;
      };
    };
    Expr.find["ID"] = function(id, context) {
      var elem = documentIsHTML && context.getElementById(id);
			return elem ? [elem] : [];
    };
  } else {
    Expr.filter["ID"] = function(id) {
      return function(elem) {
        var node = invoke(elem, "getAttributeNode", id);
        return node && node.value === id;
      };
    };

    // Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
    Expr.find["ID"] = function(id, context) {
      var elems, i,
        elem =  invoke(context, "getElementById", id);

      if (documentIsHTML && elem) {

        // Verify the id attribute
        if (attrVal(elem, "id", "getAttributeNode") === id) {
          return [elem];
        }

        // Fall back on getElementsByName
        elems = elem.getElementsByName(id);
        i = 0;
        while((elem = elems[i++])) {
          // Verify the id attribute
          if (attrVal(elem, "id", "getAttributeNode") === id) {
            return [elem];
          }
        }
        return [];
      }
    };
  }

  /* Add Combinators Handler */
  for(combinator in relative) {
    Expr.combinators[combinator] = addCombinator(relative[combinator]);
  }

  // Contains
	// Element contains another Purposefully self-exclusive
	// As in, an element does not contain itself
  hasCompare = rnative.test(document.compaireDocumentPosition);
  contains = hasCompare || rnative.test(docElem.contains) ?
		function(a, b) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;

      return adown === bup || !!(bup && bup.nodeType === 1 && (
        adown.contains ?
          adown.contains(bup) :
          a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
      ));
		} :
		function(context, elem) {
			if (elem) {
				while((elem = elem.parentNode)) {
					if (elem === context) {
						return true;
					}
				}
			}
			return false;
		};

  return document;
};

/**
 * Document sorting and removing duplicates
 * 
 * This method removes duplicate values from given array
 * and sort element with sortOrder
 * 
 * @param {Array} results [required]
 * @returns {Array} Returns a unique array
 */
uniqueSort = Quanter.uniqueSort = function(results) {
  var elem, hasElem,
    elems = Expr.find["ELEMENTS"](document),
    i = 0,
    len = results.length,
    copy = results.slice(0).sort(),
    l = elems.length;

  results.length = 0;

  // Go through for sort none-HTMLElements collection
  for(; i < len; i++) {
    elem = copy[i];
		if (indexOf.call(copy, elem) === i && !(elem.nodeType && (hasElem = true))) {
			results.push(elem);
		}
	}

  // Go through for sort HTMLElements collection
  if (hasElem) {
    for(i = 0; i < l; i++) {
      elem = elems[i];
      if (indexOf.call(copy, elem) > -1) {
        results.push(elem);
      }
    }
  }

  return results;
};

/* Error */
Quanter.error = function(msg) {
  throw new SyntaxError("Unrecognized expression: " + msg);
};

/**
 * Retrieves the value of a specified attribute from a DOM element.
 * @param {Element} elem [required]
 * @param {string}  attr [required]
 * @param {string}  prop [optional]
 */
attrVal = Quanter.attrVal = function(elem, attr, prop) {
  return invoke(elem, prop || "getAttribute", attr);
};

/**
 * Matches expr CSS :pseudos selector from given elements
 * @param {String} expr An String CSS Selectors
 * @param {Element} elements HTML list elements
 * @returns matched expr selectors HTML Elements with array
 */
Quanter.matches = function(expr, elements) {
  return Quanter(expr, null, null, elements);
};

/**
 * Executes XPath expressions and collects matching elements from a context node.
 * Handles complex XPath expressions possibly separated by commas and supports
 * filtering with a seed set of elements.
 * 
 * @param {string} expr The XPath expression
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 * @returns {Array} A sorted array of unique matched elements.
 */
Quanter.XPathSelect = function(expr, context, results, seed) {
  var token, iterator, elem, first,
    source = rcomma.source.slice(1),
    comma = expr.match(new RegExp("(" + source + ")", "g")),
    snap = XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    tokens = expr.split(new RegExp(source)),
    matchesIndex = 0,
    i = 0;

  context = context || document;
  seed = seed || Expr.find["ELEMENTS"](context);
  results = results || [];

  (function select() {
    try {
      while((token = tokens[i++])) {
        iterator = document.evaluate(token, context, null, snap, null);
        expr = expr.slice(token.length).replace(rcomma, "");
        elem = iterator.iterateNext();
        tokens.shift();
        matchesIndex++;
        i--;

        while(elem) {
          if (indexOf.call(seed, elem) > -1) {
            results.push(elem);
          }
          elem = iterator.iterateNext();
        }
      }
    } catch(e) {
      comma = comma && comma[matchesIndex];
      token = tokens.shift();
      first = tokens[0];

      // Check if comma is inside unbalanced brackets and part of the token
      if (comma && expr[token.length] === comma && !isBracketBalanced(token)) {
        tokens[0] = token + comma + tokens[0];
        
        // Reset index and reprocess
        i = 0;
        select();
      } else {
        // If not a recoverable bracket error,
        // rethrow the exception
        throw e;
      }
    }
  })();

  return uniqueSort(results);
};

/**
 * Checks whether all types of brackets in the input string are properly balanced.
 * Supports: (), {}, and [].
 * 
 * A string is considered balanced if:
 * Every opening bracket has a corresponding and correctly nested closing bracket.
 * 
 * @param {string} str The input string to check.
 * @returns {boolean} Returns true if brackets are balanced, false otherwise.
 */
function isBracketBalanced(str) {
  var char, last, stack = [],
    brackets = {
      "[" : "]",
      "{" : "}",
      "(" : ")"
    };

  for(char of str) {
    // If the character is an opening bracket, push it to the stack
    if (brackets[char]) {

      // Store opening bracket
      stack.push(char);

    // If the character is a closing bracket
    } else if (Object.values(brackets).indexOf(char) > -1) {
      // Pop the last opening bracket from the stack
      last = stack.pop();

      // Check if the popped bracket matches the current closing bracket
      if (brackets[last] !== char) {
        return false;
      }
    }
  }

  return !stack.length;
}

/**
 * Returns a function to handle multi combinators (e.g., [>~+<])
 * @param {Object} src An combinator relative object
 * @returns {HTMLCollection} Matches HTMLCollection
 */
function addCombinator(src) {
  return function(elem) {
    var el, tmp = [],
      {dir, type, method} = src,
      once = !!src.once;

    // Handle: [>+<] Combinator
    if (once || method) {
      return once ? (el = elem[dir]) && [el] : Expr[method][type](elem);

    // Otherwise,
    // Handle: [~] Combinator
    } else {
      while((elem = elem[dir]) && elem.nodeType === 1) {
        tmp.push(elem);
      }
      return tmp;
    }
  };
}

/* Contains */
Quanter.contains = function(context, elem) {

  // Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
  (context.ownerDocument || context) !== document && setDocument();
  return contains(context, elem);
};

/* ATTR */
Quanter.attr = function(elem, name) {

  // Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when
	// strict-comparing two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
  (elem.ownerDocument || elem) != document && setDocument(elem);

  name = (name || "").toLowerCase();
  var fn = Expr.attrHandle[name],

    // Don't get fooled by Object.prototype properties
    val = fn && hasOwn.call(Expr.attrHandle, name) ?
      fn(elem, name, !documentIsHTML) :
      undefined;

  return val !== undefined ?
    val :
    support.attributes || !documentIsHTML ?
    elem.getAttribute(name) :
    (val = elem.getAttributeNode(elem)) && val.specified ?
      val.value :
      null;
};

// Utility function for retrieving the text value of an array of DOM nodes
getText = Quanter.getText = function(elem) {
  var node,
    nodeType = elem.nodeType,
    text = "",
    i = 0;

  // Handle none-element object
  if (!nodeType) {

    // If no nodeType, this is expected to be an array
		while ((node = elem[i++])) {

			// Do not traverse comment nodes
			ret += getText(node);
		}
  } else if (rnodeType.test(nodeType)) {

    // Use textContent for elements
		// innerText usage removed for consistency of new lines (jQrony #11153)
    if (typeof elem.textContent === "string") {
      return elem.textContent;
    } else {
      // Otherwise Traverse its children
      for(elem = elem.firstChild; elem; elem = elem.nextSibling) {
        text += getText(elem);
      }
    }

  // Otherwise,
  // Handle: textNode or CData
  } else if (nodeType === 3 || nodeType === 4) {
    return elem.nodeValue;
  }

  // Do not include comment or processing instruction nodes
  return text;
};

/**
 * Retrieves the computed style value of a specific CSS property for a given element.
 * 
 * @param {Element} elem [required]
 * @param {string} name  [required]
 * @returns computed style property value
 */
function style(elem, name) {

  // Support: IE <=11 only, Firefox <=30 (trac-15098, trac-14150)
	// IE throws on elements created in popups
	// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
	var view = elem.ownerDocument.defaultView;

  if (!view || !view.opener) {
    view = window;
  }

  return view.getComputedStyle(elem)[name];
}

/**
 * Allow to extends none-existable new pseudo from outside
 * 
 * @param {string} pseudo    [required]
 * @param {Function} fn      [required]
 * @param {boolean} markable [optional]
 */
function addPseudo(pseudo, fn, markable) {
  
  // If already exist pseudo
  if (Expr.pseudo[pseudo]) {
    Quanter.error("Pseudo : " + pseudo + " already exists");
  }
  Expr.pseudo[pseudo] = markable ? markFunction(fn) : fn;
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle(attrs, handler) {
  var arr = attrs.split("|"),
		i = arr.length;

	while (i--) {
		Expr.attrHandle[arr[i]] = handler;
	}
}

/* PSEUDOS HANDLERS */

/**
 * Returns a function to use in pseudos for valid input
 * @param {Boolean} isValid [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function validInputPseudo(isValid) {
  return function(elem) {
    return rnative.test(elem.checkValidity) && elem.checkValidity() === isValid;
  };
}

/**
 * Returns a function to use in pseudos for script types
 * @param {RegExp} regex [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function scriptPseudo(regex) {
  return function(elem) {
    return nodeName(elem, "script") && regex.test(elem.type);
  };
}

/**
 * Returns a function to use in pseudos for form methods
 * @param {string} method [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function formPseudo(method) {
  return function(elem) {
    return nodeName(elem, "form") && elem.method.toLowerCase() === method;
  };
}

/**
 * Returns a function to use in pseudos for buttons or inputs
 * @param {string} type [required]
 * @param {string} tag  [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function inputOrButtonPseudo(type, tag) {
  return function(elem) {
    return nodeName(elem, tag) && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for filter elements
 * @param {boolean} not [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function filterPseudo(not) {
  return markFunction(function(selector) {
    var target = Quanter.matches(selector);
    return function(elem) {
      return (indexOf.call(target, elem) > -1) === not;
    };
  });
}

/**
 * Returns a function to use in pseudos for attribute elements
 * @param {string} expr [required]
 * @param {string} attr [required]
 * @param {boolean} not [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function attrPseudo(expr, attr, not) {
  return function(elem) {
    return (typeof expr === "string" ? nodeName(elem, expr) : expr.test(expr)) &&
      !!elem[attr] === !not;
  };
}

/**
 * Returns a function to use in pseudos for input range (min,max)
 * @param {boolean} inRange [required]
 * @returns  {boolean} Match for true, Otherwise false
 */
function rangePseudo(inRange) {
  return function(elem) {
    var val = +elem.value, min = +elem.min, max = +elem.max;
    return nodeName(elem, "input") && elem.type === "number" && (min <= val && max >= val) === inRange;
  };
}

/**
 * Returns a function to use in pseudos for hidden/visible elements
 * @param {boolean} hidden [required]
 * @returns {boolean} Match for true, Otherwise false
 */
function hiddenPseudo(hidden) {
  return function(elem) {
    var visibility = style(elem, "visibility"),
				display = style(elem, "display");
			return (visibility === "hidden" || display === "none" || elem.hidden) === hidden;
  };
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 * @returns {boolean} Match for true, Otherwise false
 */
function disabledPseudo(disabled) {
  // Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
  return function(elem) {
    // Only certain elements can match :enabled or :disabled
    // https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
    // https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
    if (("form" in elem) &&

    // * listed form-associated elements in a disabled fieldset
    // * option elements in a disabled optgroup
    // All such elements have a "form" property.
    elem.parentNode && elem.disabled === false) {

    // Option elements defer to a parent optgroup if present
    if ("label" in elem) {
      return ("label" in elem.parentNode) ?
        elem.parentNode.disabled === disabled :
        elem.disabled === disabled;
    }
    
    // Support: IE 6 - 11
    // Use the isDisabled shortcut property to
    // check for disabled fieldset ancestors
    return elem.disabled === disabled || elem.disabled !== !disabled;

    // Try to winnow out elements that can't be disabled before trusting the disabled property.
    // Some victims get caught in our net (label, legend, menu, track), but it shouldn't
    // even exist on them, let alone have a boolean value.
    }
    if ("form" in elem || "label" in elem) {
      return elem.disabled === disabled;
    }
  
    // Remaining elements are neither :enabled nor :disabled
    return false;
  };
}
/* END */


/* EXPR/SELECTORS */
Expr = Quanter.selectors = {
  createPseudo: markFunction,
  addPseudo: addPseudo,

  combinators: {},
  attrHandle: {},
  find: {},
  match: matchExpr,

  /* COMBINATORS */
  relative: {
    "+": {dir: "nextElementSibling", once: true},
		"<": {dir: "parentNode", once: true},
    "~": {dir: "nextElementSibling"},
    " ": {type: "ELEMENTS", method: "find"},
		">": {type: "CHILDREN", method: "find"}
  },

  /* XPATH-FILTER */
  XPathFilter: {
    "ATTR": function(match) {
      var m, selector, fn, pseudo,
        rbounds = /^(?:(starts)|(ends))-with$/,
        tag = match[1] || "",
        attr = function() {
          return "[" + (match[3] || match[8] || "") + (match[5] || "") + (match[7] || "") + "]";
        };

      // Replace comma (,) to (=), If match[5]
      if (match[5] && rcomma.test(match[5])) {
        match[5] = "=";
      }

      // Handle: function if includes in attribute
      if ((fn = match[2]) || match[4]) {

        // Handle: [start-with()] [and ends-with()]
        if ((m = rbounds.exec(fn))) {
          match[5] = m[0] ? "^=" : "$=";
          match[2] = undefined;
        }
        
        // Handle: pseudo if includes in pseudos
        if (Expr.pseudos[fn]) {
          if (match[4]) {
            pseudo = ":" + match[4] + "('" + match[7] + "')";
          }
          
          if (match[2]) {
            selector = tag + ":" + match[2] + "(" + (pseudo || attr()) + ")";
          }
        }
      }

      /* Tokenize Selector */
      match[1] = tokenize(selector || tag + attr());
      return match;
    },
    "CHILD": function(match) {
      var selector = ":" + (!isNaN(+match[1]) ? "nth-of-type(" : "has(") + match[1] + ")",
        tokens = tokenize(selector);

      match[1] = tokens;
      return match;
    },
    "SIBLING": function(match) {
      var selector = match[3] ? "~" : match[1] || match[4] ? " " : ">";
      match[1] = [{value: selector, type: selector}];
      return match;
    }
  },

  /* PRE-FILTER */
  preFilter: {
    "CLASS": function(match) {
      return match.slice(0, 2);
    },
    "ATTR": function(match) {
      // Move the given value to match[3] whether quoted or unquoted
			match[3] = (match[3] || match[4] || match[5] || "");

      if (match[2] === "~=") {
				match[3] = " " + match[3] + " ";
			}

			return match.slice(0, 4);
    },
    "TAG": function(match) {
      return match.slice(0, 2);
    },
    "ID": function(match) {
      return match.slice(0, 2);
    },
    "CHILD": function(match) {
      /* matches from matchExpr["CHILD"]
			  1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
      match[1] = match[1].toLowerCase();

      if (match[1].slice(0, 3) === "nth") {
        
        // nth-* requires argument
        if (!match[3]) {
          Quanter.error(match[0]);
        }

        // numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +(match[4] ?
					match[5] + (match[6] || 1) :
					2 * (match[3] === "even" || match[3] === "odd"));
				match[5] = +((match[7] + match[8]) || match[3] === "odd");

      // Other types prohibit arguments
      } else if (match[3]) {
        Quanter.error(match[0]);
      }

      return match;
    },
    "PSEUDO": function(match) {
      // Accept quoted ['|"] arguments as-is
			if (match[3]) {
				match[2] = match[4] || match[5] || "";
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice(0, 3);
    }
  },

  /* FILTER */
  filter: {
    "TAG": markFunction(function(tagName) {
      tagName = tagName.toLowerCase();
      return function(elem) {
        return tagName === "*" ? true : nodeName(elem, tagName);
      };
    }),
    "CLASS": markFunction(function(className) {
      return function(elem) {
        var pattern;
				return (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
					pattern.test(attrVal(elem, "class") || elem.className || "");
      };
    }),
    "ATTR": markFunction(function(name, operator, check) {
      return function(elem) {
        var result = Quanter.attr(elem, name);

				if (result == null || !operator) {
          return result == null ?
            operator === "!=" :
            true;
				}

				// toString result
				result += "";

				/* eslint-disable max-len */
				return operator === "=" ? result === check :
          operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf(check) === 0 :
					operator === "*=" ? check && result.indexOf(check) > -1 :
					operator === "$=" ? check && result.slice(-check.length) === check :
					operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 :
					operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
					false;
				/* eslint-enable max-len */
      };
    }),
    "CHILD": markFunction(function(type, what, _arg, first, last) {
      var simple = type.slice(0, 3) !== "nth",
				forward = type.slice(-4) !== "last",
				ofType = what === "of-type";

      /*
			 * :nth-last-of-type(n)
			 * :nth-of-type(n)
			 * :first-of-type
			 * :first-child
			 * :last-child
			 * :last-of-type
			 * :nth-child(n)
			 * :only-child
			 * :only-of-type
			 * :nth-last-child(n)
			 */
			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function(elem) {
					return !!elem.parentNode;
				} :

        function (elem) {
          var node, start, diff,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
            matchesTypes = Expr.find["TAG"](elem.nodeName, parent).length,
            children = Expr.find["CHILDREN"](parent),
            matchesIndex = 0,
            childIndex = 0,
            results = [];

          if (parent) {
            /* Handle none-argument CHILD Pseudos */
            /* :(first|last|only)-(child|of-type) */
            if (simple) {
              while(dir) {
                node = elem;
                while((node = node[dir])) {
                  if (ofType ? nodeName(node, elem.nodeName) : node.nodeType === 1) {
                    return false;
                  }
                }
                // Reverse direction for :only-* (if we haven't yet done so)
                start = dir = type === "only" && !start && "nextSibling";
              }
              return true;
            }

            /* Handle argument-based CHILD Pseudos */
            /* :(nth)(-last)-(child|of-type)(n) */
            while((node = children[childIndex++])) {
              if (ofType ? nodeName(node, elem.nodeName) : node.nodeType === 1) {
                diff = forward ?
                  /* For :nth-child(n) And :nth-of-type(n) */
                  ++matchesIndex :

                  /* For :nth-last-child(n) And :nth-last-of-type(n) */
                  matchesTypes--;

                diff -= last;
                // Incorporate the offset, then check against cycle size
                if (diff === first || (diff % first === 0 && diff / first >= 0)) {
                  results.push(node);
                }
              }
            }

            return indexOf.call(results, elem) > -1;
          }
        };
    }),
    "PSEUDO": markFunction(function(pseudo, arguemnt) {

      // pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
      var fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
				Quanter.error("unsupported pseudo: " + pseudo);

      // The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Quanter does
      return fn[expando] ?
				fn(!isNaN(+arguemnt) ? +arguemnt : arguemnt) :
				fn;
    })
  },

  /* PSEUDOS */
  pseudos: {

    /* Potentially complex pseudos */
    "viewport": function(elem) {
      return nodeName(elem, "meta") && elem.name === "viewport";
    },
    "theme": function(elem) {
      return nodeName(elem, "meta") && rthemes.test(elem.name);
    },
    "contains": markFunction(function(text) {
      return function(elem) {
        return (elem.textContent || getText(elem)).indexOf(text) > -1;
      };
    }),
    "icontains": markFunction(function(text) {
      return function(elem) {
        return (
          elem.textContent ||
          getText(elem) || ""
        ).toLowerCase().indexOf(text.toLowerCase()) > -1;
      };
    }),
    "rcontains": markFunction(function(source) {
      return function(elem) {
        var regex = new RegExp(source);
        return regex.test(elem.textContent || getText(elem));
      };
    }),
    "ircontains": markFunction(function(source) {
      return function(elem) {
        var regex = new RegExp(source, "i");
        return regex.test(elem.textContent || getText(elem));
      };
    }),

    /* Miscellaneous */
    "target": function(elem) {
      var hash = window.location && window.location.hash;
      return hash && hash.slice(1) === elem.id;
    },

    /* Potentially complex pseudos */
    "has": markFunction(function(selector) {
      return function(elem) {
        return Quanter(selector, elem).length > 0;
      }
    }),

    /* Added version >= 4.2.0 */
    "xpath": markFunction(function(expr) {
      return function(elem) {
        return Quanter.XPathSelect(expr, elem);
      };
    }),

    // "Whether an element is represented by a :role() selector
		// is based solely on the element's role value
    // The matching of C against the element's role value is performed case-insensitively.
    "role": markFunction(function(role) {

      // Change case role toLowerCase
      role = (role || "").toLowerCase();
      
      return function(elem) {
        var elemRole;
        if ((elemRole = documentIsHTML ? elem.role : attrVal(elem, "role"))) {
          return role === elemRole.toLowerCase();
        }
      };
    }),

    // "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
    "lang": markFunction(function(lang) {

      // lang value must be a valid identifier
      if (!ridentifier.test(lang || "")) {
        Quanter.error("unsupported lang: " + lang);
      }

      // change case lang toLowerCase
      lang = (lang || "").toLowerCase();

      return function(elem) {
        do {
          var elemLang;
          if ((elemLang = documentIsHTML ? elem.lang : attrVal(elem, "xml:lang") || attrVal(elem, "lang"))) {
            // change case elem lang toLowerCase
            elemLang = elemLang.toLowerCase();
            return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
          }
        }
        while((elem = elem.parentNode) && elem.nodeType === 1);
        return false;
      };
    }),

    /* Boolean properties */
    "disabled": disabledPseudo(true),
    "enabled": disabledPseudo(false),
    "hidden": hiddenPseudo(true),
    "visible": hiddenPseudo(false),
    "get": formPseudo("get"),
    "post": formPseudo("post"),
    "filter": filterPseudo(true),
    "not": filterPseudo(false),

    /* CSS3 predefine default pseudo */
    "indeterminate": attrPseudo("input", "indeterminate"),
    "read-only": attrPseudo("input", "readOnly"),
    "required": attrPseudo("input", "required"),
    "open": attrPseudo(ropen, "open"),
    "link": attrPseudo("a", "href"),
    "out-of-range": rangePseudo(false),
    "in-range": rangePseudo(true),
    "modal": attrPseudo("dialog", "open"),
    "paused": attrPseudo(rplayable, "paused"),
    "muted": attrPseudo(rplayable, "muted"),
    "invalid": validInputPseudo(false),
    "valid": validInputPseudo(true),
    "autoplay": attrPseudo(rplayable, "autoplay"),
    "optional": attrPseudo("input", "required", true),

    /* Active Element or other pseudos */
    "picture-in-picture": function(elem) {
      return indexOf.call([document.pictureInPictureElement], elem) > -1;
    },
    "popover-open": function(elem) {
      return elem.matches && elem.matches(":popover-open");
    },
    "fullscreen": function(elem) {
      return indexOf.call([document.fullscreenElement], elem) > -1;
    },
    "playing": function(elem) {
      return rplayable.test(elem.nodeName) && !(elem.paused && elem.muted);
    },
    "active": function(elem) {
      return elem.activeElement;
    },
    "defined": function(elem) {
      var tag = nodeName(elem);
      return document.createElement(tag).constructor !== HTMLElement ||
        customElements.get(tag);
    },
    "inline": function(elem) {
      return ritags.test(elem.nodeName);
    },
    "root": function(elem) {
      return elem === docElem;
    },
    "editable": function(elem) {
      return elem.contentEditable === "true";
    },
    "focus": function(elem) {
      return elem === elem.activeElement ||
        (!document.hasFocus && document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
    },
    "checked": function(elem) {
      // In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      return (nodeName(elem, "input") && !!elem.checked) || (nodeName(elem, "option") && !!elem.selected);
    },
    "offset": function(elem) {
      return style(elem, "position") !== "static";
    },
    "selected": function(elem) {
      // Accessing this property makes selected-by-default
			// options in Safari work properly
			// eslint-disable-next-line no-unused-expressions
      elem.parentNode && elem.parentNode.selectedIndex;
			return elem.selected === true;
    },
    "parent": function(elem) {
      return !Expr.pseudos["empty"](elem)
    },

    /* Contents */
    "empty": function(elem) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text:3; CData:4; Quanter ref:5),
			// but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
      for(elem = elem.firstChild; elem; elem = elem.nextSibling) {
				if (elem.nodeType < 6) {
					return false;
				}
			}
			return true;
    },

    /* Element/input types and Headers */
    "header": function(elem) {
      return rheader.test(elem.nodeName);
    },
    "input": function(elem) {
      return rinputs.test(elem.nodeName);
    },
    "button": function(elem) {
      return nodeName(elem, "button") || (nodeName(elem, "input") && elem.type === "button");
    },
    "text": function(elem) {
      var attr;
      return nodeName(elem, "input") &&
        elem.type === "text" &&
        // Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with type==="text"
        ((attr = attrVal(elem, "type")) == null || attr.toLowerCase() === "text");
    },
    "animated": function(elem) {
      return nodeName(elem, "marquee") || !rnoAnimation.test(style(elem, "animation"));
    },

    /* Position-in-collection pseudos */
    "first": function(_, i) {
      return i === 1;
    },
    "last": function(_, i, length) {
      return i === length;
    },
    "eq": markFunction(function(i) {
      return function(_, index, length) {
        return (i < 0 ? i + length : i) === --index;
      };
    }),
    "odd": function(_, i) {
      return !!(i % 2);
    },
    "even": function(_, i) {
      return !!((i + 1) % 2);
    },
    "lt": markFunction(function(i) {
      return function(_, index, length) {
        i = i < 0 ? i + length : i > length ? length : i;
        return i > --index;
      };
    }),
    "gt": markFunction(function(i) {
      return function(_, index, length) {
        i = i < 0 ? i + length : i > length ? length : i;
        return i < --index;
      };
    }),
  }
};

/* Add script type pseudos */
for (i of [
  "importmap",
  "module",
  ["ecmascript", /^(application|text)\/ecmascript$/i],
  ["json", /^application\/(ld\+|json)+$/i]
]) {
  var isGroup = Array.isArray(i);
  var prop = isGroup ? i[0] : i;
  var regex = isGroup ? i[1] : new RegExp("^" + i + "$");
  Expr.pseudos[prop] = scriptPseudo(regex);
}

/* Add button/input type pseudos */
for(i of ["submit", "reset"]) {
  Expr.pseudos[i] = inputOrButtonPseudo(i, "button");
}
for(i of ["radio", "checkbox", "url", "file", "password", "email", "color", "number"]) {
  Expr.pseudos[i] = inputOrButtonPseudo(i, "input");
}

/* TOKENIZE */
tokenize = Quanter.tokenize = function(selector) {
  var soFar, matched, match, groups, tokens, type,
    XPathFilter = Expr.XPathFilter,
    preFilters = Expr.preFilter,
    allowXPath = ltrim.test(selector),
    isActiveXPath = allowXPath,
    groups = [];
    
  soFar = selector.trim();
  while(soFar) {
    
    /* Comma and first run */
    if (!matched || (match = rcomma.exec(soFar))) {
      if (match) {
        // Don't consume trailing commas as valid
        soFar = soFar.slice(match[0].length) || soFar;
        isActiveXPath = false;
        allowXPath = true;
      }
      groups.push((tokens = []));
    }

    matched = false;

    /* Combinators */
    if ((match = rcombinators.exec(soFar))) {
      matched = match.shift();

      tokens.push({
        value: matched,
        // Cast descendant combinators to space
        type: match[0].replace(rtrim, " ")
      });
      soFar = soFar.slice(matched.length);
    }

    /* Non-XPath Filters */
    for(type in Expr.filter) {
      if ((match = matchExpr[type].exec(soFar)) &&
      (!preFilters[type] || (match = preFilters[type](match))) &&

      // Don't create [ATTR] token, If XPath already matched
      (!(isActiveXPath && type == "ATTR"))) {
        matched = match.shift();

        tokens.push({
          value: matched,
          type,
          matches: match
        });
        soFar = soFar.slice(matched.length);
      }
    }

    /* First trim XPath identifier */
    if (allowXPath && ltrim.test(soFar)) {
      soFar = soFar.replace(ltrim, "");
      matched = isActiveXPath = true;
      allowXPath = false;
    }

    /* XPath Filters */
    for(type in XPathFilter) {
      if ((match = XPathMatches[type].exec(soFar)) && (match = XPathFilter[type](match))) {
        matched = match.shift();
        push.apply(tokens, concat.apply([], match[0]));
        soFar = soFar.slice(matched.length);
      }
    }

    // If matched false, Stop/Break while loop
    if (!matched) {
      break;
    }
  }

  // Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
  return soFar ? Quanter.error(soFar) : groups.slice(0);
};


/**
 * Selects DOM elements based on a CSS selector string.
 * This function acts similarly to querySelectorAll but includes support for custom tokenization,
 * filtering, and combinator logic as defined in the `Expr` object.
 * 
 * @param {String}  selector  A CSS-like selector string used to identify DOM elements.
 * @param {Element} context   The root DOM node within which to perform the search.
 * @param {Array}   [results] An optional array to which the matched elements will be added.
 * @param {Array}   [seed]    A set of elements to match against
 * 
 * @returns {Array} Unique DOM elements matching the selector in the given context.
 */
select = Quanter.select = function(selector, context, results, seed) {
  var j, q, tokens, token, src, type, elem, value, next, fn,
    match = tokenize(selector),
    i = 0;

  // Force result to be an array
  results = results || [];

  while((tokens = match[i++])) {

    // Force seed or extract all context elements
    src = seed || Expr.find["ELEMENTS"](context);
    j = 0;

    // HANDLE: For single combinator
    if (tokens.length === 1 && rcombinators.test(tokens[0].type)) {
      src = [context];
    }

    while((token = tokens[j++])) {
      type = token.type;
      fn = Expr.combinators[type] || Expr.filter[type].apply(null, token.matches);
      next = [];
      q = 0;

      // Go through to start selecting the element
      while((elem = src[q++])) {
        if ((value = fn(elem, q, src.length))) {
          push.apply(next, value === true ? [elem] : value);
        }
      }
      src = next;
    }
    push.apply(results, src);
  }

  return uniqueSort(results);
};

/**
 * setFilters
 * Easy API for creating new setFilters for Expr
 */
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

/* One-time assignments */

Quanter.isBracketBalanced = isBracketBalanced;

// Initialize against the default document
setDocument();

// The current version of Quanter being used
Quanter.version = version;

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if (!assert( function(el) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#";
})) {
	addHandle("type|href|height|width", function(elem, name, isXML) {
		if (!isXML) {
			return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if (!support.attributes || !assert(function(el) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute("value", "");
	return el.firstChild.getAttribute("value") === "";
})) {
	addHandle("value", function(elem, _name, isXML) {
		if (!isXML && elem.nodeName.toLowerCase() === "input") {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if (!assert(function(el) {
	return el.getAttribute("disabled") == null;
})) {
	addHandle(booleans, function(elem, name, isXML) {
		var val;
		if (!isXML) {
			return elem[name] === true ? name.toLowerCase() :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
		}
	});
}

/* EXPOSE */
_quanter = window.Quanter;


/**
 * Restores the original value of `window.Quanter` if it was overwritten,
 * and returns the current Quanter object.
 * Useful when avoiding conflicts with other libraries using the same global name.
 * 
 * @returns {Object} The current Quanter object.
 */
Quanter.noConflict = function() {
	window.Quanter === Quanter && (window.Quanter = _quanter);
	return Quanter;
};



// Register as named AMD module,
// since Quanter can be concatenated with other files that may use define
if (typeof define === "function" && define.amd) {
  define(function() {
    return Quanter;
  })
}

// Quanter requires that there be a global window in Common-JS like environments
else if (typeof module === "object" && module.exports) {
  module.exports = Quanter;
}

// Otherwise,
// Expose Quanter identifiers
// even in AMD and CommonJS for browser emulators
else {
  window.Quanter = Quanter;
}

/* EXPOSE */

})(window);