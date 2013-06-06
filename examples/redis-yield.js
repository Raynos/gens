var Redis = require("redis")
var console = require("console")

var client = Redis.createClient()
var run = require("../index")

run(function*() {
    yield client.hmset.bind(client, "blog::post", {
        date: "20130605",
        title: "g3n3rat0rs r0ck",
        tags: "js,node"
    })

    var post = yield client.hgetall.bind(client, "blog::post")
    var tags = post.tags.split(",")
    var taggedPosts = yield list(tags.map(function (tag) {
        return client.hgetall.bind(client, "post::tag::" + tag)
    }))

    yield { post: post, taggedPosts: taggedPosts }
})(function (err, result) {
    if (err) {
        throw err
    }

    console.log("post", result.post, "taggedPosts", result.taggedPosts)
})
