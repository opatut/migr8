import _ from 'lodash';

export const description = `
  Undo all migrations that have been executed but are not present in the
  target file.
`;

export function resolve(target, current) {
  return _.reverse(_.differenceBy(current, target, 'id').map((migration) => ({migration, direction: 'down'})));
}
