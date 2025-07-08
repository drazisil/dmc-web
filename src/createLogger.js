/**
 *
 * @param {string} functionName
 * @param {string} [connectionId]
 * @returns
 */
export function createLogger(functionName, connectionId) {

    const getTimestamp = () => {
        return new Date().toISOString();
    };

    return {
        /**
         *
         * @param {string} message
         */
        info: (message) => {
            const now = getTimestamp();

            console.log(JSON.stringify({
                date: now,
                level: "INFO",
                functionName,
                connectionId,
                message: message
            }
            ))
        }
    };
}
