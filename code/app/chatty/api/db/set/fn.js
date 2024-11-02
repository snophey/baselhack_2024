import { getDB } from "../db.js"

const db = getDB()


/**
 * 
 * @type {import("@based/functions").BasedFunction}
 */
export default async (_based, _payload) => {
    db.set("random", Math.random())
    return "ok" 
}
