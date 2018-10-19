[![Build Status](https://img.shields.io/travis/seek-oss/gitignore-ensure/master.svg?style=flat-square)](http://travis-ci.org/seek-oss/gitignore-ensure) [![npm](https://img.shields.io/npm/v/gitignore-ensure.svg?style=flat-square)](https://www.npmjs.com/package/gitignore-ensure) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

# gitignore-ensure

Ensure the presence of patterns within a project's gitignore.

## Usage

```js
const gitignoreEnsure = require('gitignore-ensure');

await gitignoreEnsure({
  patterns: ['node_modules', 'output']
});
```

### Options

#### filepath (string, default: '<cwd>/.gitignore')

Path to the `.gitignore` file to be used.

#### patterns (?Array\<string>)

An array of patterns to ensure are present in the specified `.gitignore` file. Any pattern that already exists in the file will be appended with the [comment](#comment). All new patterns will be appended to the bottom of the file.

<a id="comment">

#### comment (?string)

Appended to each pattern that is being ensured to indicate what is programmatically being controlled.

```js
const gitignoreEnsure = require('gitignore-ensure');

await gitignoreEnsure({
  patterns: ['node_modules', 'output'],
  comment: 'managed'
});

// =>
// node_modules # managed
// output # managed
//
```

#### dryRun (?boolean, default: false)

The file at the input path will not be updated, instead the intended output will be returned.

```js
const gitignoreEnsure = require('gitignore-ensure');

const result = await gitignoreEnsure({
  patterns: ['node_modules', 'output'],
  dryRun: true
});

// result:
// node_modules
// output
//
```

## License

MIT.
