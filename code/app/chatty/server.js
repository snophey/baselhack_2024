import { BasedServer } from '@based/server';
import sayHello from './api/hello/config.js'
import dbSet from './api/db/set/config.js'
import dbGet from './api/db/get/config.js'
import ui from './ui/config.js'
import counter from './api/counter/config.js'

/**
 * @param {number} port 
 * @returns 
 */
async function startServer(port) {
  const server = new BasedServer({
    port,
    functions: {
      configs: {
        ...ui,
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

const server = startServer(8000)