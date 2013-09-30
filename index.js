var maybeCallback = require("continuable/maybe-callback")
var parallel = require("continuable-para")

var both = require("./both.js")

var toString = Object.prototype.toString

module.exports = async

function async(generator) {
    return maybeCallback(function async() {
        var args = [].slice.call(arguments)

        return function continuable(callback) {
            var iterator = isGenerator(generator) ?
                generator : generator.apply(this, args)
            next(null, null)

            function next(err, value) {
                if (err) {
                    return callback(err)
                }

                var res = iterator.next(value)
                if (!res.done) {
                    return runValue(res.value, next)
                }

                return isError(res.value) ? callback(res.value) :
                    callback(null, res.value)
            }
        }
    })
}

function runValue(value, next) {
    if (!value) {
        return
    } else if (typeof value === "function") {
        value(next)
    } else if (Array.isArray(value) && typeof value[0] === "function") {
        parallel(value)(next)
    } else if (Array.isArray(value) && isGenerator(value[0])) {
        parallel(value.map(toContinuable))(next)
    } else if (value.both) {
        if (isGenerator(value.both)) {
            value.both = toContinuable(value.both)
        }

        both(value.both)(next)
    }
}

function toContinuable(generator) {
    return function (cb) {
        async(generator)(cb)
    }
}

function isError(err) {
    return toString.call(err) === "[object Error]"
}

function isGenerator(obj) {
  return obj && toString.call(obj) === "[object Generator]"
}