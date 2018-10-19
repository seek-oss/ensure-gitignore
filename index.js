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
  suffix = 'managed',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  const suffixed = str => `${str} # ${suffix}`;

  const managed = ignores.sort();
  const current = fs.readFileSync(filepath, 'utf-8').split(/\r?\n/);

  const corrected = current
    // if `ignore` exact match to `managed ignore` append suffix
    .map(ignore => (managed.includes(ignore) ? suffixed(ignore) : ignore));

  const additions = managed
    // filter out ignores already present
    .filter(ignore => !corrected.includes(suffixed(ignore)))
    // append suffix to `managed ignore`
    .map(suffixed);

  const outputIgnores = corrected.concat(additions);
  const output = `${outputIgnores.join('\n')}${
    outputIgnores[outputIgnores.length - 1] === '' ? '' : '\n'
  }`;

  return current.join('\n') !== output
    ? write(filepath, output, dryRun)
    : current.join('\n');
};
