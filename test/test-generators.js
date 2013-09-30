var test = require("tape")
var util = require("util")

module.exports = testGenerators

function testGenerators(impl) {
    test("generator may return value", function (assert) {
        var gen1 = function* () {
            return 5
        }
        var gen2 = function* () {
            return "str"
        }

        impl.run(gen1, function (err, value) {
            assert.ifError(err)
            assert.equal(value, 5)

            impl.run(gen2, function (err, value) {
                assert.ifError(err)
                assert.equal(value, "str")

                assert.end()
            })
        })
    })

    test("generator may return error", function (assert) {
        var gen1 = function* () {
            return new Error("normal error")
        }

        impl.run(gen1, function (err, value) {
            assert.equal(err.message, "normal error")

            assert.end()
        })
    })

    test("generators can yield AV's", function (assert) {
        var gen1 = function* () {
            return yield impl.from("str")
        }

        impl.run(gen1, function (err, value) {
            assert.ifError(err)
            assert.equal(value, "str")

            assert.end()
        })
    })

    test("generators can yield an array of AV's", function (assert) {
        var gen1 = function* () {
            var start = Date.now()
            var items = yield [
                impl.sleep(10),
                impl.sleep(20),
                impl.sleep(30),
                impl.sleep(40),
                impl.sleep(50),
                impl.from(60),
                impl.from("some text")
            ]
            return { time: Date.now() - start, items: items }
        }

        impl.run(gen1, function (err, value) {
            assert.ifError(err)
            assert.ok(value.time < 53)
            assert.deepEqual(value.items, [
                10, 20, 30, 40, 50, 60, "some text"
            ])

            assert.end()
        })
    })

    test("can yield array of generator objects", function (assert) {
        var gen1 = function* () {
            var times = [10, 20, 30, 40, 50]
            var counter = 0
            var maxCounter = 0

            var values = yield times.map(function* (time) {
                counter++
                maxCounter = counter
                yield impl.sleep(time)
                counter--

                return time * 3
            })

            return { values: values, maxCounter: maxCounter, counter: counter }
        }

        impl.run(gen1, function (err, value) {
            assert.ifError(err)

            assert.deepEqual(value.values, [30, 60, 90, 120, 150])
            assert.equal(value.counter, 0)
            assert.equal(value.maxCounter, 5)

            assert.end()
        })
    })

    test("can yield { both: AV }", function (assert) {
        var gen1 = function* () {
            var left = yield { both: impl.error(new Error("oops")) }
            var right = yield { both: impl.from("correct") }

            return { left: left, right: right }
        }

        impl.run(gen1, function (err, value) {
            assert.ifError(err)

            assert.equal(value.left[0].message, "oops")
            assert.equal(value.left[1], undefined)
            assert.equal(value.left.length, 2)
            assert.deepEqual(value.right, [null, "correct"])

            assert.end()
        })
    })

    test("can yield* another generator", function (assert) {
        var gen1 = function* () {
            return (yield* gen2()) + (yield* gen2())
        }
        var gen2 = function* () {
            yield impl.sleep(10)

            return (yield impl.from(2)) + (yield impl.from(3))
        }

        impl.run(gen1, function (err, value) {
            assert.ifError(err)

            assert.equal(value, 10)

            assert.end()
        })
    })
}