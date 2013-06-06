var either = require("continuable/either")

var run = require("./index")

module.exports = recover

function recover(gen, left) {
    return either(run(gen), left)
}
