const fs = require("fs")
const path = require("path")
const ini = require("ini")
const dotenv = require("dotenv")
const dotenvExpand = require("dotenv-expand")
const forEach = require("lodash.foreach")

let execPath = path.dirname(process.argv[1])
if (process.pkg) execPath = path.dirname(process.execPath)

const envIniFile = path.join(execPath, "env.ini")
if (fs.existsSync(envIniFile)) {
  const parsedIni = ini.parse(fs.readFileSync(envIniFile, "utf-8"))
  const parsedEnv = { parsed: {} }
  forEach(parsedIni.environment, (value, key) => {
    if (process.env[key]) return
    parsedEnv.parsed[key] = value
    process.env[key] = value
  })
  dotenvExpand(parsedEnv)
}

const envFile = path.join(execPath, ".env")
const parsedEnv = dotenv.config({ path: envFile })
dotenvExpand(parsedEnv)

if (!process.env.PM2_HOME && process.env.MESHBLU_CONNECTOR_PM2_HOME) {
  process.env.PM2_HOME = process.env.MESHBLU_CONNECTOR_PM2_HOME
}
require("@octoblu/pm2/bin/pm2")
