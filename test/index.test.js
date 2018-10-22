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

e
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

e
"
`);
  });

  it('append comment', async () => {
    const output = await ensureGitignore({
      patterns: ['e'],
      filepath: path.join(__dirname, 'output/append'),
      comment: 'managed externally',
      dryRun: true
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d

# managed externally
e
"
`);
  });

  it('take over ignore', async () => {
    const output = await ensureGitignore({
      patterns: ['a/**'],
      filepath: path.join(__dirname, 'output/append'),
      comment: 'managed externally',
      dryRun: true
    });
    expect(output).toMatchInlineSnapshot(`
"b
c
d

# managed externally
a/**
"
`);
  });

  it('take over ignore exact only', async () => {
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

a
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

b
f
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
      await ensureGitignore({ patterns: ['a'], comment: 'managed', filepath });
      expect(read(filepath)).toEqual(
        `b

# managed
a
`
      );
    });

    it('write with existing comment', async () => {
      await ensureGitignore({ patterns: ['c'], comment: 'managed', filepath });
      await ensureGitignore({
        patterns: ['d', 'e'],
        comment: 'managed',
        filepath
      });
      expect(read(filepath)).toEqual(
        `a
b
c

# managed
d
e
`
      );
    });
  });
});
