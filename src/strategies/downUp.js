export const description = 'Undos all abundant migrations in reverse order they were applied in (onlyDown), then runs all missing migrations in the specified order (onlyUp). Does not handle interleaving.';

import {resolve as resolveDown} from './onlyDown';
import {resolve as resolveUp} from './onlyUp';

export function resolve(target, current) {
  return [
    ...resolveDown(target, current),
    ...resolveUp(target, current),
  ];
}
