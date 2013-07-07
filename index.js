var maybeCallback = require("continuable/maybe-callback")

var toString = Object.prototype.toString

module.exports = async

function async(generator) {
    return maybeCallback(function async() {
        var args = [].slice.call(arguments)

        return function continuable(callback) {
            var iterator = generator.apply(this, args)
            next(null, null)

            function next(err, value) {
                if (err) {
                    return callback(err)
                }

                var res = iterator.next(value)
                if (!res.done) {
                    return res.value(next)
                }

                return isError(res.value) ? callback(res.value) :
                    callback(null, res.value)
            }
        }
    })
}

function isError(err) {
    return toString.call(err) === "[object Error]"
}
