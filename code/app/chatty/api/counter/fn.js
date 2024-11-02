
let count = 0

/**
 * 
 * @type {import("@based/functions").BasedQueryFunction}
 */
export default async (_based, _payload, update) => {
    const interval = setInterval(() => {
      // Update function updates the
      // client state.
      update(count++)
    }, 1000)
  
    // Query functions should return
    // a cleanup function. It's run when
    // closing the connection
    return () => {
      clearTimeout(interval)
    }
  }
