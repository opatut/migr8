import path from 'path';
import fs from 'fs';
import globFs from 'glob-fs';

import * as drivers from '../drivers';
import {getConfig} from './config';

const glob = globFs({
  gitignore: true,
});

function exists(file) {
  return new Promise((resolve) => {
    fs.stat(file, (err) => {
      resolve(!err);
    });
  });
}

async function findMigrationFiles(pattern, cwd) {
  if (!await exists(cwd)) {
    console.warn(`Migrations path not found: ${cwd}`);
    return [];
  }

  return await new Promise((resolve, reject) => {
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

  const directory = path.resolve(cwd);
  const files = await findMigrationFiles(pattern, directory);

  // load the driver that translates migrations into up/down functions
  const driver = await drivers[driverType](driverConfig);

  return await Promise.all(files.map(async (file) => ({
    id: file,
    ...(await driver(path.join(directory, file))),
  })));
};
