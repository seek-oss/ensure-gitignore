const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const write = async (filepath, output, dryRun) => {
  if (!dryRun) {
    await writeFile(filepath, output);
  }
  return output;
};

module.exports = async ({
  patterns = [],
  comment = '',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  const commented = str => (comment ? `${str} # ${comment}` : str);

  const managed = patterns.sort();
  const contents = await readFile(filepath, 'utf-8');
  const current = contents.split(/\r?\n/);

  const corrected = current.map(
    pattern => (managed.includes(pattern) ? commented(pattern) : pattern)
  );

  const additions = managed
    .filter(pattern => !corrected.includes(commented(pattern)))
    .map(commented);

  const outputPatterns = corrected.concat(additions);
  const output = `${outputPatterns.join('\n')}${
    outputPatterns[outputPatterns.length - 1] === '' ? '' : '\n'
  }`;

  return current.join('\n') !== output
    ? write(filepath, output, dryRun)
    : current.join('\n');
};
