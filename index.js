const fs = require('fs');
const path = require('path');

const write = (filepath, output, dryRun) => {
  if (!dryRun) {
    fs.writeFileSync(filepath, output);
  }
  return output;
};

module.exports = ({
  ignores = [],
  comment = '',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  const commented = str => (comment ? `${str} # ${comment}` : str);

  const managed = ignores.sort();
  const current = fs.readFileSync(filepath, 'utf-8').split(/\r?\n/);

  const corrected = current
    // if `ignore` exact match to `managed ignore` append comment
    .map(ignore => (managed.includes(ignore) ? commented(ignore) : ignore));

  const additions = managed
    // filter out ignores already present
    .filter(ignore => !corrected.includes(commented(ignore)))
    // append comment to `managed ignore`
    .map(commented);

  const outputIgnores = corrected.concat(additions);
  const output = `${outputIgnores.join('\n')}${
    outputIgnores[outputIgnores.length - 1] === '' ? '' : '\n'
  }`;

  return current.join('\n') !== output
    ? write(filepath, output, dryRun)
    : current.join('\n');
};
