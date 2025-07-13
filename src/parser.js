/**
 * * bool
 * * int8
 * * uint8
 * * int15
 * * uint16
 * * int32
 * * uint32
 * * string
 * * cstring
 * * byteArray
 * * container
 * * raw
 * 
 */

/**
 * 
 * @param {Buffer} buff 
 * @param {number} offset 
 * @param {boolean} v 
 * @returns {{buff: Buffer, offset: number}}
 * @throws if v is not a valid bolean
 * @throws if offset is not a number
 * @throws if offset is negitive
 * @throws if not enough bytes are left in buff
 */
export function serializeBool(buff, offset, v) {
    if (typeof v !== "boolean") {
        throw new Error(`"${v}" is not a boolean value`)
    }

    if (typeof offset !== "number") {
        throw new Error(`"${offset} is not a valid number`)
    }

    if (buff.length <= offset || offset < 0) {
        throw new Error(`Invalid offset of ${offset} Only ${buff.length} bytes in buffer`)
    }

    buff.writeUInt8(v ? 1 : 0, offset)
    
    return {
        buff,
        offset: offset + 1
    }
}

/**
 * 
 * @param {Buffer} buff 
 * @param {number} offset 
 * @returns {{buff: Buffer, value: boolean, offset: number}}
 * @throws if offset is not a number
 * @throws if offset is not valid for buffer
 * @throws if returned value is not a valid boolean
 */
export function deserializeBool(buff, offset) {
    if (typeof offset !== "number") {
        throw new Error(`"${offset} is not a valid number`)
    }

    if (buff.length < offset || offset < 0) {
        throw new Error(`Invalid offset of ${offset}. Only ${buff.length} bytes in buffer`)
    }

    const b = buff.readUInt8(offset)

    if (b < 0 || b > 1) {
        throw new Error(`value ${b} can not be converted into a boolean value`)
    }

    const r = b === 1 ? true : false

    return {
        buff,
        value: r,
        offset: offset + 1
    }
}

/**
 * 
 * @param {number} v
 * @param {number} n
 * @param {boolean}  signed
 * @returns {void}
 * @throws if v is outside the range allowed for signed or unsigned numbers in n bytes
 */
function calculateRanges(v, n, signed =false) {
    let min
    let max

    if (signed) {
        min = -Math.pow(2, (8 * n - 1));
        max = Math.pow(2, (8 * n - 1)) - 1;
    } else {
        min = 0;
        max = Math.pow(2, (8 * n)) - 1;
    }
    if (v < min || v > max) {
        throw new Error(`${v} is not within the range of ${min} and ${max}`)
    }

}

class BaseSerialize {

    constructor() {
        if ( this.constructor = BaseSerialize) {
            throw new Error("You should be using a client class, not the base")
        }
    }

    /**
     * @returns {Buffer}
     */
    serialize() {}

}

class Header extends BaseSerialize {

    constructor() {
        super()
        this._msgId = 0
        this._msgVersion = 0
        this._msgLength = 0
        this._sequenceNumber = 0
     }

    /**
     * 
     * @param {Header} src 
     * @returns {Header}
     */
    static Copy(src) { 
        const dest = new Header()
        dest.setId(src.id)
        dest.setVersion(src.version)
        dest.setLength(src.length)
        dest.setSequenceNumber(src.sequenceNumber)

        return dest
    }

    
    /**
     * 
     * @returns {number}
     */
    get size() {
        return 12
    }
    
    /**
     * @returns {number}
     */
    get id() {
        return this._msgId
    }

    /**
     * @returns {number}
     */
    get version() {
        return this._msgVersion
    }
    
    /**
     * @returns {number}
     */
    get length() {
        return this._msgLength
    }

    /**
     * @returns {number}
     */
    get checksum() {
        return this._sequenceNumber
    }

    /**
     * @returns {number}
     */
    get sequenceNumber() {
        return this._sequenceNumber
    }

    /**
     * 
     * @param {number} seq con not be 0
     */
    setSequenceNumber(seq) {
        this._sequenceNumber = seq
    }

    /**
     * 
     * @param {number} len 
     */
    setLength(len) {
        this._msgLength = len
    }

    /**
     * 
     * @param {number} version 
     */
    setVersion(version) {
        this._msgVersion = version
    }

    /**
     * 
     * @param {number} id 
     */
    setId(id) {
        this._msgId = id
    }

    /**
     * 
     * @param {number} cs 
     */
    setChecksum(cs) {
        this._sequenceNumber = cs
    }
}


class NPS_Serialize extends BaseSerialize {

    /**
     * 
     * @param {number} [id] default: 0
     * @param {number} [version] default: 0
     */
    constructor(id = 0, version = 0) {
        super()
        this.header_ = new Header()
        this.header_.setId(id)
        this.header_.setVersion(version)
    }

    /**
     * 
     * @param {Buffer} serialized_buffer 
     * @param {boolean} owns_allocation 
    */
    static NPS_Serialize(serialized_buffer, owns_allocation) { }

    /**
     * 
     * @param {NPS_Serialize} src extends NPS_Serialize
     * @returns {NPS_Serialize}
     */
    static Copy(src) { }

    /**
     * 
     * @param {Buffer} buff 
     */
    deserialize(buff) { }

    /**
     * @returns {number}
     */
    get messageVersion() {
        return this.header_.version
    }

    /**
     * @returns {number}
     */
    get messageId() {
        return this.header_.id
    }

    /**
     * 
     * @param {number} version 
     */
    setMessageVersion(version) {
        this.header_.setVersion(version)
    }

    /**
     * 
     * @param {number} id 
     */
    setMessageId(id) {
        this.header_.setId(id)
    }

    /**
     * @returns {number}
     */
    get checksum() {
        return this.header_.checksum
     }

    /**
     * @returns {number} same as the checksum
     */
    sequenceNumber() {
        return this.header_.sequenceNumber
     }

    /**
     * 
     * @param {number} seq can not be 0
     */
    setSequenceNumber(seq) {
        this.header_.setSequenceNumber(seq)
     }

}
