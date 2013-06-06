var test = require("tape")

var continuableGenerators = require("../index")

test("continuableGenerators is a function", function (assert) {
    assert.equal(typeof continuableGenerators, "function")
    assert.end()
})
