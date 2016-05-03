import getMigrations from '../utils/getMigrations';
import strategies from '../utils/strategies';

export function parseListType(value) {
  if (value !== 'migrations' && value !== 'strategies') {
    throw new Error(`Cannot list ${value} -- unknown type.`);
  }
  return value;
}

function indent(indentString, str) {
  const words = str.split(/[\s]+/);
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

export default async function list(options) {
  const {type = 'migrations', verbose = false} = options;

  if (type === 'migrations') {
    const allMigrations = await getMigrations();
    console.log(allMigrations.join('\n'));
    // TODO: verbose
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
