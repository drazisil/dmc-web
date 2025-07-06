import { IncomingMessage, ServerResponse } from "node:http"
import { createLogger } from "./createLogger.js"
import { assertDefined, sendPlainResponse } from "./helpers.js"
import { getUserService } from "./user.js"



/**
 * 
 * @param {URL} url 
 * @param {ServerResponse} response 
 */
function userLogin(url, response) {

    const username = url.searchParams.get("username") ?? undefined
    const password = url.searchParams.get("password") ?? undefined

    const userService = getUserService()

    const loginValid = userService.checkLogin(username, password)

    if (loginValid) {

        // TODO: Get customer id, generate and save session

        return sendPlainResponse(response, "Auth")
    }

    return sendPlainResponse(response, "Nope")


}

// TODO: Add /ShardList/ route
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
export function cbServerListener(port) {

    if (!port) {
        console.error("listener called with no port!")
        return
    }

    console.log(`Listening on port: ${port}`)
}