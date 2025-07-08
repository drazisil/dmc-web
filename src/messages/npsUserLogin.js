import { createLogger } from "../createLogger.js";

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
    log.info(`value: ${result.value}, nextIndex: ${result.endingIndex}`)


    return responseData

}
