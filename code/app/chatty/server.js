import { BasedServer } from '@based/server';
import sayHello from './api/hello/config.js'
import dbSet from './api/db/set/config.js'
import dbGet from './api/db/get/config.js'
import counter from './api/counter/config.js'
import authorize from './api/authorize/fn.js'
import { closeDatabase } from './api/db/db.js';

/**
 * @param {number} port 
 * @returns 
 */
async function startServer(port) {
  const server = new BasedServer({
    port,
    auth: {
      verifyAuthState: async (_, ctx, authState) => {
        if (authState.token !== ctx.session?.authState.token) {
          return { ...authState }
        }
        return true
      }, 
      authorize
    },
    functions: {
      configs: {
        ...sayHello,
        ...counter,
        ...dbGet,
        ...dbSet,
        ...authorize
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
