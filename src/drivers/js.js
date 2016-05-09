import invariant from 'invariant';
import {relative} from 'path';

export default async function ({babel = false, babelConfig}) {
  if (babel) {
    // try to initialize the babel hook, if that fails it is probably not installed
    try {
      require('babel-register')(babelConfig || { // eslint-disable-line global-require
        presets: ['es2015', 'stage-0'],
        sourceMap: true,
      });
    } catch (err) {
      console.error('Cannot load babel hook, either disable babel for the js driver or fix the error. Did you install babel correctly?');
      throw err;
    }
  }

  return async (filePath) => {
    const relativePath = relative(__dirname, filePath);

    let module;

    try {
      module = require(relativePath); // eslint-disable-line global-require
    } catch (err) {
      console.error(`Error in migration file: ${filePath} -- ${err.stack}`);
      throw err;
    }

    const up = module.up || (module.default && module.default.up);
    invariant(typeof up === 'function', '`up` must be a function');

    const down = module.down || (module.default && module.default.down);
    invariant(!down || typeof down === 'function', '`down` must be a function');

    const meta = module.meta || (module.default && module.default.meta);

    return {meta, up, down};
  };
}
