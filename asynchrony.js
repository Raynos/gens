var parallel = require("continuable-para")
var Promise = require("bluebird")

var both = require("./both.js")
var async = require("./index.js")

var Asynchrony = module.exports = {
    parallel: function (value, next) {
        if (value.length === 0) {
            parallel([])(next)
        } else if (typeof value[0] === "function") {
            parallel(value)(next)
        } else if (value[0] && typeof value[0].then === "function") {
            Asynchrony.execute(Promise.all(value), next)
        }
    },
    both: function (value, next) {
        var async = value.both

        if (typeof async === "function") {
            both(async)(next)
        } else if (async && typeof async.then === "function") {
            var p = async.then(function (result) {
                return [null, result]
            }, function (error) {
                return [error]
            })

            Asynchrony.execute(p, next)
        }
    },
    execute: function (value, next) {
        if (typeof value === "function") {
            value(next)
        } else if (value && typeof value.then === "function") {
            value.then(function (result) {
                next(null, result)
            }, function (error) {
                next(error)
            })
        }
    },
    is: function (value) {
        return typeof value === "function" || // thunk / continuable
            value && typeof value.then === "function" // promise
    },
    to: function (generator) {
        return function (cb) {
            async(generator)(cb)
        }
    }
}