/**
 */
class UserService {


    /**
     * 
     * @param {string} username 
     * @param {string} passwordHash 
     * @returns boolean
     */
    checkLogin(username, passwordHash) {
        console.log(username, passwordHash)
        return false
    }
}

const userServiceInstance = new UserService()

/**
 * 
 * @returns {UserService}
 */
export function getUserService() {
    return userServiceInstance
}
