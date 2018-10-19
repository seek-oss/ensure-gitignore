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

const writeSync = (filepath, output, dryRun) => {
  if (!dryRun) {
    fs.writeFileSync(filepath, output);
  }
  return output;
};

const build = ({ patterns, comment, current }) => {
  const commented = str => (comment ? `${str} # ${comment}` : str);
  const managed = patterns.sort();

  const corrected = current.map(
    pattern => (managed.includes(pattern) ? commented(pattern) : pattern)
  );

  const additions = managed
    .filter(pattern => !corrected.includes(commented(pattern)))
    .map(commented);

  const outputPatterns = corrected.concat(additions);
  return `${outputPatterns.join('\n')}${
    outputPatterns[outputPatterns.length - 1] === '' ? '' : '\n'
  }`;
};

const gitignoreEnsure = async ({
  patterns = [],
  comment = '',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  const current = await readFile(filepath, 'utf-8').split(/\r?\n/);

  const output = build({ patterns, comment, current });

  return current.join('\n') !== output
    ? write(filepath, output, dryRun)
    : current.join('\n');
};

const gitignoreEnsureSync = ({
  patterns = [],
  comment = '',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  const current = fs.readFileSync(filepath, 'utf-8').split(/\r?\n/);

  const output = build({ patterns, comment, current });

  return current.join('\n') !== output
    ? writeSync(filepath, output, dryRun)
    : current.join('\n');
};

gitignoreEnsure.sync = gitignoreEnsureSync;

module.exports = gitignoreEnsure;
