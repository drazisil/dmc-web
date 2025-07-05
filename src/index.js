import e from "express"
import { IncomingMessage, ServerResponse } from "node:http"

/**
 * 
 * @param {string} functionName 
 * @returns 
 */
function createLogger(functionName) {

    const getTimestamp = () => { 
        return new Date().toISOString()
    }

    return {
        /**
         * 
         * @param {string} message 
         */
        info: (message) => {
            const now = getTimestamp()
            
            console.log(`${now} - [INFO] (${functionName}) ${message}`)
        }
    }
}

/**
 * 
 * @param {string} varName 
 * @param {unknown} varValue
 * @param {string | undefined} [message] 
 */
function assertDefined(varName, varValue, message) {

    if (typeof varValue === "undefined") {
        const errMessage = typeof message === "undefined" ? `The value of ${varName} can not be undefined!` : `${message} ${message ?? ""}`
        throw new Error(errMessage)
    }
}

/**
 * 
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
export function requestListener(request, response) {

    const log = createLogger("requestListener")

    const { socket, method, url } = request

    assertDefined("methos", method)
    assertDefined("url", url)

    const { remoteAddress, localPort } = socket

    assertDefined("remoteAddress", remoteAddress)
    assertDefined("localport", localPort)

    log.info(`${remoteAddress} ${method} ${url}`)

    response.end("Hello")

}

/**
 * 
 * @param {unknown} err 
 */
export function serverErrorListener(err) {

    console.log(`There was an error!: ${err}`)

}

/**
 * 
 * @param {number | undefined} port 
 */
export function cbServerListener(port){

    if (!port) {
        console.error("listener called with no port!")
        return
    }

    console.log(`Listening on port: ${port}`)
}