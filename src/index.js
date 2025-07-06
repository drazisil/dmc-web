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
 * @param {ServerResponse} response 
 * @param {string} message 
 */
function sendPlainResponse(response, message) {

    response.setHeader("Content-Type", "text/plain")
    response.end(message)

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
 * @param {URL} url 
 * @param {ServerResponse} response 
 */
function userLogin(url, response) {

    sendPlainResponse(response, "Auth")

}

const routes = [
    {
        /** Ths path in the url to match */
        path: "/AuthLogin",
        /** The handler
         * 
         * @param {URL} url
         * @param {ServerResponse} response
         */
        response: userLogin
    }
]

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

    const { remoteAddress, localPort, localAddress } = socket

    assertDefined("remoteAddress", remoteAddress)
    assertDefined("localport", localPort)
    assertDefined("localAddress", localAddress)

    const parsedURL = new URL(url ?? "", `http://${localAddress}`)
    
    log.info(`${remoteAddress} ${method} ${parsedURL.pathname}`)



    for (const route of routes) {
        if (parsedURL.pathname.startsWith(route.path)) {
            route.response(parsedURL, response)
            return
        }
    }

    sendPlainResponse(response, "Hello")

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