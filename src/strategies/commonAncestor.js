export const description = `
  Find where the current configuration deviates from the target
  configuration, migrate down to that state, then migrate up towards the
  target.
`;

export function resolve(target, current) {
  let i = 0; // this counts up to the common prefix length
  while (i < target.length && i < current.length && target[i].id === current[i].id) {
    i++;
  }

  const down = current.slice(i);
  const up = target.slice(i);

  return [
    ...down.reverse().map((migration) => ({migration, direction: 'down'})),
    ...up.map((migration) => ({migration, direction: 'up'})),
  ];
}
