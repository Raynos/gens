module.exports = run

function run(generator) {
    return function async() {
        var args = [].slice.call(arguments)
        var callback = args.pop()

        var iterator = generator.apply(this, args)
        next(null, null)

        function next(err, value) {
            if (err) {
                return callback(err)
            }

            var res = iterator.send(value)
            return res.done ? res.value(callback) : res.value(next)
        }
    }
}
