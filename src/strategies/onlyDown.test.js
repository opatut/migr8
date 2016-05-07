import assert from 'power-assert';
import {resolve} from './onlyDown';
import {migrations} from '../test/fixtures';

describe('strategies/onlyDown.js', () => {
  it('ignores all unexecuted migrations', () => {
    const current = [migrations[0]];
    const target = [migrations[0], migrations[2], migrations[4]];

    assert.deepEqual(resolve(target, current), []);
  });

  it('removes already applied migrations', () => {
    const current = [migrations[0], migrations[1]];
    const target = [migrations[0]];

    assert.deepEqual(resolve(target, current), [
      {migration: migrations[1], direction: 'down'},
    ]);
  });
});
