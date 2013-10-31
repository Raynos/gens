var maybeCallback = require("continuable/maybe-callback")

var toString = Object.prototype.toString

module.exports = async

var Asynchrony = require("./asynchrony")

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
    } else if (Asynchrony.is(value)) {
        Asynchrony.execute(value, next)
    } else if (Array.isArray(value) && Asynchrony.is(value[0])) {
        Asynchrony.parallel(value, next)
    } else if (Array.isArray(value) && isGenerator(value[0])) {
        console.log("mapping", value)
        Asynchrony.parallel(value.map(Asynchrony.to), next)
    } else if (value.both) {
        if (isGenerator(value.both)) {
            value.both = Asynchrony.to(value.both)
        }

        Asynchrony.both(value, next)
    }
}

function isError(err) {
    return toString.call(err) === "[object Error]"
}

function isGenerator(obj) {
  return obj && toString.call(obj) === "[object Generator]"
}