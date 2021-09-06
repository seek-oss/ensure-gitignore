# ensure-gitignore

Ensure the presence of patterns within a project's gitignore.

## Usage

```js
const ensureGitignore = require('ensure-gitignore');

await ensureGitignore({
  patterns: ['node_modules', 'output']
});
```

### Options

#### filepath (string, default: '<cwd>/.gitignore')

Path to the `.gitignore` file to be used.

#### patterns (?Array\<string>)

An array of patterns to ensure are present in the specified `.gitignore` file. Any pattern that already exists in the file will be appended with the [comment](#comment). All new patterns will be appended to the bottom of the file.

<a id="comment">

#### comment (?string, default: 'managed by ensure-gitignore')

Allows you to document the list of patterns that are being controlled programmatically. This helps provide context as to what is controlling certain patterns within a `.gitignore` file. Anything inside the comment block will be re-written on each run, including the removal of old patterns that are no longer managed.

```js
const ensureGitignore = require('ensure-gitignore');

await ensureGitignore({
  patterns: ['node_modules', 'output'],
  comment: 'managed by build script'
});

// =>
// # managed by build script
// node_modules
// output
// # end managed by build script
//
```

#### dryRun (?boolean, default: false)

The file at the input path will not be updated, instead the intended output will be returned.

```js
const ensureGitignore = require('ensure-gitignore');

const result = await ensureGitignore({
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
