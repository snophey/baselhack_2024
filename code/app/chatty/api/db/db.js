class DB {
    x = new Map()

    /**
     * 
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        console.debug("db set key ", key, "value", value)
        return this.x.set(key, value)

    }

    /**
     * 
     * @param {string} key 
     * @returns {any} 
     */
    get(key) {
        console.debug("db get key ", key)
        return this.x.get(key)
    }
}

const db = new DB()
export function getDB() {
    if(!db) {
        console.error("DB is not initialized. Exiting.")
        process.exit(1)
    }

    return db

}