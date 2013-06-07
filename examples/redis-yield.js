let Redis = require("redis")
let console = require("console")
let list = require("continuable-list")

let client = Redis.createClient()
let async = require("../index")

async(function* () {
    yield client.hmset.bind(client, "blog::post", {
        date: "20130605",
        title: "g3n3rat0rs r0ck",
        tags: "js,node"
    })

    let post = yield client.hgetall.bind(client, "blog::post")
    let tags = post.tags.split(",")
    let taggedPosts = yield list(tags.map(function (tag) {
        return client.hgetall.bind(client, "post::tag::" + tag)
    }))

    return { post: post, taggedPosts: taggedPosts }
})(function (err, result) {
    if (err) {
        throw err
    }

    console.log("post", result.post, "taggedPosts", result.taggedPosts)

    client.quit()
})
