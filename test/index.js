var test = require("tape")
var fs = require("fs")
var path = require("path")
var of = require("continuable/of")
var error = require("continuable/error")
var list = require("continuable-list")

var run = require("../index")
var packageJsonUri = path.join(__dirname, "..", "package.json")

test("run is a function", function (assert) {
    assert.equal(typeof run, "function")
    assert.end()
})

test("simple generator", function (assert) {
    run(function* () {
        return of(5)
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value, 5)

        assert.end()
    })
})

test("parse json files", function (assert) {
    run(function* () {
        var file = yield fs.readFile.bind(null, packageJsonUri)
        return of(JSON.parse(file))
    })(function (err, value) {
        assert.ifError(err)
        assert.equal(value.name, "continuable-generators")

        assert.end()
    })
})

test("parallel yields", function (assert) {
    run(function* () {
        return list([
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

        return of(42)
    })(function (err, value) {
        assert.equal(err.message, "foo")
        assert.equal(value, undefined)

        assert.end()
    })
})
