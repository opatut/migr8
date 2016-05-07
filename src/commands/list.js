import getMigrations from '../utils/getMigrations';
import * as strategies from '../strategies';

export function parseListType(value) {
  if (value !== 'migrations' && value !== 'strategies') {
    console.error(`Unknown type to list: ${value}. Available types:
  strategies
  migrations`);
    process.exit(1);
  }
  return value;
}

function indent(indentString, str) {
  if (!str) return str;

  const words = str.trim().split(/[\s]+/);
  const lines = [[]];
  let lineLength = 0;
  const maxLineLength = 80 - indentString.length;

  while (words.length) {
    const word = words.shift();
    if (word.length + lineLength + 1 > maxLineLength) {
      lines.push([]);
      lineLength = 0;
    }
    lines[lines.length - 1].push(word);
    lineLength += 1 + word.length;
  }

  return lines
    .filter((line) => line.length > 0)
    .map((line) => indentString + line.join(' '))
    .join('\n');
}


export default async function list(type = 'migrations', options) {
  parseListType(type);

  const {verbose = false} = options.parent;

  if (type === 'migrations') {
    const allMigrations = await getMigrations();
    console.log(
      allMigrations
        .map((migration) => {
          if (verbose) {
            return `${migration.id}:\n${indent('  ', migration.meta.description || 'no description')}\n`;
          } else {
            return migration.id;
          }
        })
        .join('\n'));
  } else if (type === 'strategies') {
    console.log(
      Object.keys(strategies)
        .map((key) => {
          if (verbose) {
            const {description} = strategies[key];
            return `${key}:\n${indent('  ', description)}\n`;
          } else {
            return key;
          }
        })
        .join('\n')
    );
  } else {
    throw new Error(`Invalid list type: ${type}`);
  }
}
