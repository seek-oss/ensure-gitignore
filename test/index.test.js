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
  it('empty managed', () => {
    expect(
      managedIgnore({
        patterns: [],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d
"
`);
  });

  it('nothing managed', () => {
    expect(
      managedIgnore({
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d
"
`);
  });

  it('append', () => {
    expect(
      managedIgnore({
        patterns: ['e'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d

e
"
`);
  });

  it('append preserve whitespace', () => {
    expect(
      managedIgnore({
        patterns: ['e'],
        filepath: path.join(__dirname, 'output/appendPreserveWhitespace'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b


c
d

e
"
`);
  });

  it('append comment', () => {
    expect(
      managedIgnore({
        patterns: ['e'],
        filepath: path.join(__dirname, 'output/append'),
        comment: 'managed externally',
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d

e # managed externally
"
`);
  });

  it('take over ignore', () => {
    expect(
      managedIgnore({
        patterns: ['a/**'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d
"
`);
  });

  it('take over ignore exact only', () => {
    expect(
      managedIgnore({
        patterns: ['a'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d

a
"
`);
  });

  it('take over and append new', () => {
    expect(
      managedIgnore({
        patterns: ['b', 'f'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchInlineSnapshot(`
"a/**
b
c
d

f
"
`);
  });

  it('error if file not found', () => {
    const manage = () =>
      managedIgnore({
        filepath: 'output/notfound'
      });

    expect(manage).toThrowErrorMatchingInlineSnapshot(
      `"ENOENT: no such file or directory, open 'output/notfound'"`
    );
  });

  describe('file system test', () => {
    const filepath = path.join(__dirname, 'output/write');

    beforeAll(() => fs.writeFileSync(filepath, '', 'utf-8'));
    afterAll(() => fs.unlinkSync(filepath));

    it('write', () => {
      managedIgnore({ patterns: ['a'], comment: 'managed', filepath });
      expect(read(filepath)).toEqual(`
a # managed
`);
    });
  });
});
