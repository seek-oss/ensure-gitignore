const fs = require('fs');
const path = require('path');

const write = (filepath, output, dryRun) => {
  if (!dryRun) {
    fs.writeFileSync(filepath, output);
  }
  return output;
};

module.exports = ({
  patterns = [],
  comment = '',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  const commented = str => (comment ? `${str} # ${comment}` : str);

  const managed = patterns.sort();
  const current = fs.readFileSync(filepath, 'utf-8').split(/\r?\n/);

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
