import { createLogger } from "../createLogger.js";

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @returns {Buffer | null}
 */
export function npsUserLogin(connectionId, data) {

    const log = createLogger("npsUserLogin", connectionId)

    log.info('Recieved an npsUserLogin packet')

    return null

}
