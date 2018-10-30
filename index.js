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

const trimArray = arr =>
  arr
    .join('\n')
    .trim()
    .split('\n');

module.exports = async ({
  patterns = [],
  comment = 'managed by ensure-gitignore',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false
}) => {
  let contents = '';
  try {
    contents = await readFile(filepath, 'utf-8');
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  const sortedPatterns = patterns.sort();
  const rawPatterns = contents
    .trim()
    .split(/\r?\n/)
    .filter(pattern => !sortedPatterns.includes(pattern));

  const startComment = `# ${comment}`;
  const endComment = `# end ${comment}`;
  const startIndex = rawPatterns.indexOf(startComment);
  const endIndex = rawPatterns.indexOf(endComment);

  const before =
    startIndex >= 0 ? trimArray(rawPatterns.slice(0, startIndex)) : rawPatterns;
  const after =
    endIndex >= 0
      ? trimArray(rawPatterns.slice(rawPatterns.indexOf(endComment) + 1))
      : [];

  const controlledPatterns =
    patterns.length > 0
      ? [`\n${startComment}`, ...sortedPatterns, endComment]
      : [];

  const outputPatterns = [...before, ...controlledPatterns, ...after]
    .join('\n')
    .trim();

  const output = `${outputPatterns}\n`;

  return contents !== output ? write(filepath, output, dryRun) : output;
};
