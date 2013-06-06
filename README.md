# continuable-generators

<!-- [![browser support][5]][6] -->

[![build status][1]][2] [![NPM version][7]][8] [![dependency status][3]][4]

Experimental usage of generators for continuables

`run` takes a generator and returns a continuable. It's expected that
    the values you yield are continuables themself.

## Example

```js
// run this with --harmony on node v0.11.2
var Redis = require("redis")
var console = require("console")
var list = require("continuable-list")
var of = require("continuable/of")

var client = Redis.createClient()
var run = require("continuable-generators")

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

    return of({ post: post, taggedPosts: taggedPosts })
})(function (err, result) {
    if (err) {
        throw err
    }

    console.log("post", result.post, "taggedPosts", result.taggedPosts)

    client.quit()
})
```

## Installation

`npm install continuable-generators`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/continuable-generators.png
  [2]: https://travis-ci.org/Raynos/continuable-generators
  [3]: https://david-dm.org/Raynos/continuable-generators.png
  [4]: https://david-dm.org/Raynos/continuable-generators
  [5]: https://ci.testling.com/Raynos/continuable-generators.png
  [6]: https://ci.testling.com/Raynos/continuable-generators
  [7]: https://badge.fury.io/js/continuable-generators.png
  [8]: https://badge.fury.io/js/continuable-generators
