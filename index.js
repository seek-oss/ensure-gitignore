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
  const sortedPatterns = patterns.sort();
  const contents = await readFile(filepath, 'utf-8');
  const userSpecified = contents
    .trim()
    .split(/\r?\n/)
    .filter(pattern => !sortedPatterns.includes(pattern));

  const commentString = `# ${comment}\n`;
  const commentStringRegEx = new RegExp(`\r?\n${commentString}`, 'g');
  const stripOldComment = str => str.replace(commentStringRegEx, '');

  const outputPatterns = [
    stripOldComment(userSpecified.join('\n')).trim(),
    sortedPatterns.join('\n').trim()
  ]
    .join(`\n\n${comment ? commentString : ''}`)
    .trim();
  const output = `${outputPatterns}\n`;

  return contents !== output ? write(filepath, output, dryRun) : output;
};
