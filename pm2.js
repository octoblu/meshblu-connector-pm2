if (!process.env.PM2_HOME && process.env.MESHBLU_CONNECTOR_PM2_HOME) {
  process.env.PM2_HOME = process.env.MESHBLU_CONNECTOR_PM2_HOME
}
require("pm2/bin/pm2")
