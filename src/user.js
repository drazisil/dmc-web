import { DatabaseSync } from "node:sqlite"
import { assertDefined } from "./helpers.js"
import { createLogger } from "./createLogger.js"

// TODO: Move these to a database, these are for dev testing only and can be leaked with no risk
const demoAccounts = [
    {
        username: "admin",
        password: "admin"
    }
]

/**
 */
class UserService {

    /**
     * 
     * @param {string} dsn database connection string
     */
    constructor(dsn) {
        assertDefined("dsn", dsn)

        this.log = createLogger("UserService")

        try {
            this.db = new DatabaseSync(dsn)
        } catch (error) {
            this.log.info(`Error opening database: ${error}`)
        }
    }

    /**
     * 
     * @param {string} [username] 
     * @param {string} [passwordHash] 
     * @returns boolean
     */
    checkLogin(username, passwordHash) {

        assertDefined("username", username)
        assertDefined("password", passwordHash)

       // TODO: Create database query instead of using a flat list
        for (const account of demoAccounts) {
            if (account.username === username && account.password === passwordHash) {
                return true
            }
        }

        return false
    }
}

const userServiceInstance = new UserService(":memory:")

/**
 * 
 * @returns {UserService}
 */
export function getUserService() {
    return userServiceInstance
}
