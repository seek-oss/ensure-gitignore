const fs = require('fs');
const path = require('path');
const managedIgnore = require('../index');

const read = filepath =>
  fs.readFileSync(filepath, 'utf-8', err => {
    if (err) {
      throw err;
    }
  });

const unindent = str =>
  (typeof str === 'string' ? [str] : str.raw)
    .join('')
    .split(/\r?\n/)
    .map(s => s.trim())
    .join('\n');

describe('managed-ignore', () => {
  describe('file system test', () => {
    const filepath = path.join(__dirname, 'output/write');

    beforeAll(() => fs.writeFileSync(filepath, '', 'utf-8'));
    afterAll(() => fs.unlinkSync(filepath));

    it('write', () => {
      managedIgnore({
        ignores: ['a'],
        filepath
      });
      expect(read(filepath)).toEqual(unindent`
      a # managed
      `);
    });
  });

  it('empty managed', () => {
    expect(
      managedIgnore({
        ignores: [],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('nothing managed', () => {
    expect(
      managedIgnore({
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('append', () => {
    expect(
      managedIgnore({
        ignores: ['e'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('append preserve whitespace', () => {
    expect(
      managedIgnore({
        ignores: ['e'],
        filepath: path.join(__dirname, 'output/appendPreserveWhitespace'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('append custom suffix', () => {
    expect(
      managedIgnore({
        ignores: ['e'],
        filepath: path.join(__dirname, 'output/append'),
        suffix: 'managed externally',
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('take over ignore', () => {
    expect(
      managedIgnore({
        ignores: ['a/**'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('take over ignore exact only', () => {
    expect(
      managedIgnore({
        ignores: ['a'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('take over and append new', () => {
    expect(
      managedIgnore({
        ignores: ['b', 'f'],
        filepath: path.join(__dirname, 'output/append'),
        dryRun: true
      })
    ).toMatchSnapshot();
  });

  it('error if file not found', () => {
    const manage = () =>
      managedIgnore({
        filepath: 'output/notfound'
      });

    expect(manage).toThrowErrorMatchingSnapshot();
  });
});
