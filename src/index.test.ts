import { promises as fs } from 'fs';
import path from 'path';

import ensureGitignore from '../src';

const { writeFile, readFile: readFileAsync, unlink: removeFile } = fs;

const readFile = (pathname: string) => readFileAsync(pathname, 'utf-8');

describe('ensure-gitignore', () => {
  it('empty patterns', async () => {
    const output = await ensureGitignore({
      patterns: [],
      filepath: path.join(__dirname, 'testing/append'),
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d
"
`);
  });

  it('no patterns', async () => {
    const output = await ensureGitignore({
      filepath: path.join(__dirname, 'testing/append'),
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d
"
`);
  });

  it('append new pattern', async () => {
    const output = await ensureGitignore({
      patterns: ['e'],
      filepath: path.join(__dirname, 'testing/append'),
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d

# managed by ensure-gitignore
e
# end managed by ensure-gitignore
"
`);
  });

  it('append preserve whitespace', async () => {
    const output = await ensureGitignore({
      patterns: ['e'],
      filepath: path.join(__dirname, 'testing/appendPreserveWhitespace'),
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b


c
d

# managed by ensure-gitignore
e
# end managed by ensure-gitignore
"
`);
  });

  it('append comment', async () => {
    const output = await ensureGitignore({
      patterns: ['e'],
      filepath: path.join(__dirname, 'testing/append'),
      comment: 'custom comment',
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d

# custom comment
e
# end custom comment
"
`);
  });

  it('take over ignore', async () => {
    const output = await ensureGitignore({
      patterns: ['a/**'],
      filepath: path.join(__dirname, 'testing/append'),
      comment: 'custom comment',
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"b
c
d

# custom comment
a/**
# end custom comment
"
`);
  });

  it('take over ignore exact', async () => {
    const output = await ensureGitignore({
      patterns: ['a'],
      filepath: path.join(__dirname, 'testing/append'),
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d

# managed by ensure-gitignore
a
# end managed by ensure-gitignore
"
`);
  });

  it('take over and append new', async () => {
    const output = await ensureGitignore({
      patterns: ['b', 'f'],
      filepath: path.join(__dirname, 'testing/append'),
      dryRun: true,
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
c
d

# managed by ensure-gitignore
b
f
# end managed by ensure-gitignore
"
`);
  });

  it('error if file not found', async () => {
    await expect(() =>
      ensureGitignore({ filepath: 'testing/notfound' }),
    ).rejects.toThrowError(
      "ENOENT: no such file or directory, open 'testing/notfound'",
    );
  });

  describe('file system test', () => {
    const filepath = path.join(__dirname, 'testing/write');

    beforeEach(async () => writeFile(filepath, 'a\nb', 'utf-8'));
    afterEach(async () => removeFile(filepath));

    it('create file if it doesn’t exist', async () => {
      const nonExistentPath = path.join(__dirname, 'testing/nonExistent');

      await ensureGitignore({
        patterns: ['a'],
        filepath: nonExistentPath,
      });
      const contents = await readFile(nonExistentPath);
      await removeFile(nonExistentPath);

      expect(contents).toEqual(
        `# managed by ensure-gitignore
a
# end managed by ensure-gitignore
`,
      );
    });

    it('ensure controlled patterns block isnt duplicated', async () => {
      const onlyControlledPatterns = path.join(
        __dirname,
        'testing/noduplicateblock',
      );

      await ensureGitignore({
        patterns: ['a'],
        filepath: onlyControlledPatterns,
      });
      await ensureGitignore({
        patterns: ['a'],
        filepath: onlyControlledPatterns,
      });
      const contents = await readFile(onlyControlledPatterns);
      await removeFile(onlyControlledPatterns);

      expect(contents).toEqual(
        `# managed by ensure-gitignore
a
# end managed by ensure-gitignore
`,
      );
    });

    it('write take control existing', async () => {
      await ensureGitignore({
        patterns: ['a'],
        comment: 'custom comment',
        filepath,
      });
      const contents = await readFile(filepath);
      expect(contents).toEqual(
        `b

# custom comment
a
# end custom comment
`,
      );
    });

    it('write with existing comment', async () => {
      await ensureGitignore({
        patterns: ['c'],
        comment: 'custom comment',
        filepath,
      });
      await ensureGitignore({
        patterns: ['d', 'e'],
        comment: 'custom comment',
        filepath,
      });
      const contents = await readFile(filepath);
      expect(contents).toEqual(
        `a
b

# custom comment
d
e
# end custom comment
`,
      );
    });

    it('maintains newlines after controlled section', async () => {
      const contents = `a
b

# custom comment
c
d
# end custom comment

# another comment, not managed by ensure-gitignore
e
f
`;
      await writeFile(filepath, contents, 'utf-8');
      await ensureGitignore({
        patterns: ['c', 'd'],
        comment: 'custom comment',
        filepath,
      });
      const updatedContents = await readFile(filepath);
      expect(updatedContents).toEqual(contents);
    });
  });
});