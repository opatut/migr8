import promisify from 'es6-promisify';
import fs from 'fs';
import yaml from 'yaml-parser';

const readFile = promisify(fs.readFile);

const UP_REGEX = /^[\s]*--[\s]+up.*--[\s]*$/i;
const DOWN_REGEX = /^[\s]*--[\s]+down.*--[\s]*$/i;

export default async function (filename) {
  const content = await readFile(filename);

  const lines = content.split(/\n/);

  // find UP/DOWN start
  const upLine = lines.findIndex((line) => UP_REGEX.test(line));
  const downLine = lines.findIndex((line) => DOWN_REGEX.test(line));

  const metaText = (upLine === -1) ? undefined : lines.slice(0, upLine).join('\n');
  const upSql = lines.slice(upLine === -1 ? 0 : upLine, downLine === -1 ? lines.length : downLine).join('\n');
  const downSql = downLine === -1 ? undefined : lines.slice(downLine);

  let meta;

  try {
    meta = yaml.safeLoad(content, {
      filename,
    });
  } catch (err) {
    meta = {
      title: filename,
      description: metaText,
    };
  }

  return {
    meta,
    up: async (connection) => {
      return await connection.query(upSql);
    },
    down: downSql ? async (connection) => {
      return await connection.query(downSql);
    } : undefined,
  };
}
