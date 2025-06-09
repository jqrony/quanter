/**
 * Quanter CSS Selector Engine v1.0.2
 * https://github.com/jqrony/quanter
 * 
 * @license MIT License
 * @author Indian Modassir
 * Date: 23 April 2025 11:52 GMT+0530
 */
(function(window) {

// Catches errors and disallows unsafe actions
"use strict";

var version = "1.0.2",
  i,
  support,
  unique,
  Expr,
  getText,
  isXML,
  tokenize,
  select,
	contains,
  flat,
  _quanter,
  eachMap,
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
	push    = arr.push,
  concat  = arr.concat,
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

	rcombinators = new RegExp("^" + whitespace+ "*([>+^~<]|" +whitespace+ ")" + whitespace + "*"),
	rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

  ridentifier = new RegExp("^" + identifier + "$"),

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
  rhtml = /HTML$/i,
  rnative = /^[^{]+\{\s*\[native \w/,
  rnodeType = /^(?:1|9|11)$/,
  rnoAnimation = /^(none)\s*(0s)\s*(ease)\s*(0s).*(running)/,

  matchExpr = {
    "ID": new RegExp("^#(" + identifier + ")"),
		"CLASS": new RegExp("^\\.(" + identifier + ")"),
		"TAG": new RegExp("^(" + identifier + "|[*])"),
		"ATTR": new RegExp("^" + attributes),
		"PSEUDO": new RegExp("^" + pseudos),
		"CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
    "XPATH": /^\/([^,]+)$/
  };

/**
 * @internal
 * Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth.
 * 
 * @param {Array} array An Array to flat
 * @returns {Array} New flatten array
 */
flat = function(array) {
  return arr.flat ? arr.flat.call(array) : concat.apply([], array);
};

/**
 * @internal
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
 * @internal
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
 * Create Quanter public API
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
  var match, s, elem,
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

    // If the selector is sufficiently simple, try using a "get*By*" DOM method
		// (excepting DocumentFragment context, where the methods don't exist)
    match = nodeType !== 11 && rquickExpr.exec(selector);

    if (documentIsHTML && match) {
      
      // QSA Support
      // Take advantage of querySelectorAll
      if (support.QSA) {
        return push.apply(results, selectAll(selector)), results;
      }

      // If the QSA not support, try using a "get*By*" DOM method
      if ((s = match[1])) {
        context = nodeType !== 9 ? newContext : context;

        // Support: IE, Opera, Webkit
        // TODO: identify versions
        // getElementById can match elements by name instead of ID
        elem = context.getElementById(s);
        elem.id === s && results.push(elem);
        return results;
      } else if (match) {
        // Type/TAG Selector or CLASS Selector
        s = match[2] || match[3];
        elem = document["getElementsBy" + (match[2] ? "Tag" : "Class") + "Name"](s);
        push.apply(results, elem);
        return results;
      }
    }
  }

  // All others complex selectors
	return select(selector.replace(rtrim, "$1"), context, results, seed);
}

/**
 * This function returns the nodeName of the given element (elem).
 * It ensures case-insensitive handling of the tag name and handles undefined or null elements gracefully.
 * 
 * @param {HTMLElement} elem [required]
 * @returns {String|Boolean} The nodeName of the elem,
 * or false if the element has no nodeName exists.
 */
function nodeName(elem) {
  return elem.nodeName && elem.nodeName.toLowerCase();
}

/**
 * Sets document-related variables once based on the current document.
 * 
 * @param {HTMLElement} node An element or document object to use to set the document
 * @returns {HTMLDocument} Rreturns current HTML document
 */
setDocument = Quanter.setDocument = function(node) {
  var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

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

  Expr.find["CLASS"] = support.getByClass ?
    function(className, context) {
      if (documentIsHTML) {
        return context.getElementsByClassName(className) || selectAll(className, context);
      }
    } :
    function(className, context) {
      return Quanter(className, context);
    }

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

  Expr.find["ELEMENTS"] = function(elem) {
    return slice.call(Expr.find["TAG"]("*", elem));
  };

  if (support.getById) {
    Expr.filter["ID"] = function(id) {
      return eachMap(function(elem) {
        return elem.getAttribute("id") === id;
      });
    };
    Expr.find["ID"] = function(id, context) {
      var elem = documentIsHTML && context.getElementById(id);
			return elem ? [elem] : [];
    };
  } else {
    Expr.filter["ID"] = function(id) {
      return eachMap(function(elem) {
        var node = invoke(elem, "getAttributeNode", id);
        return node && node.value === id;
      });
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

  // Contains
	// Element contains another Purposefully self-exclusive
	// As in, an element does not contain itself
  hasCompare = rnative.test(document.compaireDocumentPosition);
  contains = hasCompare || rnative.test(docElem.contains) ?
		function(context, elem) {
			var html = context.nodeType === 9 ?
				context.documentElement : context,
				pnode = elem && elem.parentNode,
				compare = context.compaireDocumentPosition;

			return html === pnode || !!(pnode && pnode.nodeType === 1 &&
				(invoke(context, "contains", elem) || compare(elem))
			);
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
	return !rhtml.test(namespace || docElem && docElem.nodeName || "HTML");
};

/**
 * This method removes duplicate values from given array
 * 
 * @param {Array} results [required]
 * @returns {Array} Returns a unique array
 */
unique = Quanter.unique = function(results) {
  var i = 0, len = results.length,
    copy = results.slice(0);
    results.length = 0;

  for(; i < len; i++) {
		if (indexOf.call(copy, copy[i]) === i) {
			results.push(copy[i]);
		}
	}

  return results;
};

Quanter.error = function(msg) {
  throw new SyntaxError("Unrecognized expression: " + msg);
};

attrVal = Quanter.attrVal = function(elem, attr, prop) {
  return invoke(elem, prop || "getAttribute", attr);
};

/**
 * Document elements sorting and removing duplicates
 * @param {ArrayLike} results An ArrayLike array
 * @returns A sorted unique Array
 */
Quanter.uniqueSort = function(results) {
  return unique(results).slice(0).sort();
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

Quanter.contains = function(context, elem) {

  // Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
  (context.ownerDocument || context) !== document && setDocument();
  return contains(context, elem);
};

Quanter.attr = function(elem, name) {

  // Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when
	// strict-comparing two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
  (elem.ownerDocument || elem) !== document && setDocument(elem);

  name = (name || "").toLowerCase();
  var fn = Expr.attrHandle[name],

    // Don't get fooled by Object.prototype properties
    val = fn && hasOwn.call(Expr.attrHandle, name) ?
      fn(elem) :
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
  var text = "",
    nodeType = elem.nodeType;

  // Handle none-element object
  if (!nodeType) {

    // If no nodeType, this is expected to be an array
    eachMap(function(el) {
      
      // Do not traverse comment nodes
      text += getText(el);

    })(elem);
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
  } else if (nodeType === 3 || nodeType === 4) {
    return elem.nodeValue;
  }

  // Do not include comment or processing instruction nodes
  return text;
};

/**
 * @internal
 * Creates a higher-order function that performs both "each" and "map"-like operations.
 * 
 * @param {Function} fn   [required] A callback function
 * @param {Boolean} isMap [optional] true/false
 * @returns 
 */
function eachMap(fn, isMap) {
  return function(obj) {
    var value, len = obj.length,
      i = 0,
      ret = [];

    for(; i < len; i++) {
      value = fn(obj[i], i, obj, length, []);
      value && (isMap ? ret.push(value) : ret.push(obj[i]));
    }

    return unique(flat(ret));
  };
};

/**
 * @internal
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
 * @internal
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
 * @internal
 * Allow to extends none-existable new pseudo from outside
 * 
 * @param {string} pseudo    [required]
 * @param {Function} fn      [required]
 * @param {boolean} markable [optional]
 */
function extendPseudo(pseudo, fn, markable) {
  
  if (Expr.pseudo[pseudo]) {
    Quanter.error("Pseudo : " + pseudo + " already exists");
  }

  Expr.pseudo[pseudo] = markable ? markFunction(fn) : fn;
}

/**
 * @internal
 * Returns a function to use multi combinators (e.g., [>+^~<])
 * 
 * @param {Object} src [required]
 * @returns matched elements results
 */
function addCombinators(src) {
  var tmp = [], {dir, type, method} = src, once = !!src.once;
  return eachMap(function(elem) {
    if (once || method) {
      return once ? elem[dir] : Expr[method][type](elem);
    } else {
      while((elem = elem[dir]) && elem.nodeType === 1) {
        tmp.push(elem);
      }
      return tmp;
    }
  }, true);
}

/**
 * @internal
 * Returns a function to use in pseudos for positionals
 * 
 * @param {Function} fn
 */
function positionalPseudo(fn) {
  return function(results) {
    var j, matches = [],
    matchesIndex = fn([], results.length, results),
    i = matchesIndex.length;

    while(i--) {
      if (results[(j = matchesIndex[i])]) {
        matches[i] = results[j];
      }
    }
    return matches;
  }
}

/**
 * @internal
 * Returns a function to use in pseudos for attributes
 * 
 * @param {String} expr 
 * @param {String} attr 
 * @param {Boolean} not 
 */
function attrPseudo(expr, attr, not) {
  return eachMap(function(elem) {
    var name = nodeName(elem);
    return (typeof expr === "string" ? name === expr : expr.test(name)) &&
      !!elem[attr] === !not;
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for buttons or inputs
 * 
 * @param {String} type
 * @returns inputs or buttons element
 */
function inputButtonPseudo(type, tag) {
  return eachMap(function(elem) {
    return nodeName(elem) === tag && elem.type === type;
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for hidden/visible element
 * 
 * @param {Boolean} hidden 
 * @returns 
 */
function hiddenPseudo(hidden) {
  return eachMap(function(elem) {
    var visibility = style(elem, "visibility"),
				display = style(elem, "display");
			return (visibility === "hidden" || display === "none" || elem.hidden) === hidden;
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for filter elements
 * 
 * @param {Boolean} not 
 * @returns 
 */
function filterPseudo(not) {
  return markFunction(function(selector) {
    var target = Quanter.matches(selector);
    return eachMap(function(elem) {
      return (indexOf.call(target, elem) > -1) === not;
    });
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for form element
 * 
 * @param {String} method 
 * @returns 
 */
function formPseudo(method) {
  return eachMap(function(elem) {
    return nodeName(elem) === "form" && elem.method.toLowerCase() === method;
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for input with range
 * 
 * @param {Boolean} inRange 
 * @returns 
 */
function rangePseudo(inRange) {
  return eachMap(function(elem) {
    var isNumInput = nodeName(elem) === "input" && elem.type === "number",
      val = +elem.value,
      min = +elem.min,
      max = +elem.max;
    return isNumInput && (min <= val && max >= val) === inRange;
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for input valid element
 * 
 * @param {Boolean} isValid 
 * @returns 
 */
function validPseudo(isValid) {
  return eachMap(function(elem) {
    return rnative.test(elem.checkValidity) && elem.checkValidity() === isValid;
  });
}

/**
 * @internal
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function disabledPseudo(disabled) {
  // Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
  return eachMap(function(elem) {
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
  });
}

Expr = Quanter.selectors = {
  // createPseudo to create arg based markable :pseudo
  createPseudo: markFunction,
  // extendPseudo to extend new none-existable :pseudo
  extendPseudo: extendPseudo,
  combinators: {},
  attrHandle: {},
  find: {},
  match: matchExpr,
  relative: {
    "+": {dir: "nextElementSibling", once: true},
		"<": {dir: "parentNode", once: true},
    "~": {dir: "nextElementSibling"},
    " ": {type: "ELEMENTS", method: "find"},
		">": {type: "CHILDREN", method: "find"}
  },
  preFilter: {
    "XPATH": function(match) {
      match[1] = match[0];
      return match.slice(0, 2);
    },
    "CLASS": function(match) {
      return match.slice(0, 2);
    },
    "ATTR": function(match) {
      // Move the given value to match[3] whether quoted or unquoted
			match[3] = (match[3] || match[4] || match[5] || "");
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
      match[4] = match[0].toLowerCase();

      if (match[1].slice(0, 3) === "nth") {
        
        // nth-* requires argument
        if (!match[3]) {
          Quanter.error(match[0]);
        }

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
  filter: {
    "XPATH": markFunction(function(expr) {
      return eachMap(function(elem) {
        try {
          // Support: Chrome, Firefox, Edge, Safari, Opera, IE9+
		      // https://developer.mozilla.org/en-US/docs/Web/XPath
          var result = document.evaluate(expr, elem, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null),
            i = result.snapshotLength,
            tmp = [];

          // Retrive all matched elements
          while(i--) {
            tmp.push(result.snapshotItem(i));
          }

          return indexOf.call(tmp, elem) > -1;
        } catch(e) {
          Quanter.error("unsupport expression: " + expr);
        }
      });
    }),
    "TAG": markFunction(function(tagName) {
      tagName = tagName.toLowerCase();
      return eachMap(function(elem) {
        return tagName === "*" ? true : nodeName(elem) === tagName;
      });
    }),
    "CLASS": markFunction(function(className) {
      return eachMap(function(elem) {
        var pattern;
				return (pattern=new RegExp("(^|" + whitespace + ")" +
					className + "(" + whitespace + ")|$")) &&
					pattern.test(attrVal(elem, "class") || elem.className || "");
      });
    }),
    "ATTR": markFunction(function(name, operator, check) {
      return eachMap(function(elem) {
        var result = Quanter.attr(elem, name);

				if (result == null) {
					return operator === "!=";
				}

				if (!operator) {
					return !!result;
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
      });
    }),
    "CHILD": markFunction(function(type, what, _arg, expr) {
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
      return eachMap(function(elem) {
        var node, start,
          dir = simple !== forward ? "nextSibling" : "previousSibling",
          name = nodeName(elem);
        
        // Take advantage of querySelectorAll support
        if (support.QSA) {
          return indexOf.call(selectAll(expr), elem) > -1;
        }

        if (elem.parentNode) {

          // Handle none-argument CHILD
          // :(first|last|only)-(child|of-type)
          if (simple) {
            while(dir) {
              node = elem;
              while((node = node[dir])) {
                if (ofType ? nodeName(node) === name : node.nodeType === 1) {
                  return false;
                }
              }
              // Reverse direction for :only-* (if we haven't yet done so)
							start = dir = type === "only" && !start && "nextSibling";
            }
            return true;
          }
        }
      });
    }),
    "PSEUDO": markFunction(function(pseudo, arguemnt) {

      // pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
      var fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
					Quanter.error( "unsupported pseudo: " + pseudo);

      // The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Quanter does
      return fn[expando] ?
				fn(arguemnt) :
				fn;
    })
  },
  pseudos: {
    "viewport": eachMap(function(elem) {
      return nodeName(elem) === "meta" && elem.name === "viewport";
    }),
    "theme": eachMap(function(elem) {
      return nodeName(elem) === "meta" && rthemes.test(elem.name);
    }),
    "contains": markFunction(function(text) {
      return eachMap(function(elem) {
        return (elem.textContent || getText(elem)).indexOf(text) > -1;
      });
    }),
    "icontains": markFunction(function(text) {
      return eachMap(function(elem) {
        return (
          elem.textContent ||
          getText(elem) || ""
        ).toLowerCase().indexOf(text.toLowerCase()) > -1;
      });
    }),
    /* Miscellaneous */
    "target": eachMap(function(elem) {
      var hash = window.location && window.location.hash;
      return hash && hash.slice(1) === elem.id;
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

      return eachMap(function(elem) {
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
      });
    }),
    /* Boolean and Inline properties */
    "disabled": disabledPseudo(true),
    "enabled": disabledPseudo(false),
    "hidden": hiddenPseudo(true),
    "visible": hiddenPseudo(false),
    "not": filterPseudo(false),
    "get": formPseudo("get"),
    "post": formPseudo("post"),
    "has": filterPseudo(true),
    "filter": filterPseudo(false),
    /* CSS3 predefine default pseudo */
    "indeterminate": attrPseudo("input", "indeterminate"),
    "required": attrPseudo("input", "required"),
    "readonly": attrPseudo("input", "readOnly"),
    "link": attrPseudo("a", "href"),
    "out-of-range": rangePseudo(false),
    "in-range": rangePseudo(true),
    "model": attrPseudo("input", "open"),
    "paused": attrPseudo(rplayable, "paused"),
    "muted": attrPseudo(rplayable, "muted"),
    "invalid": validPseudo(false),
    "valid": validPseudo(true),
    "autoplay": attrPseudo(rplayable, "autoplay"),
    "optional": attrPseudo("input", "required", true),
    "active": eachMap(function(elem) {
      return elem.activeElement;
    }),
    "inline": eachMap(function(elem) {
      return ritags.test(elem.nodeName);
    }),
    "root": eachMap(function(elem) {
      return elem === docElem;
    }),
    "focus": eachMap(function(elem) {
      return elem === elem.activeElement ||
        (!document.hasFocus && document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
    }),
    "checked": eachMap(function(elem) {
      // In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      var nodeName = nodeName(elem);
      return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
    }),
    "offset": eachMap(function(elem) {
      return style(elem, "position") !== "static";
    }),
    "selected": eachMap(function(elem) {
      // Accessing this property makes selected-by-default
			// options in Safari work properly
			// eslint-disable-next-line no-unused-expressions
      elem.parentNode && elem.parentNode.selectedIndex;
			return elem.selected === true;
    }),
    "parent": function(seed) {
      return eachMap(function(elem) {
        return indexOf.call(Expr.pseudos.empty(seed), elem) === -1;
      })(seed);
    },
    /* Contents */
    "empty": eachMap(function(elem) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text:3; cdata:4; Clazzer ref:5),
			// but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
      for(elem = elem.firstChild; elem; elem = elem.nextSibling) {
				if (elem.nodeType < 6) {
					return false;
				}
			}
			return true;
    }),
    /* Element/input types and Headers */
    "header": eachMap(function(elem) {
      return rheader.test(elem.nodeName);
    }),
    "input": eachMap(function(elem) {
      return rinputs.test(elem.nodeName);
    }),
    "button": eachMap(function(elem) {
      var name = nodeName(elem);
      return name === "button" || (name === "input" && elem.type === "button");
    }),
    "text": eachMap(function(elem) {
      var attr;
      return nodeName(elem) === "input" &&
        elem.type === "text" &&
        // Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with type==="text"
        ((attr = attrVal(elem, "type")) == null || attr.toLowerCase() === "text");
    }),
    "named": markFunction(function(name) {
      return eachMap(function(elem) {
        return name ? elem.name === name : elem.hasAttribute(name);
      });
    }),
    "animated": eachMap(function(elem) {
      return nodeName(elem) === "marquee" || !rnoAnimation.test(style(elem, "animation"));
    }),
    /* Position-in-collection pseudos */
    "first": positionalPseudo(function() {
      return [0];
    }),
    "last": positionalPseudo(function(_, length) {
      return [length - 1];
    }),
    "eq": markFunction(function(i) {
      return positionalPseudo(function(_, length) {
        return [i < 0 ? i + length : i];
      });
    }),
    "odd": eachMap(function(_, i) {
      return i % 2;
    }),
    "even": eachMap(function(_, i) {
      return (i + 1) % 2;
    }),
    "lt": markFunction(function(i) {
      return positionalPseudo(function(matchesIndex, length) {
        i = i < 0 ? ~~i + length : i > length ? length : i;
				for(; --i >= 0;) matchesIndex.push(i);
				return matchesIndex.reverse();
      });
    }),
    "gt": markFunction(function(i) {
      return positionalPseudo(function(matchesIndex, length) {
        i = i < 0 ? ~~i + length : i > length ? length : i;
				for(; ++i < length;) matchesIndex.push(i);
				return matchesIndex;
      });
    }),
    "playing": eachMap(function(elem) {
      return rplayable.test(elem.nodeName) && !(elem.paused && elem.muted);
    })
  }
};

Expr.pseudos["nth"]	= Expr.pseudos["eq"];

// Add Expr.relative Combinators
for(i in Expr.relative) {
	Expr.combinators[i] = addCombinators(Expr.relative[i]);
}

// Add button/input type pseudos
for(i of ["submit", "reset"]) {
  Expr.pseudos[i] = inputButtonPseudo(i, "button");
}
for(i of ["radio", "checkbox", "file", "password", "email", "color", "number"]) {
  Expr.pseudos[i] = inputButtonPseudo(i, "input");
}

tokenize = Quanter.tokenize = function(selector) {
  var soFar, matched, match, groups, tokens,
		type, preFilters;

  preFilters = Expr.preFilter;
  soFar = selector.trim();
	groups = [];
	
  while(soFar) {

    // Comma and first run
    if (!matched || (match = rcomma.exec(soFar))) {
      if (match) {

        // Don't consume trailing commas as valid
        soFar = soFar.slice(match[0].length) || soFar;
      }
      groups.push((tokens = []));
    }

    matched = false;

    // Combinators
    if ((match = rcombinators.exec(soFar))) {
      matched = match.shift();

      tokens.push({
        value: matched,
        // Cast descendant combinators to space
        type: match[0].replace(rtrim, " ")
      });
      soFar = soFar.slice(matched.length);
    }

    // Filters
    for(type in Expr.filter) {
      if ((match = matchExpr[type].exec(soFar)) &&
      (!preFilters[type] || (match = preFilters[type](match)))) {
        matched = match.shift();

        tokens.push({
          value: matched,
          type,
          matches: match
        });
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
  return soFar ?
    Quanter.error(soFar) :
    groups.slice(0);
};

/**
 * @param {String}  selector
 * @param {Element} context
 * @param {Array}   [results]
 * @param {Array}   [seed] A set of elements to match against
 */
select = Quanter.select = function(selector, context, results, seed) {
  var j, tokens, token, fn, src, type,
    match = tokenize(selector),
    i = match.length;

  results = results || [];

  while(i--) {
    tokens = match[i];
    j = 0;

    // Force seed or extract context elements
    src = slice.call(
      seed ||
      Expr.find["TAG"]("*", !context.nodeType ? document : context)
    );

    // For single combinator
    if (tokens.length === 1 && rcombinators.test(tokens[0].type)) {
      src = [context];
    }

    // Start selecting
    while((token = tokens[j++])) {
      type = token.type;

      src = (fn = Expr.combinators[type]) ?
        fn(src) : Expr.filter[type].apply(null, token.matches)(src);
    }

    push.apply(results, src);
  }

  return Quanter.uniqueSort(results);
};

/**
 * setFilters
 * Easy API for creating new setFilters for Expr
 */
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize against the default document
setDocument();

// The current version of Quanter being used
Quanter.version = version;

_quanter = window.Quanter;

Quanter.noConflict = function() {
	window.Quanter === Quanter && (window.Quanter = _quanter);
	return Quanter;
}

// Register as named AMD module,
// since Quanter can be concatenated with other files that may use define
typeof define === 'function' && define.amd ?
  define(function() {
    return Quanter;
  // Expose Quanter identifiers, Even in AMD and CommonJS for browser emulators
  }) : (window.Quanter = Quanter);



return Quanter;
})(window);