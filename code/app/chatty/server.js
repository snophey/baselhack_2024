import { BasedServer } from '@based/server';
import sayHello from './api/hello/config.js'
import dbSet from './api/db/set/config.js'
import dbGet from './api/db/get/config.js'
import counter from './api/counter/config.js'
import { closeDatabase } from './data/db.js';

/**
 * @param {number} port 
 * @returns 
 */
async function startServer(port) {
  const server = new BasedServer({
    port,
    functions: {
      configs: {
        ...sayHello,
        ...counter,
        ...dbGet,
        ...dbSet
      },
    },
  });
  await server.start();
  console.log(`Server started on port ${port}`);
  return server;
}

const server = await startServer(8000)
process.on('SIGINT', async () => {
  console.log('Shutting down server');
  await server.destroy();
  closeDatabase();
  process.exit();
});
