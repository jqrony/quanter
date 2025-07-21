# Release Notes

## [v4.3.0](https://github.com/jqrony/quanter/compare/v4.2.0...v4.3.0) - 21-07-2025

* Add new pseudo `fixed` selects elements with `position: fixed`. [@indianmodassir](https://github.com/indianmodassir)
* Fixed an issue in pseudo `:hidden` and `:visible` where this method not working `dialog`, `details` and `popover=""` attribute elem. we fixed it `v4.3.0`. [@indianmodassir](https://github.com/indianmodassir)
* Fixed an minor issue and bugs `querySelectorAll` feature are disabled, we enabled `querySelectorAll` feature [@indianmodassir](https://github.com/indianmodassir)

## [v4.2.0](https://github.com/jqrony/quanter/compare/v4.1.0...v4.2.0) - 13-07-2025

* Add new pseudo `:xpath` to target elements XPath Expression through [@indianmodassir](https://github.com/indianmodassir)
* Add new pseudo `:role` to target elements role attribute value [@indianmodassir](https://github.com/indianmodassir)
* Fixed an issue in pseudo `:defined` where this method not proper working [@indianmodassir](https://github.com/indianmodassir)

## [v4.1.0](https://github.com/jqrony/quanter/compare/v4.0.0...v4.1.0) - 07-07-2025

* [4.x] Add new pseudo `:popover-open` to target elements that have their popover currently open. [@indianmodassir](https://github.com/indianmodassir)
* [4.x] Add new pseudo `:defined` to target custom elements that have been defined (registered). [@indianmodassir](https://github.com/indianmodassir)

## [v4.0.0](https://github.com/jqrony/quanter/compare/v3.0.0...v4.0.0) - 01-07-2025

* Rename pseudo `:model` to `:modal` to target elements that are displayed as modals. [@indianmodassir](https://github.com/indianmodassir)
* Add new pseudo `:rcontains` for selecting elements whose text content matches a given source. [@indianmodassir](https://github.com/indianmodassir)
* Add new pseudo `:ircontains` for **case-insensitive** source matching of element text content. [@indianmodassir](https://github.com/indianmodassir)
* Add new pseudo `:open` to target open element (e.g., details, dialog) [@indianmodassir](https://github.com/indianmodassir)
* Add new pseudo `picture-in-picture` to target active picture-in-picture element [@indianmodassir](https://github.com/indianmodassir)
* Add new pseudo `:fullscreen` to target active fullscreen element [@indianmodassir](https://github.com/indianmodassir)

## [v3.0.0](https://github.com/jqrony/quanter/compare/v2.0.1...v3.0.0) - 30-06-2025

* Remove temporary pseudo `:xpath` form Quanter [@indianmodassir](https://github.com/indianmodassir)
* Add pseudo `:importmap` matches script type [@indianmodassir](https://github.com/indianmodassir)
* Add pseudo `:module` matches script type [@indianmodassir](https://github.com/indianmodassir)
* Add pseudo `:json` matches script type [@indianmodassir](https://github.com/indianmodassir)
* Add pseudo `:ecmascript` matches script type [@indianmodassir](https://github.com/indianmodassir)
* Add new method `Quanter.isBracketBalanced()` to match proper closed bracket of given string [@indianmodassir](https://github.com/indianmodassir)
* Add new method `Quanter.XPathSelect()` to select full capabilities of XPath. [@indianmodassir](https://github.com/indianmodassir)
* Fixed bugs of xpath in `Quanter()` with limited support [@indianmodassir](https://github.com/indianmodassir)

## [v2.0.1](https://github.com/jqrony/quanter/compare/v2.0.0...v2.0.1) - 23-06-2025

* Fixed an issue in `Quanter.selectors.pseudos["has"]` where this method not proper working showing error `contains` not a function [@indianmodassir](https://github.com/indianmodassir)

## [v2.0.0](https://github.com/jqrony/quanter/compare/v1.6.2...v2.0.0) - 26-06-2025

* Removed `Quanter.selectors.pseudos["named"` pseudo [@indianmodassir](https://github.com/indianmodassir)
* Fixed an issue in `Quanter.uniqueSort` where this method not proper working [@indianmodassir](https://github.com/indianmodassir)

## [v1.6.3](https://github.com/jqrony/quanter/compare/v1.6.2...v1.6.3) - 20-06-2025

* Fixed an issue in `Quanter.contains` where this method not proper working showing error `contains` not a function [@indianmodassir](https://github.com/indianmodassir)

## [v1.6.2](https://github.com/jqrony/quanter/compare/v1.6.1...v1.6.2) - 20-06-2025

* Fixed an issue in `Quanter(selector, context, results, seed)` where the `context` parameter was not working correctly. [@indianmodassir](https://github.com/indianmodassir)

## [v1.6.1](https://github.com/jqrony/quanter/compare/v1.6.0...v1.6.1) - 15-06-2025

* Fixed missing method `:xpath` in minified file `quanter.min.js` [@indianmodassir](https://github.com/indianmodassir)

## [v1.6.0](https://github.com/jqrony/quanter/compare/v1.5.0...v1.6.0) - 15-06-2025

* Add `:xpath` pseudo method in Quanter [@indianmodassir](https://github.com/indianmodassir)

## [v1.5.0](https://github.com/jqrony/quanter/compare/v1.0.4...v1.5.0) - 15-06-2025

* Add `:editable` pseudo method in Quanter [@indianmodassir](https://github.com/indianmodassir)

Quanter 1 includes a variety of changes to the application skeleton. Please consult the diff to see what's new.
