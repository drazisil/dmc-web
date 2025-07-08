import { createLogger } from "./createLogger.js"
import { npsUserLogin } from "./messages/npsUserLogin.js"

/** @type {Map<number, {code: number, name: string, handler: (connectionId: string, data: Buffer) => Buffer | null}>} */
const supportedNpsMessages = new Map()
supportedNpsMessages.set(0x501, {
    code: 0x501,
    name: "NPS_USET_LOGIN",
    handler: npsUserLogin
})

/**
 * 
 * @param {Buffer} data 
 * @returns {number | null}
 */
function parseNPSMsgId(data) {

    const log = createLogger("parseMsgId")

    if (data.length < 4) {
        log.info(`Error: packet not long enough to parse: ${data.length}`)
        return null
    }


    return data.readInt16BE(0)
}

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @returns {boolean}
 */
function isSupportedNPSPacket(connectionId, data) {

    const log = createLogger(connectionId)

    const messageId = parseNPSMsgId(data)


    if (messageId !== null) {

        return supportedNpsMessages.has(messageId)
    }

    return false

}

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @param {(data: Buffer) => void} writer 
 */
export function handleData(connectionId, data, writer) {

    const log = createLogger(connectionId)

    let response = null

    log.info(`Recieved data: ${data.toString("hex")}`)

    // TODO: Handle data
    switch (true) {
        case isSupportedNPSPacket(connectionId, data): {
            const messageId = parseNPSMsgId(data)
            if (messageId !== null) {

                const handler = supportedNpsMessages.get(messageId)?.handler
    
                if (typeof handler === "undefined") {
                    log.info(`Error: handler is somehow not set for messageId: ${messageId}`)
                    break
                }
    
    
                response = handler(connectionId, data)
            }
            break
        }
        default: {
            log.info('Error: Unable to identify packet, please review')
        }
    }

    // TODO: send any responses
    if (response !== null) {
        writer(response)
    }

}