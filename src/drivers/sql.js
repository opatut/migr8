import fs from 'fs';
import {basename} from 'path';

import promisify from 'es6-promisify';
import yaml from 'yaml-parser';

export default async function () {
  const readFile = promisify(fs.readFile);
  const UP_REGEX = /^[\s]*--[\s]+up.*--[\s]*$/i;
  const DOWN_REGEX = /^[\s]*--[\s]+down.*--[\s]*$/i;

  return async (filePath) => {
    const content = await readFile(filePath);
    const filename = basename(filePath);

    const lines = content.toString().split(/\n/);

    // find UP/DOWN start
    const upLine = lines.findIndex((line) => UP_REGEX.test(line));
    const downLine = lines.findIndex((line) => DOWN_REGEX.test(line));

    const metaText = (upLine === -1) ? undefined : lines.slice(0, upLine).join('\n');
    const upSql = lines.slice(upLine === -1 ? 0 : upLine, downLine === -1 ? lines.length : downLine).join('\n');
    const downSql = downLine === -1 ? undefined : lines.slice(downLine);

    let meta;

    try {
      meta = metaText && yaml.safeLoad(metaText, {filename});
      if (!meta || typeof meta === 'string') {
        meta = {
          title: filename,
          description: meta || metaText,
        };
      }
    } catch (err) {
      meta = {
        title: filename,
        description: metaText,
      };
    }

    return {
      meta,
      up: async (db) => {
        return await db.raw(upSql);
      },
      down: downSql ? async (db) => {
        return await db.raw(downSql);
      } : undefined,
    };
  };
}
