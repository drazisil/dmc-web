import { DatabaseSync } from "node:sqlite"
import { compareSync, hashSync } from "bcrypt"
import { assertDefined } from "./helpers.js"
import { createLogger } from "./createLogger.js"

// TODO: Move these to a database, these are for dev testing only and can be leaked with no risk
/**
 * @type {{username: string, password: string, customerId: number}[]}
 */
const demoAccounts = [
    {
        username: "admin",
        password: "$2b$05$vRqka8/C/Fcn2DXVyC8WCOgRDGMwvKout9CkJsnywLmgV/t2ozXzW",
        customerId: 5551212
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
     * @param {string} password 
     * @returns {string}
     */
    hashPassword(password) {
        return hashSync(password, 5)
    }

    /**
     * 
     * @param {string} username
     * @param {string} password
     * @returns {number | null} customerId or null if not valid
     */
    checkLogin(username, password) {

        assertDefined("username", username)
        assertDefined("password", password)

        // TODO: Create database query instead of using a flat list
        for (const account of demoAccounts) {
            if (account.username === username && compareSync(password, account.password)) {
                return account.customerId
            }
        }

        return null
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
