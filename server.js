import { createServer as createWebServer, } from "node:http"
import { cbServerListener, httpRequestListener, serverErrorListener, tcpConnectionListener } from "./src/index.js"
import { Server, createServer as createTCPServer } from "net"

const webPort = 3000
const tcpPorts = [8226, 8228, 7003, 43300]

const webServer = createWebServer(httpRequestListener)
webServer.on("error", serverErrorListener)
webServer.on("listening", function() { cbServerListener(webPort)})
webServer.listen(webPort, "0.0.0.0")

/**
 * @type {Server[]}
 */
let tcpServers = []

for (const port of tcpPorts) {
    const server = createTCPServer(tcpConnectionListener)
    server.on("error", serverErrorListener)
    server.listen(port, "0.0.0.0",function () { cbServerListener(port)})
    tcpServers.push(server)
}

let isRunning = true

/** @type {number | undefined} */
let timerId

/**
 * 
 * @param {number} timerId 
 * @returns 
 */
function loop(timerId) {
    if (!isRunning) {
        console.log('Exiting main loop')
        webServer.close()
        clearTimeout(timerId)
        return
    }
}

console.log('Starting main loop...')
timerId = setInterval(loop, 5000, timerId)

