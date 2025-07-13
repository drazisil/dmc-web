import test, { suite } from "node:test"
import assert from "node:assert"
import { isInValidRange, deserializeBool, serializeBool } from "./parser.js"
// @ts-nocheck

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

suite("helpers", () => {
    suite("isInValidRange()", () => {
        test("throws if v is not a number", () => {
            assert.throws(() => {
                isInValidRange("hello", 6)
            },
                /Error: value hello is not a valid number/
            )
        })

        test("throws if n is not a number", () => {
            assert.throws(() => {
                isInValidRange(6, "eight")
            },
                /Error: value eight is not a valid number/
            )
        })

        test("throws if signed is not a boolean is not a number", () => {
            assert.throws(() => {
                isInValidRange(6, 8, "test")
            },
                /Error: value test is not a valid boolean/
            )
        })

        suite("signed", () => {
            test("throws if v is less then min", () => {
                assert.throws(() => {
                    isInValidRange(-300, 1, true)
                },
                    /Error: -300 is not within the range of -128 and 127/
                )
            })

            test("throws if v is greater then max", () => {
                assert.throws(() => {
                    isInValidRange(300, 1, true)
                },
                    /Error: 300 is not within the range of -128 and 127/
                )
            })

            test("does not throw if v is between min and max", () => {
                assert.doesNotThrow(() => {
                    isInValidRange(3, 1, true)
                },
                    /Error k/
                )
            })
        })

        suite("unsigned", () => {
            test("throws if v is less then min", () => {
                assert.throws(() => {
                    isInValidRange(-5, 1)
                },
                    /Error: -5 is not within the range of 0 and 255/
                )
            })

            test("throws if v is greater then max", () => {
                assert.throws(() => {
                    isInValidRange(300, 1)
                },
                    /300 is not within the range of 0 and 255/
                )
            })

            test("does not throw if v is between min and max", () => {
                assert.doesNotThrow(() => {
                    isInValidRange(3, 1)
                })
            })

        })

    })
})

suite("serialization functions", () => {
    suite("serializeBool()", () => {
        test("throws is v is not a valid boolean", () => {
            assert.throws(() => {
                serializeBool(Buffer.alloc(3), 1, "true")
            },
                /"true" is not a boolean value/)
        })

        test("throws if offset is not a number", () => {
            assert.throws(() => {
                serializeBool(Buffer.alloc(3), "6", true)
            },
                /Error: "6 is not a valid number/
            )
        })

        test("throws if buffer is too short", () => {
            assert.throws(() => {
                serializeBool(Buffer.alloc(3), 4, true)
            },
                /Error: Invalid offset of 4 Only 3 bytes in buffer/
            )
        })

        test("can serialize false", () => {
            assert.deepStrictEqual(serializeBool(Buffer.from([0xf, 0xf, 0xf]), 1, false), {
                buff: Buffer.from([0xf, 0x0, 0xf]),
                offset: 2
            })
        })

        test("can serialize true", () => {
            assert.deepStrictEqual(serializeBool(Buffer.from([0xf, 0xf, 0xf]), 1, true), {
                buff: Buffer.from([0xf, 0x1, 0xf]),
                offset: 2
            })
        })

        test("returned offset is 1 greater then passed offset", () => {
            assert.deepStrictEqual(serializeBool(Buffer.from([0xf, 0xf, 0xf]), 1, true).offset, 2)
        })

    })
})

suite("deserialization functions", () => {
    suite("deserializeBool()", () => {
        test("throws if offset is not a number", () => {
            assert.throws(() => {
                deserializeBool(Buffer.alloc(3), "6")
            },
                /Error: "6 is not a valid number/
            )
        })

        test("throws if offset is negitive", () => {
            assert.throws(() => {
                deserializeBool(Buffer.alloc(3), -9)
            },
                /Error: Invalid offset of -9. Only 3 bytes in buffer/
            )
        })
        test("throws if offset is greater then byffer length", () => {
            assert.throws(() => {
                deserializeBool(Buffer.from([0xf, 0x1, 0xf]), 6)
            },
                /Error: Invalid offset of 6. Only 3 bytes in buffer/
            )
        })

        test("throws if returned value is not a valid boolean", () => {
            assert.throws(() => {
                deserializeBool(Buffer.from([0xf, 0xf, 0xf]), 2)
            },
                /Error: value 15 can not be converted into a boolean value/
            )
        })


        test("can deserialize false", () => {
            assert.deepStrictEqual(deserializeBool(Buffer.from([0xf, 0x0, 0xf]), 1).value, false)
        })

        test("can deserialize true", () => {
            assert.deepStrictEqual(deserializeBool(Buffer.from([0xf, 0x1, 0xf]), 1).value, true)
        })

        test("returned offset is 1 greater then passed offset", () => {
            assert.deepStrictEqual(deserializeBool(Buffer.from([0xf, 0x1, 0xf]), 1).offset, 2)
        })

    })
})