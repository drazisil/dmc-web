import { IncomingMessage, ServerResponse } from "node:http"
import { createLogger } from "./createLogger.js"
import { assertDefined, sendPlainResponse } from "./helpers.js"
import { getUserService } from "./user.js"
import { getSessionService } from "./session.js"
import { getShardService, shardToString } from "./shard.js"
import { Socket } from "node:net"
import { randomUUID } from "node:crypto"

/**
 * 
 * @param {string} sessionId 
 */
function validAuth(sessionId) {
    return `Valid=TRUE\nTicket=${sessionId}`;
}

/**
 * 
 * @param {string} code 
 * @param {string} reason 
 * @param {string} url 
 */
function invalidAuth(code, reason, url) {
    return `reasoncode=${code}\nreasontext=${reason}\nreasonurl=${url}`;
}

/**
 * 
 * @param {URL} url 
 * @param {ServerResponse} response 
 */
function shardList(url, response) {

    const shardService = getShardService()

    const activeshards = shardService.getShards()

    let formattedShards = []

    for (const shard of activeshards) {
        formattedShards.push(shardToString(shard))
    }

    return sendPlainResponse(response, formattedShards.join("\n\n"))
}


/**
 * 
 * @param {URL} url 
 * @param {ServerResponse} response 
 */
function userLogin(url, response) {

    const log = createLogger("userLogin")

    // The inputs are verified inside checkLogin, 
    const username = url.searchParams.get("username")
    const password = url.searchParams.get("password")

    if (username === null || password === null) {
        log.info('Either username or password were not passed to handler')
        return sendPlainResponse(response, invalidAuth("INV-100", "opps", "rusty-motors.com/errors"))
    }

    const userService = getUserService()

    const customerId = userService.checkLogin(username, password)

    if (customerId) {

        // TODO: Get customer id, generate and save session
        const sessionService = getSessionService()

        const sessionId = sessionService.generateSessionId()

        const saveSuccess = sessionService.update(sessionId, customerId)

        if (!saveSuccess) {
            log.info(`There was an eror saving the session for customerId ${customerId}`)
            return sendPlainResponse(response, invalidAuth("INV-100", "opps", "rusty-motors.com/errors"))
        }

        return sendPlainResponse(response, validAuth(sessionId))
    }

    return sendPlainResponse(response, invalidAuth("INV-100", "opps", "rusty-motors.com/errors"))


}

// TODO: Add /ShardList/ route
/**
 * path is the url to match, response is the resppnse handler
 * @type {{path: string, response: (url: URL, response: ServerResponse) => void}[]}
 */
const routes = [
    {
        path: "/AuthLogin",
        response: userLogin
    },
    {
        path: "/ShardList/",
        response: shardList
    }
]

/**
 * 
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
export function httpRequestListener(request, response) {

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

/**
 * 
 * @param {string} connectionId 
 * @param {Buffer} data 
 * @param {(data: Buffer) => void} writer 
 */
function handleData( connectionId, data, writer) {

    const log = createLogger(connectionId)

    log.info(`Recieved data: ${data.toString("hex")}`)

    // TODO: Handle data

    // TODO: send any responses

}

/**
 * 
 * @param {string} connectionId 
 * @param {Socket} socket 
 * @param {Buffer} data 
 */
function socketDataListener(connectionId, socket, data) {

    /**
     * 
     * @param {Buffer} data 
     */
    const sendToSocket = (data) => {
        if (!socket.writable) {
            throw new Error(`Error writing to the socket fore connection ${connectionId}: socket not writable!`)
        }
    }

    handleData(connectionId, data, sendToSocket)

}

/**
 * 
 * @param {Socket} socket 
 */
function setupSocketListeners(socket) {

    const connectionId = randomUUID()

    const log = createLogger(connectionId)

    socket.on("error", serverErrorListener)
    socket.on("close", function(hadError) { if (hadError) { log.info('Error: Server was closed with an error')}})
    socket.on("data", function(data) {socketDataListener(connectionId, socket, data)})
}

/**
 * 
 * @param {Socket} socket 
 */
export function tcpConnectionListener(socket) {

    const log = createLogger("tcpConnectionListener")

    const {remoteAddress, localPort} = socket

    if (typeof remoteAddress === "undefined" || typeof localPort === "undefined") {
        log.info('Error: either remoreAddress or localPort were undefined when connection handler was called')
        return
    }

    log.info(`New connection of port ${localPort} from ${remoteAddress}`)

    setupSocketListeners(socket)



}