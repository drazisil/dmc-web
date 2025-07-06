/**
 *
 * @param {string} functionName
 * @returns
 */
export function createLogger(functionName) {

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

            console.log(`${now} - [INFO] (${functionName}) ${message}`);
        }
    };
}
