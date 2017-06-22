const fs = require("fs")
const path = require("path")
const ini = require("ini")

let execPath = path.dirname(process.argv[1])
if (process.pkg) execPath = path.dirname(process.execPath)
const envIniFile = path.join(execPath, 'env.ini')
if (fs.existsSync(envIniFile)) {
  const parsedIni = ini.parse(fs.readFileSync(envIniFile, 'utf-8'))
  forEach(parsedIni.environment, (value, key) => {
    process.env[key] = value
  })
}

if (!process.env.PM2_HOME && process.env.MESHBLU_CONNECTOR_PM2_HOME) {
  process.env.PM2_HOME = process.env.MESHBLU_CONNECTOR_PM2_HOME
}
require("pm2/bin/pm2")
