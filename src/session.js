import { DatabaseSync } from "node:sqlite"
import { assertDefined } from "./helpers.js"
import { createLogger } from "./createLogger.js"

/**
 * TODO: Replace with database
 * Key is the sessionId, value is the customerId
 * @type {Map<string, number>}
 */
const demoSessions = new Map()

class SessionService {

        /**
         * 
         * @param {string} dsn database connection string
         */
        constructor(dsn) {
            assertDefined("dsn", dsn)
    
            this.log = createLogger("SessionService")
    
            try {
                this.db = new DatabaseSync(dsn)
            } catch (error) {
                this.log.info(`Error opening database: ${error}`)
            }
        }

        /**
         * 
         * @returns {string}
         */
        generateSessionId() {
            return '1234'
        }


        /**
         * 
         * @param {string} sessionId 
         * @param {number} customerId 
         * @returns boolean did update succeed?
         */
        update(sessionId, customerId) {

            assertDefined("sessionId", sessionId)
            assertDefined("customerId", customerId)

            this.log.info(`Setting session ${sessionId} for customerId ${customerId}...`)

            // TODO: Replace with database query
            demoSessions.set(sessionId, customerId)

            this.log.info('Session set successfully')

            return true
        }

        /**
         * 
         * @param {string} sessionId 
         * @returns {number | null}
         */
        getsession(sessionId){
            return demoSessions.get(sessionId) ?? null
        }



}

const sessionService = new SessionService(":memory:")

/**
 * 
 * @returns {SessionService}
 */
export function getSessionService() {
    return sessionService
}
