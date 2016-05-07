import _ from 'lodash';

import {resolve as resolveCommonAncestor} from './commonAncestor';

export const description = `
  Only applies the migrations that are already applied, but tries to bring them
  in the order they appear in the target specification. Similar to
  commonAncestor, but does not undo exisiting migrations or apply new ones.
`;

export function resolve(target, current) {
  const commonTarget = _.intersectionBy(target, current, 'id');
  const commonCurrent = _.intersectionBy(current, target, 'id');
  return resolveCommonAncestor(commonTarget, commonCurrent);
}
