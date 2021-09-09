import { promises as fs } from 'fs';
import path from 'path';

const write = async (filepath: string, output: string, dryRun: boolean) => {
  if (!dryRun) {
    await fs.writeFile(filepath, output);
  }
  return output;
};

const trimArray = <T>(arr: T[]) => arr.join('\n').trim().split('\n');

interface ErrorWithCode {
  code?: string;
}

const readFileContents = (filepath: string) => {
  try {
    return fs.readFile(filepath, 'utf-8');
  } catch (e) {
    if (!e) {
      throw new Error(`Unable to find file ${filepath}`);
    }

    if ((e as ErrorWithCode).code !== 'ENOENT') {
      throw e;
    }

    throw new Error(`Unable to find file ${filepath}`);
  }
};

interface EnsureGitignoreConfig {
  patterns?: string[];
  comment?: string;
  filepath?: string;
  dryRun?: boolean;
}

export default async ({
  patterns = [],
  comment = 'managed by ensure-gitignore',
  filepath = path.resolve(process.cwd(), '.gitignore'),
  dryRun = false,
}: EnsureGitignoreConfig) => {
  const contents = await readFileContents(filepath);

  const sortedPatterns = patterns.sort();
  const rawPatterns = contents
    .trim()
    .split(/\r?\n/)
    .filter((pattern) => !sortedPatterns.includes(pattern));

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
      ? [`\n${startComment}`, ...sortedPatterns, `${endComment}\n`]
      : [];

  const outputPatterns = [...before, ...controlledPatterns, ...after]
    .join('\n')
    .trim();

  const output = `${outputPatterns}\n`;

  return contents !== output ? write(filepath, output, dryRun) : output;
};
