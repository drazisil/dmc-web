import { DatabaseSync } from "node:sqlite"
import { createLogger } from "./createLogger.js"
import { assertDefined } from "./helpers.js"

const shardDefaults = {
    loginPort: 8226,
    lobbyPort: 7003,
    databasePort: 43300,
    statusId: 0,
    statusReason: "",
    serverGroup: "Group-1",
    population: 0,
    maxPersonasAllowedPerUser: 5

}


/**
 * @typedef Shard
 * @property {string} name
 * @property {string} description
 * @property {number} id
 * @property {string} host
 */

/**
 * @type {Shard[]}
 */
const initialShards = []


/**
 * 
 * @param {Shard} shard 
 */
export function shardToString(shard) {
		return `[${shard.name}]
      Description=${shard.description}
      ShardId=${shard.id}
      LoginServerIP=${shard.host}
      LoginServerPort=${shardDefaults.loginPort}
      LobbyServerIP=${shard.host}
      LobbyServerPort=${shardDefaults.lobbyPort}
      MCOTSServerIP=${shard.host}
      StatusId=${shardDefaults.statusId}
      Status_Reason=${shardDefaults.statusReason}
      ServerGroup_Name=${shardDefaults.serverGroup}
      Population=${shardDefaults.population}
      MaxPersonasPerUser=${shardDefaults.maxPersonasAllowedPerUser}}
      DiagnosticServerHost=${shard.host}
      DiagnosticServerPort=80`;
    }

class ShardService {

        /**
         * 
         * @param {string} dsn database connection string
         */
        constructor(dsn) {
            assertDefined("dsn", dsn)
    
            this.log = createLogger("UserService")
    
            try {
                this.db = new DatabaseSync(dsn)
            } catch (error) {
                this.log.info(`Error opening database: ${error}`)
            }
        }

        /**
         * @returns {Shard[]}
         */
        getShards() {
            return initialShards
        }

}

const shardService = new ShardService(":memory:")

initialShards.push({
    name: "Hello",
    description: "I'm a shard",
    id: 4,
    host: "rusty-motors.com"
})

export function getShardService() {
    return shardService
}
