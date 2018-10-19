const fs = require('fs');
const path = require('path');
const managedIgnore = require('../index');

const read = filepath =>
  fs.readFileSync(filepath, 'utf-8', err => {
    if (err) {
      throw err;
    }
  });

describe('managed-ignore', () => {
  it('empty managed', async () => {
    const output = await managedIgnore({
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

  it('nothing managed', async () => {
    const output = await managedIgnore({
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

  it('append', async () => {
    const output = await managedIgnore({
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
    const output = await managedIgnore({
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
    const output = await managedIgnore({
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

e # managed externally
"
`);
  });

  it('take over ignore', async () => {
    const output = await managedIgnore({
      patterns: ['a/**'],
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

  it('take over ignore exact only', async () => {
    const output = await managedIgnore({
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
    const output = await managedIgnore({
      patterns: ['b', 'f'],
      filepath: path.join(__dirname, 'output/append'),
      dryRun: true
    });
    expect(output).toMatchInlineSnapshot(`
"a/**
b
c
d

f
"
`);
  });

  it('error if file not found', async () => {
    try {
      await managedIgnore({ filepath: 'output/notfound' });
    } catch ({ message }) {
      expect(message).toEqual(
        `ENOENT: no such file or directory, open 'output/notfound'`
      );
    }
  });

  describe('file system test', async () => {
    const filepath = path.join(__dirname, 'output/write');

    beforeAll(() => fs.writeFileSync(filepath, '', 'utf-8'));
    afterAll(() => fs.unlinkSync(filepath));

    it('write', async () => {
      await managedIgnore({ patterns: ['a'], comment: 'managed', filepath });
      expect(read(filepath)).toEqual(`
a # managed
`);
    });
  });
});
