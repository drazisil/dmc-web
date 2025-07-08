import { readFileSync } from "node:fs";
import { createLogger } from "../createLogger.js";
import { privateDecrypt } from "node:crypto";

/**
 * @property {number} endingIndex
 * @property {Buffer} value
 */
class NPSMessageContainer {

        /**
     * 
     * @param {Buffer} data 
     * @param {number} startingIndex 
     */
    constructor(data, startingIndex) {
              let remainingData = Buffer.from(data.subarray(startingIndex))

        if ( remainingData.length < 4) {
            throw new Error('Unable to read string length header, not enough remaining data')
        }

        this.length = remainingData.readInt16BE(2)

        if (remainingData.length - 4 < this.length) {
            throw new Error(`Not enough data left to get string. Got ${remainingData.length - 4}, expected ${this.length}`)
        }

        this.value = remainingData.subarray(4, this.length + 4)
        this.endingIndex = startingIndex + 4 + this.length  
    }

        /**
     * 
     * @param {Buffer} data 
     * @param {number} startingIndex 
     * @returns {{endingIndex: number, value: Buffer}}
     */
    static parse(data, startingIndex) {
        const self = new NPSMessageContainer(data, startingIndex)

        return {
            endingIndex: self.endingIndex,
            value: self.value
        }
    }
}

/**
 * @property {number} endingIndex
 * @property {string} value
 */
class NPSFixedLengthString {

    /**
     * 
     * @param {Buffer} data 
     * @param {number} startingIndex 
     */
    constructor(data, startingIndex) {
        let remainingData = Buffer.from(data.subarray(startingIndex))

        if ( remainingData.length < 2) {
            throw new Error('Unable to read string length header, not enough remaining data')
        }

        this.length = remainingData.readInt16BE()

        if (remainingData.length - 2 < this.length) {
            throw new Error(`Not enough data left to get string. Got ${remainingData.length - 2}, expected ${this.length}`)
        }

        this.value = remainingData.subarray(2, this.length + 2).toString("utf8")
        this.endingIndex = startingIndex + 2 + this.length
    }

    /**
     * 
     * @param {Buffer} data 
     * @param {number} startingIndex 
     * @returns {{endingIndex: number, value: string}}
     */
    static parse(data, startingIndex) {
        const self = new NPSFixedLengthString(data, startingIndex)

        return {
            endingIndex: self.endingIndex,
            value: self.value
        }
    }
}

/**
 * 
 * @param {Buffer} data 
 * @returns {Buffer}
 */
function trimNPSGameMessageHeader(data) {

    const requiredLength = 12

    if (data.length < requiredLength) {
        throw new Error(`Not enough remaining data. Got ${data.length}, expected at least ${requiredLength}`)
    }

    return Buffer.from(data.subarray(requiredLength))

}

/**
 * 
 * @param {Buffer} data 
 * @param {string} keyFile 
 */
function decryptSessionKey(data, keyFile) {
        const privateKeyString = readFileSync(keyFile)

    const decryptedSessionKeyConatiner = privateDecrypt(privateKeyString, Buffer.from(data.toString(), "hex"))

    return Buffer.from(decryptedSessionKeyConatiner.subarray(2, 34))

}

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @returns {Buffer | null}
 */
export function npsUserLogin(connectionId, data) {

    let responseData = null

    const log = createLogger("npsUserLogin", connectionId)

    log.info('Recieved an npsUserLogin packet')

    if (data.readInt16BE() !== 0x501) {
        log.info('Error: The message id does not match expected')
        return responseData
    }

    const messageLength = data.readInt16BE(2)

    if (data.length !== messageLength) {
        log.info(`Error: Message length does not match header. Got ${data.length}, expected ${messageLength}`)
        return responseData
    }

    log.info('Passes length check')

    const payload = trimNPSGameMessageHeader(data)

    let result = NPSFixedLengthString.parse(payload, 0)

    const contextId = result.value

    let nextIndex = result.endingIndex

    const result2 = NPSMessageContainer.parse(payload, nextIndex)

    const sessionKeyConatiner = /** @type {Buffer} */ result2.value

    const sessionKeyBuffer = decryptSessionKey(sessionKeyConatiner, "./data/private_key.pem")


    log.info(JSON.stringify({
        contextId, 
        sessionKeyConatiner: sessionKeyBuffer.toString("hex")
    }))


    return responseData

}
