[![Build Status](https://img.shields.io/travis/seek-oss/gitignore-ensure/master.svg?style=flat-square)](http://travis-ci.org/seek-oss/gitignore-ensure) [![npm](https://img.shields.io/npm/v/gitignore-ensure.svg?style=flat-square)](https://www.npmjs.com/package/gitignore-ensure) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

# gitignore-ensure

Ensure the presence of paths within a project's gitignore.

## Usage

```js
const ensure = require('gitignore-ensure');

ensure({
  ignores: [
    'node_modules',
    'output'
  ]
});
```

### Options

#### filepath (string, default: '<cwd>/.gitignore')
Path to the `.gitignore` file to be used.

#### ignores (?Array\<string>)
An array of strings to ensure are present in the specified `.gitignore` file. Any ignore that already exists in the file will be appended with the [suffix](#suffix). All new ignores will be appended to the bottom of the file.

<a id="suffix">

#### suffix (?string, default: "managed")
Appended to each path that is being ensured to indicate what is programmatically being controlled.

#### dryRun (?boolean, default: false)
The file at the input path will not be updated, instead the intended output will be returned.

```js
const ensure = require('gitignore-ensure');

const result = ensure({
  ignores: [
    'node_modules',
    'output'
  ],
  dryRun: true
});

// result:
// node_modules
// output
//
```

## License

MIT.
