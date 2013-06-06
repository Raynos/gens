var Redis = require("redis")
var console = require("console")
var chain = require("continuable/chain")
var list = require("continuable-list")
var hash = require("continuable-hash")
var cache = require("continuable-cache")

var client = Redis.createClient()
// var run = require("../index")

var insertion = client.hmset.bind(client, "blog::post", {
    date: "20130605",
    title: "g3n3rat0rs r0ck",
    tags: "js,node"
})

var post = cache(chain(insertion, function () {
    return client.hgetall.bind(client, "blog::post")
}))

var taggedPosts = chain(post, function (post) {
    var tags = post.tags.split(",")

    return list(tags.map(function (tag) {
        return client.hgetall.bind(client, "post::tag::" + tag)
    }))
})

hash({ post: post, taggedPosts: taggedPosts })(function (err, result) {
    if (err) {
        throw err
    }

    console.log("post", result.post, "taggedPosts", result.taggedPosts)
})
