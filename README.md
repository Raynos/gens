# gens

<!-- [![browser support][5]][6] -->

[![build status][1]][2] [![NPM version][7]][8] [![dependency status][3]][4]

Experimental usage of generators for continuables

`async` takes a generator and returns a continuable. It's expected that
    the values you yield are continuables themself.

## Example

```js
// run this with --use-strict --harmony on node v0.11.2
let Redis = require("redis")
let console = require("console")
let list = require("continuable-list")

let client = Redis.createClient()
let async = require("gens")

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

```

## Installation

`npm install gens`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/gens.png
  [2]: https://travis-ci.org/Raynos/gens
  [3]: https://david-dm.org/Raynos/gens.png
  [4]: https://david-dm.org/Raynos/gens
  [5]: https://ci.testling.com/Raynos/gens.png
  [6]: https://ci.testling.com/Raynos/gens
  [7]: https://badge.fury.io/js/gens.png
  [8]: https://badge.fury.io/js/gens
