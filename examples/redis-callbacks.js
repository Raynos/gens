var Redis = require("redis")
var console = require("console")

var client = Redis.createClient()

client.hmset("blog::post", {
    date: "20130605",
    title: "g3n3rat0rs r0ck",
    tags: "js,node"
}, function(err) {
    if (err) {
        throw err
    }

    client.hgetall("blog::post", function(err, post) {
        if (err) {
            throw err
        }

        var tags = post.tags.split(",")
        var taggedPosts = []

        tags.forEach(function(tag) {
            client.hgetall("post::tag::" + tag, function(err, taggedPost) {
                if (err) {
                    throw err
                }

                taggedPosts.push(taggedPost)

                if (taggedPosts.length === tags.length) {
                    console.log("post", post, "taggedPosts", taggedPosts)
                    // do something with post and taggedPosts

                    client.quit()
                }
            })
        })

    })
})
