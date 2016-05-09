import program, {selectedCommand} from './commands';
import {loadConfig, findConfig} from './utils/config';
import {db, connect} from './utils/database';

export default async function run() {
  program.parse(process.argv);

  const configPath = await findConfig();
  if (configPath) {
    if (program.verbose) {
      console.log(`Loading config from: ${configPath}`);
    }
    await loadConfig(configPath);
  }

  if (program.config) {
    if (program.verbose) {
      console.log(`Loading config from: ${program.config}`);
    }
    await loadConfig(program.config);
  }

  // set up database connection
  await connect();

  try {
    // run command
    await selectedCommand();
  } finally {
    // tear down database connection
    await db.destroy();
  }
}
