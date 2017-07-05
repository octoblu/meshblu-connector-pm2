const path = require("path")
const fs = require("fs-extra")

function die(error) {
  console.error(error.stack)
  process.exit(1)
}

function copy(source, dest, callback) {
  fs.copy(source, dest, error => {
    if (error) return die(error)
    callback()
  })
}

function copyAssets(callback) {
  const source = path.resolve("./override_node_modules/")
  const dest = path.resolve(`./node_modules`)

  copy(source, dest, callback)
}

copyAssets(() => {
  process.exit(0)
})
