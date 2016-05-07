import assert from 'power-assert';
import {resolve} from './reorder';
import {migrations} from '../test/fixtures';

describe('strategies/reorder.js', () => {
  it('ignores excessive and missing migrations', () => {
    const current = [migrations[0], migrations[4], migrations[3]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), []);
  });

  it('fixes the order', () => {
    const current = [migrations[0], migrations[4], migrations[2]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[2], direction: 'down'},
      {migration: migrations[4], direction: 'down'},
      {migration: migrations[2], direction: 'up'},
      {migration: migrations[4], direction: 'up'},
    ]);
  });
});
