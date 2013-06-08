var slice = Array.prototype.slice

module.exports = wrap

function wrap(lambda, context) {
    return function async() {
        var args = slice.call(arguments)
        return function continuable(callback) {
            args.push(callback)
            lambda.apply(context || this, args)
        }
    }
}
