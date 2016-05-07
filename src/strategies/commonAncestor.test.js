import assert from 'power-assert';
import {resolve} from './commonAncestor';
import {migrations} from '../test/fixtures';

describe('strategies/commonAncestor.js', () => {
  it('detects common prefix', () => {
    const current = [migrations[0], migrations[4], migrations[3], migrations[2]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[2], direction: 'down'},
      {migration: migrations[3], direction: 'down'},
      {migration: migrations[4], direction: 'down'},
      {migration: migrations[2], direction: 'up'},
      {migration: migrations[4], direction: 'up'},
    ]);
  });

  it('returns nothing if correct', () => {
    const current = [migrations[0], migrations[2], migrations[4]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), []);
  });

  it('remigrates common suffix', () => {
    const current = [migrations[0], migrations[2], migrations[4], migrations[1]];
    const target = [migrations[0], migrations[3], migrations[4], migrations[1]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[1], direction: 'down'},
      {migration: migrations[4], direction: 'down'},
      {migration: migrations[2], direction: 'down'},
      {migration: migrations[3], direction: 'up'},
      {migration: migrations[4], direction: 'up'},
      {migration: migrations[1], direction: 'up'},
    ]);
  });
});
