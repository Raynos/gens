var test = require("tape")
var fs = require("fs")
var path = require("path")
var error = require("continuable/error")
var of = require("continuable/of")
var list = require("continuable-list")

var async = require("../index")
var recover = require("../recover")
var both = require("../both")
var packageJsonUri = path.join(__dirname, "..", "package.json")

function sleep(n) {
    return function (cb) {
        setTimeout(cb, n)
    }
}

test("async is a function", function (assert) {
    assert.equal(typeof async, "function")
    assert.end()
})

test("simple generator", function (assert) {
    async(function* () {
        return 5
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value, 5)

        assert.end()
    })
})

test("parse json files", function (assert) {
    async(function* () {
        var file = yield fs.readFile.bind(null, packageJsonUri)
        return JSON.parse(file)
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value.name, "gens")

        assert.end()
    })
})

test("parallel yields", function (assert) {
    async(function* () {
        return yield list([
            fs.stat.bind(null, packageJsonUri),
            fs.readFile.bind(null, packageJsonUri)
        ])
    })(function (err, value) {
        assert.ifError(err)
        assert.ok(value[0].isFile())
        assert.equal(JSON.parse(value[1]).name, "gens")

        assert.end()
    })
})

test("error propagation", function (assert) {
    async(function* () {
        var fail = yield error(new Error("foo"))

        return 42
    })(function (err, value) {
        assert.equal(err.message, "foo")
        assert.equal(value, undefined)

        assert.end()
    })
})

test("async with no return", function (assert) {
    var v
    function sideeffect(arg) {
        return function (cb) {
            v = arg
            cb(null)
        }
    }

    var cache = {}
    function store(key, value) {
        cache[key] = value
    }

    async(function* () {
        yield sideeffect(42)

        store("foo", v)
    })(function (err) {
        assert.ifError(err)
        assert.equal(cache.foo, 42)

        assert.end()
    })
})

test("can recover", function (assert) {
    async(function* () {
        var v = yield recover(function* () {
            return yield error(new Error("foo"))
        }, function* (err) {
            return 42
        })

        return v * 2
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value, 84)

        assert.end()
    })
})

test("can return error and this passes error", function (assert) {
    async(function* () {
        return new Error("hello")
    })(function (err) {
        assert.equal(err.message, "hello")

        assert.end()
    })
})

test("can inspect both error and value", function (assert) {
    async(function* () {
        var data = yield both(error(new Error("foo")))
        var data2 = yield both(of(12))

        return { data: data, data2: data2 }
    })(function (err, value) {
        assert.ifError(err)
        assert.deepEqual(value, {
            data: [new Error("foo"), undefined],
            data2: [null, 12]
        })

        assert.end()
    })
})
