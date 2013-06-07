var either = require("continuable/either")
var async = require("./index")

module.exports = recover

function recover(gen, left) {
    return either(async(gen), left)
}
