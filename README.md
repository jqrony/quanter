# Quanter [![npm version](https://img.shields.io/npm/v/quanter?style=flat-square)](https://www.npmjs.com/package/quanter)

> A pure-JavaScript fast, CSS selector engine program to be easily select DOM-Elements.

![license](https://img.shields.io/github/license/jqrony/quanter?style=flat-square)
[![install size](https://packagephobia.com/badge?p=quanter)](https://packagephobia.com/result?p=quanter)
![author](https://img.shields.io/badge/Author-Indian%20Modassir-%2344cc11?style=flat-square)
[![jsDelivr Hits](https://img.shields.io/jsdelivr/npm/hy/quanter?style=flat-square)](https://www.jsdelivr.com/package/npm/quanter)
[![downloads month](https://img.shields.io/npm/dt/quanter?style=flat-square)](https://www.npmjs.com/package/quanter)
[![Github starts](https://img.shields.io/github/stars/jqrony/quanter?style=flat-square)](https://github.com/jqrony/quanter)

## Contribution Guides
In order to build Quanter, you should have Node.js/npm latest and git 1.6.0 or later (earlier versions might work OK, but are not tested).

For Windows you have to download and install git and [Node.js](https://nodejs.org/download/).

Mac OS users should install Homebrew. Once Homebrew is installed, run `brew install git` to install git, and `brew install` node to install Node.js.

Linux/BSD users should use their appropriate package managers to install git and Node.js, or build from source if you swing that way. Easy-peasy.

## Downloading Quanter using npm or Yarn
Quanter is registered as a <a href="https://www.npmjs.com/package/quanter">package</a> on <a href="https://www.npmjs.com/">npm</a>. You can install the latest version of Quanter with the npm CLI command:

```bash
# install locally (recomended)
yarn add quanter

# install locally (recomended)
npm install quanter --save
```
As an alternative you can use the Yarn CLI command:

### Quanter information
For information on how to get started and how to use Quanter, please see [Quanter's](https://github.com/jqrony/quanter) [documentation](https://github.com/jqrony/quanter/wiki). For source files and issues, please visit the Quanter repository.

If upgrading, please see the blog post for [release 1.6.0](https://github.com/jqrony/quanter/releases/tag/1.6.0). This includes notable differences from the previous version and a more readable changelog.

## Including Quanter
Below are some of the most common ways to include Quanter

### Browser
#### Script tag
```html
<!--including Quanter (recomended) HTML document in head section -->
<script src="https://cdn.jsdelivr.net/npm/quanter@1.6.0/dist/quanter.min.js"></script>
```

#### For module
```js
import quanter from 'https://cdn.jsdelivr.net/npm/quanter@1.6.0/+esm'
```

## Usage
#### Webpack / Browserify / Babel
There are several ways to use [Webpack](https://webpack.js.org/), [Browserify](https://browserify.org/) or [Babel](https://babeljs.io/). For more information on using these tools, please refer to the corresponding project's documentation. In the script, including Quanter will usually look like this:
```js
import Quanter from "quanter";
```

#### AMD (Asynchronous Module Definition)
AMD is a module format built for the browser. For more information, we recommend
```js
define(["quanter"], function(quanter) {

});
```

## Syntax code example
There are simple some usage Quanter code example syntax and learn more click [Documentation](https://github.com/jqrony/quanter/wiki).

Code example: `Quanter("body > div:nth-child(2) + main:eq(2) > :input:disabled)`


## How to build Quanter
Clone a copy of the main Quanter git repo by running:
```bash
git clone git://github.com/jqrony/quanter.git
```
In the `quanter/dist` folder you will find build version of quanter along with the minified copy and associated map file.

## Contributing Guide
See [CONTRIBUTING.md](https://github.com/jqrony/quanter/blob/main/CONTRIBUTING.md)