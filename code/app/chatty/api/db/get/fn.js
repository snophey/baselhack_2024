import { getDatabase } from "../db.js"

const db = getDatabase()

/**
 * 
 * @type {import("@based/functions").BasedQueryFunction}
 */
export default async (_based, _payload, update) => {
  update(db.get("random") || 42)
  return () => {
  }
}
