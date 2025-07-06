import { createLogger } from "./createLogger.js"

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @returns {boolean}
 */
function isSupportedNPSPacket(connectionId, data) {

    const log = createLogger(connectionId)

    if (data.length < 4) {
        log.info(`Error: packet not long enough to parse: ${data.length}`)
        return false
    }

    const messageId = data.readInt16BE(0)

    // TODO: Check if supported message
    log.info(`messageid: ${messageId}`)

    return false

}

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @param {(data: Buffer) => void} writer 
 */
export function handleData( connectionId, data, writer) {

    const log = createLogger(connectionId)

    log.info(`Recieved data: ${data.toString("hex")}`)

    // TODO: Handle data
    switch (true) {
        case isSupportedNPSPacket(connectionId, data): {
            // TODO: parse as an nps packet
            break
        }
        default: {
            log.info('Error: Unable to identify packet, please review')
        }
    }

    // TODO: send any responses

}