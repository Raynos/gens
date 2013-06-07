var async = require("../index")


async(function* () {
    yield sleep(50)

    throw new Error("foobar")
})(function () {

})

function sleep(n) {
    return function (cb) {
        setTimeout(cb, n)
    }
}
