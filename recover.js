var async = require("./index")
var toString = Object.prototype.toString

//  recover := (gen: ()* => Any, left: (Error)* => Any | Error)
//      => Continuable<Any>
module.exports = recover

/*  Take a generator that does some work, it will yield either
        a value or an error. If it yields a value then return a
        continuable for the value.

    If it yields an error then call the generator that handles
        the error. If that generator returns a value then just
        return a continuable for that value. If it returns an
        Error then return a continuable containing that error
*/
function recover(gen, left) {
    var source = async(gen)
    var handle = async(left)

    return function continuable(callback) {
        source(function (err, v) {
            return err ? handle(err, function (_, v) {
                return isError(v) ? callback(v) : callback(null, v)
            }) : callback(null, v)
        })
    }
}

function isError(err) {
    return toString.call(err) === "[object Error]"
}
