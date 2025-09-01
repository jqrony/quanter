# Quanter

> A Pure-JavaScript, CSS selector engine designed to be easily select DOM-Elements.

[![npm version](https://img.shields.io/npm/v/quanter?logo=npm)](https://www.npmjs.com/package/quanter)
![license](https://img.shields.io/github/license/jsvibe/quanter?style=flat-square&color=blue&logo=mit)
![author](https://img.shields.io/badge/Author-Modassir-blue)
[![jsDelivr Hits](https://img.shields.io/jsdelivr/npm/hm/quanter?logo=jsdelivr)](https://www.jsdelivr.com/package/npm/quanter)
[![downloads month](https://img.shields.io/npm/dm/quanter)](https://www.npmjs.com/package/quanter)

- [Documentation](http://github.com/jsvibe/quanter/wiki)
- [Browser support](https://github.com/jsvibe/quanter/wiki/#browsers)
- [Pseudos support](#pseudos-supports)

## How to install Quanter
To include Quanter in [Node](https://nodejs.org/), first install with npm.

```bash
npm install quanter
```

## How to build Quanter
Clone a copy of the main Sizzle git repo by running:

```bash
git clone git://github.com/jsvibe/quanter.git
```

In the `quanter/dist` folder you will find build version of sizzle along with the minified copy and associated map file.

## Including Quanter
Below are some of the most common ways to include Quanter.

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/quanter@4.4.5/dist/quanter.min.js"></script>
```

### Webpack / Browserify / Babel
There are several ways to use [Webpack](https://webpack.js.org/), [Browserify](http://browserify.org/) or [Babel](https://babeljs.io/). For more information on using these tools, please refer to the corresponding project's documentation. In the script, including Quanter will usually look like this:

```js
import quanter from "quanter";
```

## Features
### Multi Selector

The `Quanter` method allows for flexible element selection using a wide range of selector types:

- ✅ **CSS Selectors**  
  Supports tag names, class selectors (`.class`), ID selectors (`#id`), attribute selectors (`[attr=value]`), and pseudo-classes (like `:nth-child`, `:first-of-type`, etc.).

- ⚠️ **Limited XPath Support**  
  Basic XPath expressions are supported, but with limited syntax recognition. Use only for simple XPath needs.

**Best Use:** When your use case involves a mix of CSS-style selectors and simple XPath, and you want to avoid switching methods.

#### Signature and Parameters
```js
Quanter(String expr, DOMNode context, Array results, Array seed);
```

- `selector` [required] A CSS Selector or XPath Expression (comma separated or non-comma separated)
- `context` [optional] An element, document, or document fragment to use as the context for finding elements.
- `results` [optional] An optional array to which the matched elements will be added.
- `seed` [optional] A set of elements to match against

## Example

`Sample HTML`

```html
<div id="main">
  <h1 class="title">Welcome</h1>

  <ul class="items">
    <li data-id="1" class="fruit">Apple</li>
    <li data-id="2" class="fruit special">Banana</li>
    <li data-id="3" class="fruit">Cherry</li>
  </ul>

  <p class="info">Contact us at <span>support@example.com</span></p>

  <div class="products">
    <article data-stock="true" data-type="phone">
      <h2>iPhone 15</h2>
      <span class="price">$999</span>
    </article>
    <article data-stock="false" data-type="phone">
      <h2>Galaxy S25</h2>
      <span class="price">$899</span>
    </article>
    <article data-stock="true" data-type="laptop">
      <h2>MacBook Pro</h2>
      <span class="price">$1999</span>
    </article>
  </div>

  <a href="/login">Login</a>
  <a href="/register">Register</a>
</div>
```

Quanter Selector Examples (With Multiple Comma-Separated Selectors)

### Basic (Comma-separated selectors)
**ID + Class Selector**

```js
Quanter("#main, .title");
```

**Expected Output:**

- `<div id="main">...</div>`
- `<h1 class="title">Welcome</h1>`

**Class + Tag Selector**

```js
Quanter(".fruit, h1");
```

**Expected Output:**

- `<li data-id="1">Apple</li>`
- `<li data-id="2" class="fruit special">Banana</li>`
- `<li data-id="3">Cherry</li>`
- `<h1 class="title">Welcome</h1>`

### Attribute + Positional
**Attribute Equals + First Child**

```js
Quanter("li[data-id='2'], ul.items li:first-child");
```

**Expected Output:**

- `<li data-id="2" class="fruit special">Banana</li>`
- `<li data-id="1">Apple</li>`

**Attribute Contains + Last Child**

```js
Quanter("a[href*='reg'], ul.items li:last-child");
```

**Expected Output:**

- `<a href="/register">Register</a>`
- `<li data-id="3">Cherry</li>`

### Combinators + Multiple Filters
**Descendant + Direct Child**

```js
Quanter(".products .price, .products > article");
```

**Expected Output:**

- All `<span class="price">` elements inside `.products`
- All direct `<article>` elements inside `.products`

**Multiple Attributes**

```js
Quanter("article[data-stock='true'][data-type='phone'], article[data-type='laptop']");
```

**Expected Output:**

- `<article data-stock="true" data-type="phone">iPhone 15</article>`
- `<article data-stock="true" data-type="laptop">MacBook Pro</article>`

### Pseudo & Complex Chains
**First-child + Not Selector**

```js
Quanter("ul.items li:first-child, li:not(.special)");
```

**Expected Output:**

- `<li data-id="1">Apple</li>`
- `<li data-id="1">Apple</li>` (duplicate match from both selectors)
- `<li data-id="3">Cherry</li>`

### Advanced Combined Queries
**Grouping Complex Paths**

```js
Quanter("div#main .products > article[data-stock='true'] .price, li.fruit:last-child");
```

**Expected Output:**

`<span class="price">$999</span>` (iPhone 15)
`<span class="price">$1999</span>` (MacBook Pro)
`<li data-id="3">Cherry</li>`

### Combinators Supports

| Combinator | Supported | Description |
|:----------|:--------:|------------|
| * | ✓ | Universal selector (matches any element) |
| + | ✓ | Adjacent sibling combinator (next sibling only) |
| > | ✓ | Child combinator (direct child only) |
| < | ✓ | Parent combinator (selects parent of element) |
| ~ | ✓ | General sibling combinator (all following siblings) |
| ` ` | ✓ | Descendant combinator (any level child) |

### Pseudos Supports

| Pseudos | Supported | Description |
|:--------|:--------:|-------------|
| :nth-last-of-type(n) | ✓ | Element at the nth position from the end of its type |
| :nth-of-type(n) | ✓ | Element at the nth position of its type |
| :first-of-type | ✓ | First element of its type |
| :first-child | ✓ | First child of its parent |
| :last-child | ✓ | Last child of its parent |
| :last-of-type | ✓ | Last element of its type |
| :nth-child(n) | ✓ | nth child of its parent |
| :only-child | ✓ | The only child of its parent |
| :only-of-type | ✓ | The only element of its type in the parent |
| :nth-last-child(n) | ✓ | nth child from the end of its parent |
| :viewport | ✓ | Targets the viewport |
| :theme | ✓ | Applies theme-specific styles |
| :contains | ✓ | Element containing specific text |
| :icontains | ✓ | Element containing text (case-insensitive) |
| :rcontains | ✓ | Element containing text via regex |
| :ircontains | ✓ | Element containing text via regex (case-insensitive) |
| :target | ✓ | Element targeted by URL fragment |
| :has | ✓ | Element that contains a specific child/descendant |
| :xpath | ✓ | Element matched by XPath |
| :role | ✓ | Element with a specific ARIA role |
| :lang | ✓ | Element with a specific language attribute |
| :disabled | ✓ | Disabled form element |
| :enabled | ✓ | Enabled form element |
| :hidden | ✓ | Hidden element |
| :visible | ✓ | Visible element |
| :get | ✓ | Form using GET method |
| :post | ✓ | Form using POST method |
| :filter | ✓ | Filtered element |
| :not | ✓ | Element that does not match a selector |
| :indeterminate | ✓ | Checkbox/radio in an indeterminate state |
| :read-only | ✓ | Read-only input or field |
| :required | ✓ | Required form field |
| :open | ✓ | Element in open state (e.g. `<details>`) |
| :link | ✓ | Unvisited link |
| :out-of-range | ✓ | Value outside allowed range |
| :in-range | ✓ | Value within allowed range |
| :modal | ✓ | Open modal dialog |
| :paused | ✓ | Media that is paused |
| :muted | ✓ | Muted media element |
| :invalid | ✓ | Invalid input |
| :valid | ✓ | Valid input |
| :autoplay | ✓ | Media with autoplay enabled |
| :optional | ✓ | Optional (non-required) field |
| :picture-in-picture | ✓ | Video in picture-in-picture mode |
| :popover-open | ✓ | Popover currently open |
| :fullscreen | ✓ | Element in fullscreen mode |
| :playing | ✓ | Media currently playing |
| :active | ✓ | Active (clicked or focused) element |
| :defined | ✓ | Defined custom element |
| :inline | ✓ | Inline-level element |
| :root | ✓ | Root element (`<html>`) |
| :editable | ✓ | Editable element |
| :focus | ✓ | Element in focus |
| :checked | ✓ | Checked input element |
| :offset | ✓ | Element positioned with offset |
| :fixed | ✓ | Fixed-position element |
| :selected | ✓ | Selected `<option>` element |
| :parent | ✓ | Element with at least one child |
| :empty | ✓ | Element with no children |
| :header | ✓ | Header element (`h1`–`h6`) |
| :button | ✓ | Button element |
| :submit | ✓ | Submit button |
| :reset | ✓ | Reset button |
| :input | ✓ | Any input element |
| :radio | ✓ | Radio button input |
| :checkbox | ✓ | Checkbox input |
| :url | ✓ | URL input |
| :file | ✓ | File input |
| :password | ✓ | Password input |
| :email | ✓ | Email input |
| :color | ✓ | Color picker input |
| :number | ✓ | Number input |
| :text | ✓ | Text input |
| :animated | ✓ | Currently animating element |
| :first | ✓ | First matched element |
| :last | ✓ | Last matched element |
| :eq(n) | ✓ | Element at a specific index |
| :odd | ✓ | Elements at odd indexes |
| :even | ✓ | Elements at even indexes |
| :lt | ✓ | Elements with index less than given |
| :gt | ✓ | Elements with index greater than given |
| :importmap | ✓ | `<script type="importmap">` element |
| :ecmascript | ✓ | ECMAScript script element |
| :module | ✓ | `<script type="module">` element |
| :json | ✓ | `<script type="application/json">` element |

Learn for more [documentation](http://github.com/jsvibe/quanter/wiki)

### XPath Selector

The `XPathSelect` method is a specialized function built to handle **full XPath syntax**, offering complete support for:

- Complex queries
- Nested expressions
- Axes like `following-sibling`, `ancestor`, `descendant`
- Functions like `contains()`, `starts-with()`, `text()`, etc.

**Best Use:** When your use case requires powerful and deeply nested element queries using the full capabilities of XPath.

#### Signature and Parameters
```js
Quanter.XPathSelect(String expr, DOMNode context, Array results, Array seed);
```

- `expr`[required] A XPath Expression (comma separated or non-comma separated)
- `context` [optional] An element, document, or document fragment to use as the context for finding elements.
- `results` [optional] An optional array to which the matched elements will be added.
- `seed` [optional] A set of elements to match against

## Example

`Sample HTML`

```html
<html>
  <body>
    <div id="main">
      <h1 class="title">Welcome</h1>
      <ul class="items">
        <li data-id="1">Apple</li>
        <li data-id="2">Banana</li>
        <li data-id="3">Cherry</li>
      </ul>
      <a href="/login">Login</a>
      <p>  Contact us at <span>support@example.com</span>  </p>
      <div class="footer">© 2025 Company</div>
      <section class="products">
        <article data-stock="true">
          <h2>iPhone 15</h2>
          <span class="price">$999</span>
        </article>
        <article data-stock="false">
          <h2>Galaxy S25</h2>
          <span class="price">$899</span>
        </article>
      </section>
    </div>
  </body>
</html>
```

### Usage:

```js
// Select all <h1> elements
Quanter.XPathSelect('//h1');

// Element with attribute id="main"
Quanter.XPathSelect('//*[@id="main"]');

// Attribute starts-with (href starting with /log)
Quanter.XPathSelect('//a[starts-with(@href, "/log")]');

// Exact text match (li with text "Banana")
Quanter.XPathSelect('//li[text()="Banana"]');

// First <li> inside ul.items
Quanter.XPathSelect('//ul[@class="items"]/li[1]');

// Last <li> inside ul.items
Quanter.XPathSelect('//ul[@class="items"]/li[last()]');

// Following sibling of <a> (first <p> after it)
Quanter.XPathSelect('//a/following-sibling::p[1]');

// Select products that are in stock (data-stock="true")
Quanter.XPathSelect('//section[@class="products"]/article[@data-stock="true"]');

// Select price of the out-of-stock product
Quanter.XPathSelect('//article[@data-stock="false"]/span[@class="price"]/text()');
```

### Usage Multiple Expr With Comma Separated
```js
Quanter.XPathSelect('//article[@data-stock="false"]/span[@class="price"]/text(), //section[@class="products"]/article[@data-stock="true"], //a/following-sibling::p[1]');
```

## License

MIT License.

© 2025 Indian Modassir

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Learn for more [documentation](http://github.com/jsvibe/quanter/wiki)
