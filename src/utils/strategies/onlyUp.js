import _ from 'lodash';

export const description = `
  Find which migrations are missing in the current configuration, run only
  these. Leave additional migrations in place (i.e. do not migrate them
  down). Do not fix order of already applied migrations.
`;

export function resolve(target, current) {
  return _.differenceBy(target, current, 'id')
    .map((migration) => ({migration, direction: 'up'}));
}
