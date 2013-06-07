var test = require("tape")
var fs = require("fs")
var path = require("path")
var of = require("continuable/of")
var error = require("continuable/error")
var list = require("continuable-list")

var run = require("../index")
var recover = require("../recover")
var packageJsonUri = path.join(__dirname, "..", "package.json")

test("run is a function", function (assert) {
    assert.equal(typeof run, "function")
    assert.end()
})

test("simple generator", function (assert) {
    run(function* () {
        return 5
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value, 5)

        assert.end()
    })
})

test("parse json files", function (assert) {
    run(function* () {
        var file = yield fs.readFile.bind(null, packageJsonUri)
        return JSON.parse(file)
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value.name, "continuable-generators")

        assert.end()
    })
})

test("parallel yields", function (assert) {
    run(function* () {
        return yield list([
            fs.stat.bind(null, packageJsonUri),
            fs.readFile.bind(null, packageJsonUri)
        ])
    })(function (err, value) {
        assert.ifError(err)
        assert.ok(value[0].isFile())
        assert.equal(JSON.parse(value[1]).name,
            "continuable-generators")

        assert.end()
    })
})

test("error propagation", function (assert) {
    run(function* () {
        var fail = yield error(new Error("foo"))

        return 42
    })(function (err, value) {
        assert.equal(err.message, "foo")
        assert.equal(value, undefined)

        assert.end()
    })
})

test("run with no return", function (assert) {
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

    run(function* () {
        yield sideeffect(42)

        store("foo", v)
    })(function (err) {
        assert.ifError(err)
        assert.equal(cache.foo, 42)

        assert.end()
    })
})

test("can recover", function (assert) {
    run(function* () {
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
