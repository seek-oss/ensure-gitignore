const fs = require('fs');
const path = require('path');
const ensureGitignore = require('../index');

const read = filepath =>
  fs.readFileSync(filepath, 'utf-8', err => {
    if (err) {
      throw err;
    }
  });

describe('ensure-gitignore', () => {
  it('empty patterns', async () => {
    const output = await ensureGitignore({
      patterns: [],
      filepath: path.join(__dirname, 'output/append'),
      dryRun: true
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
      filepath: path.join(__dirname, 'output/append'),
      dryRun: true
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
      filepath: path.join(__dirname, 'output/append'),
      dryRun: true
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
      filepath: path.join(__dirname, 'output/appendPreserveWhitespace'),
      dryRun: true
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
      filepath: path.join(__dirname, 'output/append'),
      comment: 'custom comment',
      dryRun: true
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
      filepath: path.join(__dirname, 'output/append'),
      comment: 'custom comment',
      dryRun: true
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
      filepath: path.join(__dirname, 'output/append'),
      dryRun: true
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
      filepath: path.join(__dirname, 'output/append'),
      dryRun: true
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
    try {
      await ensureGitignore({ filepath: 'output/notfound' });
    } catch ({ message }) {
      expect(message).toEqual(
        `ENOENT: no such file or directory, open 'output/notfound'`
      );
    }
  });

  describe('file system test', async () => {
    const filepath = path.join(__dirname, 'output/write');

    beforeEach(() => fs.writeFileSync(filepath, 'a\nb', 'utf-8'));
    afterEach(() => fs.unlinkSync(filepath));

    it('write take control existing', async () => {
      await ensureGitignore({
        patterns: ['a'],
        comment: 'custom comment',
        filepath
      });
      expect(read(filepath)).toEqual(
        `b

# custom comment
a
# end custom comment
`
      );
    });

    it('write with existing comment', async () => {
      await ensureGitignore({
        patterns: ['c'],
        comment: 'custom comment',
        filepath
      });
      await ensureGitignore({
        patterns: ['d', 'e'],
        comment: 'custom comment',
        filepath
      });
      expect(read(filepath)).toEqual(
        `a
b

# custom comment
d
e
# end custom comment
`
      );
    });
  });
});
