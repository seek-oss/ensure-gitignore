import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import ensureGitignore from '../index';

const removeFile = unlink;

describe('ensure-gitignore', () => {
  it('empty patterns', async () => {
    const output = await ensureGitignore({
      patterns: [],
      filepath: join(__dirname, 'output/append'),
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
      filepath: join(__dirname, 'output/append'),
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
      filepath: join(__dirname, 'output/append'),
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
      filepath: join(__dirname, 'output/appendPreserveWhitespace'),
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
      filepath: join(__dirname, 'output/append'),
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
      filepath: join(__dirname, 'output/append'),
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
      filepath: join(__dirname, 'output/append'),
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
      filepath: join(__dirname, 'output/append'),
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
    await expect(
      ensureGitignore({ filepath: 'output/notfound' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: ENOENT: no such file or directory, open 'output/notfound']`,
    );
  });

  describe('file system test', async () => {
    const filepath = join(__dirname, 'output/write');

    beforeEach(async () => await writeFile(filepath, 'a\nb', 'utf-8'));
    afterEach(async () => await removeFile(filepath));

    it('create file if doesnt exist', async () => {
      const nonExistantPath = join(__dirname, 'output/nonExistant');

      await ensureGitignore({
        patterns: ['a'],
        filepath: nonExistantPath,
      });
      const contents = await readFile(nonExistantPath, 'utf8');
      await removeFile(nonExistantPath);

      expect(contents).toEqual(
        `# managed by ensure-gitignore
a
# end managed by ensure-gitignore
`,
      );
    });

    it('ensure controlled patterns block isnt duplicated', async () => {
      const onlyControlledPatterns = join(__dirname, 'output/noduplicateblock');

      await ensureGitignore({
        patterns: ['a'],
        filepath: onlyControlledPatterns,
      });
      await ensureGitignore({
        patterns: ['a'],
        filepath: onlyControlledPatterns,
      });
      const contents = await readFile(onlyControlledPatterns, 'utf8');
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
      const contents = await readFile(filepath, 'utf8');
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
      const contents = await readFile(filepath, 'utf8');
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
      const updatedContents = await readFile(filepath, 'utf8');
      expect(updatedContents).toEqual(contents);
    });
  });
});
