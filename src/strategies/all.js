import _ from 'lodash';

export const description = `
  Ignore the target file and simply run all migrations that can be found
  and are not applied yet.
`;

export function resolve(target, current, all) {
  return _.differenceBy(all, current, 'id')
    .map((migration) => ({migration, direction: 'up'}));
}
