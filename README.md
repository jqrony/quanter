# Quanter [![npm version](https://img.shields.io/npm/v/quanter?style=flat-square)](https://www.npmjs.com/package/quanter)

> A Pure-JavaScript, CSS selector engine designed to be easily select DOM-Elements.

![author](https://img.shields.io/badge/Author-Indian%20Modassir-blue?style=flat-square)
[![downloads](https://img.shields.io/npm/dt/quanter?color=blue&style=flat-square)](https://www.npmjs.com/package/quanter)
[![jsDelivr Hits](https://img.shields.io/jsdelivr/npm/hm/quanter?style=flat-square)](https://www.jsdelivr.com/package/npm/quanter)
[![downloads month](https://img.shields.io/npm/dm/quanter?style=flat-square)](https://www.npmjs.com/package/quanter)

[Documentation](http://github.com/jqrony/quanter/wiki)
[Browser support](https://github.com/jqrony/quanter/wiki/#browsers)

## How to install Quanter
To include Quanter in [Node](https://nodejs.org/), first install with npm.

```bash
npm install quanter
```

## How to build Quanter
Clone a copy of the main Sizzle git repo by running:

```bash
git clone git://github.com/jqrony/quanter.git
```

In the `quanter/dist` folder you will find build version of sizzle along with the minified copy and associated map file.

## Including Quanter
Below are some of the most common ways to include Quanter.

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/quanter@3.0.1/dist/quanter.min.js"></script>
```

### Webpack / Browserify / Babel
There are several ways to use [Webpack](https://webpack.js.org/), [Browserify](http://browserify.org/) or [Babel](https://babeljs.io/). For more information on using these tools, please refer to the corresponding project's documentation. In the script, including Quanter will usually look like this:

```js
import quanter from "quanter";
```

## Features
### Multi Selector

The `Quanter(selector, context, results, seed)` method allows for flexible element selection using a wide range of selector types:

- ✅ **CSS Selectors**  
  Supports tag names, class selectors (`.class`), ID selectors (`#id`), attribute selectors (`[attr=value]`), and pseudo-classes (like `:nth-child`, `:first-of-type`, etc.).

- ⚠️ **Limited XPath Support**  
  Basic XPath expressions are supported, but with limited syntax recognition. Use only for simple XPath needs.

**Best Use:** When your use case involves a mix of CSS-style selectors and simple XPath, and you want to avoid switching methods.

#### Signature and Parameters
```js
Quanter.XPathSelect(string expr, DOMNode context, Array results, Array seed);
```

- `selector` [required] A CSS Selector or XPath Expression (comma separated or non-comma separated)
- `context` [optional] An element, document, or document fragment to use as the context for finding elements.
- `results` [optional] An optional array to which the matched elements will be added.
- `seed` [optional] A set of elements to match against

Learn for more [documentation](http://github.com/jqrony/quanter/wiki)

### XPath Selector

The `Quanter.XPathSelect(expr, context, results, seed)` method is a specialized function built to handle **full XPath syntax**, offering complete support for:

- Complex queries
- Nested expressions
- Axes like `following-sibling`, `ancestor`, `descendant`
- Functions like `contains()`, `starts-with()`, `text()`, etc.

**Best Use:** When your use case requires powerful and deeply nested element queries using the full capabilities of XPath.

#### Signature and Parameters
```js
Quanter.XPathSelect(string expr, DOMNode context, Array results, Array seed);
```

- `expr`[required] A XPath Expression (comma separated or non-comma separated)
- `context` [optional] An element, document, or document fragment to use as the context for finding elements.
- `results` [optional] An optional array to which the matched elements will be added.
- `seed` [optional] A set of elements to match against

Learn for more [documentation](http://github.com/jqrony/quanter/wiki)