import assert from 'power-assert';
import {resolve} from './all';
import {migrations} from '../test/fixtures';

describe('strategies/all.js', () => {
  it('finds all unexecuted migrations', () => {
    const current = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve([], current, migrations), [
      {migration: migrations[1], direction: 'up'},
      {migration: migrations[3], direction: 'up'},
    ]);
  });

  it('ignores the target', () => {
    const current = [migrations[0], migrations[2], migrations[4]];
    const target = [migrations[1]];

    assert.deepEqual(resolve(target, current, migrations), [
      {migration: migrations[1], direction: 'up'},
      {migration: migrations[3], direction: 'up'},
    ]);
  });

  it('can migrate from empty state', () => {
    assert.deepEqual(resolve([], [], migrations), [
      {migration: migrations[0], direction: 'up'},
      {migration: migrations[1], direction: 'up'},
      {migration: migrations[2], direction: 'up'},
      {migration: migrations[3], direction: 'up'},
      {migration: migrations[4], direction: 'up'},
    ]);
  });
});
