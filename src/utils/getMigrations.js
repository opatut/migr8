import globFs from 'glob-fs';

import {getConfig} from './config';

const glob = globFs({
  gitignore: true,
});

export default function getMigrations() {
  return new Promise((resolve, reject) => {
    const {
      migrations: {
        path: cwd = process.cwd(),
        pattern = '**.sql',
      },
    } = getConfig();

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
