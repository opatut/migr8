import assert from 'power-assert';
import {resolve} from './downUp';
import {migrations} from '../test/fixtures';

describe('strategies/downUp.js', () => {
  it('ignores wrong order', () => {
    const current = [migrations[0], migrations[4], migrations[2]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), []);
  });

  it('removes excessive migrations', () => {
    const current = [migrations[0], migrations[4], migrations[2], migrations[3]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[3], direction: 'down'},
    ]);
  });

  it('applies missing migrations', () => {
    const current = [migrations[0], migrations[4], migrations[2]];
    const target = [migrations[0], migrations[2], migrations[4], migrations[3]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[3], direction: 'up'},
    ]);
  });

  it('works with mixed excessive/missing migrations in any order', () => {
    const current = [migrations[0], migrations[2]];
    const target = [migrations[4], migrations[3], migrations[0]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[2], direction: 'down'},
      {migration: migrations[4], direction: 'up'},
      {migration: migrations[3], direction: 'up'},
    ]);
  });
});
