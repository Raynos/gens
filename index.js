var toString = Object.prototype.toString

module.exports = async

var Asynchrony = require("./asynchrony")

function async(generator) {
    return function async() {
        var args = [].slice.call(arguments)
        var callback = args.pop()

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

            return callback(null, res.value)
        }
    }
}

function runValue(value, next) {
    if (!value) {
        return
    } else if (Asynchrony.is(value)) {
        Asynchrony.execute(value, next)
    } else if (Array.isArray(value) && Asynchrony.is(value[0])) {
        Asynchrony.parallel(value, next)
    } else if (Array.isArray(value) && isGenerator(value[0])) {
        Asynchrony.parallel(value.map(Asynchrony.to), next)
    } else if (value.both) {
        if (isGenerator(value.both)) {
            value.both = Asynchrony.to(value.both)
        }

        Asynchrony.both(value, next)
    } else if (isError(value)) {
        next(value)
    } else {
        throw new Error("yielded strange value. Cannot be run " + 
            JSON.stringify(value))
    }
}

function isError(err) {
    return toString.call(err) === "[object Error]"
}

function isGenerator(obj) {
  return obj && (toString.call(obj) === "[object Generator]" ||
    // this fallback is here for polyfill runtimes, like facebook/regenerator
    (obj.constructor && 'Generator' == obj.constructor.name))
}
