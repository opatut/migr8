import {join} from 'path';
import globFs from 'glob-fs';

import * as drivers from '../drivers';
import {getConfig} from './config';


const glob = globFs({
  gitignore: true,
});

function findMigrationFiles(pattern, cwd) {
  return new Promise((resolve, reject) => {
    const files = [];
    glob
      .readdirStream(pattern, {
        cwd,
        relative: true,
      })
      .on('data', (file) => {
        files.push(file.relative);
      })
      .on('error', reject)
      .on('end', () => {
        resolve(files);
      });
  });
}

export default async () => {
  const {
    migrations: {
      path: cwd = process.cwd(),
      pattern = '**.sql',
    },
    driver: {
      type: driverType,
      ...driverConfig,
    },
  } = getConfig();

  const files = await findMigrationFiles(pattern, cwd);

  // load the driver that translates migrations into up/down functions
  const driver = await drivers[driverType](driverConfig);

  return await Promise.all(files.map(async (file) => ({
    id: file,
    ...(await driver(join(cwd, file))),
  })));
};
