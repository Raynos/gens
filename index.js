var maybeCallback = require("continuable")

module.exports = run

function run(generator) {
    return maybeCallback(function async() {
        var args = [].slice.call(arguments)

        return function continuable(callback) {
            var iterator = generator.apply(this, args)
            next(null, null)

            function next(err, value) {
                if (err) {
                    return callback(err)
                }

                var res = iterator.send(value)
                if (res.done) {
                    return res.value ? res.value(callback) : callback(null)
                }

                res.value(next)
            }
        }
    })
}
