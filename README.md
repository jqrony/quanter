# Quanta [![npm version](https://img.shields.io/npm/v/quanta?style=flat-square)](https://www.npmjs.com/package/quanta)

> A pure-JavaScript fast, CSS selector engine program to be easily select DOM-Elements.

<img src="https://raw.githubusercontent.com/jqrony/content/main/quanta/thumbnail.png" style="width:100%;">

![license](https://img.shields.io/github/license/jqrony/quanta?style=flat-square)
[![install size](https://packagephobia.com/badge?p=quanta)](https://packagephobia.com/result?p=quanta)
![author](https://img.shields.io/badge/Author-Shahzada%20Modassir-%2344cc11?style=flat-square)
[![jsDelivr Hits](https://img.shields.io/jsdelivr/npm/hy/quanta?style=flat-square)](https://www.jsdelivr.com/package/npm/quanta)
[![downloads month](https://img.shields.io/npm/dt/quanta?style=flat-square)](https://www.npmjs.com/package/quanta)
[![Github starts](https://img.shields.io/github/stars/jqrony/quanta?style=flat-square)](https://github.com/jqrony/quanta)
[![Socket Badge](https://socket.dev/api/badge/npm/package/quanta)](https://socket.dev/npm/package/quanta)

- [More information](https://github.com/jqrony/quanta/wiki)
- [Documentation](https://github.com/jqrony/quanta/wiki)
- [Browser support](https://github.com/jqrony/quanta/wiki#browsers)
- [Quanta releases](https://github.com/jqrony/quanta/releases)
- [Latest release](https://github.com/jqrony/quanta/releases/latest)
- [Deployed source](https://jqrony.github.io/quanta/dist/quanta-min.js)

## New Features
Quanta `v1.6.0` in new features included for related advance DOM-Element Selecting Quanta library in added new features `XPath selenium` now user can be select DOM elements XPath through.

## Contribution Guides
In order to build Quanta, you should have Node.js/npm latest and git 1.6.0 or later (earlier versions might work OK, but are not tested).

For Windows you have to download and install git and [Node.js](https://nodejs.org/download/).

Mac OS users should install Homebrew. Once Homebrew is installed, run `brew install git` to install git, and `brew install` node to install Node.js.

Linux/BSD users should use their appropriate package managers to install git and Node.js, or build from source if you swing that way. Easy-peasy.

## Downloading Quanta using npm or Yarn
Quanta is registered as a <a href="https://www.npmjs.com/package/quanta">package</a> on <a href="https://www.npmjs.com/">npm</a>. You can install the latest version of Quanta with the npm CLI command:

```bash
# install locally (recomended)
yarn add quanta

# install locally (recomended)
npm install quanta --save
```
As an alternative you can use the Yarn CLI command:

### Quanta information
For information on how to get started and how to use Quanta, please see [Quanta's](https://github.com/jqrony/quanta) [documentation](https://github.com/jqrony/quanta/wiki). For source files and issues, please visit the Quanta repository.

If upgrading, please see the blog post for [release 1.6.0](https://github.com/jqrony/quanta/releases/tag/1.6.0). This includes notable differences from the previous version and a more readable changelog.

## Including Quanta
Below are some of the most common ways to include Quanta

### Browser
#### Script tag
```html
<!--including Quanta (recomended) HTML document in head section -->
<script src="https://cdn.jsdelivr.net/npm/quanta@1.8.0/dist/quanta.min.js"></script>
```

## Usage
#### Webpack / Browserify / Babel
There are several ways to use [Webpack](https://webpack.js.org/), [Browserify](https://browserify.org/) or [Babel](https://babeljs.io/). For more information on using these tools, please refer to the corresponding project's documentation. In the script, including Quanta will usually look like this:
```js
import Quanta from "quanta";
```

If you need to use Quanta in a file that's not an ECMAScript module, you can use the CommonJS syntax:
```js
const Quanta = require("quanta");
```

#### AMD (Asynchronous Module Definition)
AMD is a module format built for the browser. For more information, we recommend
```js
define(["quanta"], function(quanta) {

});
```

## Syntax code example
There are simple some usage Quanta code example syntax and learn more click [Documentation](https://github.com/jqrony/quanta/wiki).

Code example: `Quanta("body > div:nth-child(2) + main:eq(2) > :input:disabled)`


## How to build Quanta
Clone a copy of the main Quanta git repo by running:
```bash
git clone git://github.com/jqrony/quanta.git
```
In the `quanta/dist` folder you will find build version of quanta along with the minified copy and associated map file.

## Contributing Guide
See [CONTRIBUTING.md](https://github.com/jqrony/quanta/blob/main/CONTRIBUTING.md)
