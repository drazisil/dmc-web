import { ServerResponse } from "node:http";

/**
 * 
 * @param {string} varName 
 * @param {unknown} varValue
 * @param {string | undefined} [message] 
 */
export function assertDefined(varName, varValue, message) {

    if (typeof varValue === "undefined") {
        const errMessage = typeof message === "undefined" ? `The value of ${varName} can not be undefined!` : `${message} ${message ?? ""}`
        throw new Error(errMessage)
    }
}

/**
 *
 * @param {ServerResponse} response
 * @param {string} message
 */
export function sendPlainResponse(response, message) {

    response.setHeader("Content-Type", "text/plain");
    response.end(message);

}
