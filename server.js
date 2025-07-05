import express from "express"
import { createServer, IncomingMessage, ServerResponse } from "http"
import { cbServerListener, requestListener, serverErrorListener } from "./src/index.js"

const app = express()



const server = createServer(requestListener)

const port = 3000

server.on("error", serverErrorListener)
server.on("listening", function() { cbServerListener(port)})
server.listen(port, "0.0.0.0")
