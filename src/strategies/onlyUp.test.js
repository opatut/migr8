import assert from 'power-assert';
import {resolve} from './onlyUp';
import {migrations} from '../test/fixtures';

describe('strategies/onlyUp.js', () => {
  it('finds all unexecuted migrations', () => {
    const current = [migrations[0]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[2], direction: 'up'},
      {migration: migrations[4], direction: 'up'},
    ]);
  });

  it('ignores any already applied migrations', () => {
    const current = [migrations[0], migrations[1]];
    const target = [migrations[0], migrations[2]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[2], direction: 'up'},
    ]);
  });
});
