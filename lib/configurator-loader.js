const path = require("path")
const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const executable = require("executable")
const { spawn } = require("child_process")
const debug = require("debug")("meshblu-connector-pm2:configuration-loader")
const PM2 = require("pm2-custom")

class MeshbluConnectorConfiguratorLoader {
  constructor({ connectorHome, pm2Home }) {
    this.connectorHome = connectorHome
    this.pm2Home = pm2Home
    this.pm2 = new PM2({ pm2_home: this.pm2Home })
    process.env.MESHBLU_CONNECTOR_PM2_HOME = this.pm2Home
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.pm2.connect(error => {
        if (error) return reject(error)
        return resolve()
      })
    })
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.pm2.disconnect(error => {
        if (error) return reject(error)
        return resolve()
      })
    })
  }

  load() {
    const globPath = path.join(this.connectorHome, "configurators", "**", "*")
    debug(`Checking ${globPath} for configurators`)
    return this.connect().then(() => glob(globPath, { nodir: true })).each(file => this.loadConfigurator(file)).then(() => this.disconnect())
  }

  loadConfigurator(file) {
    debug(`Starting ${file}`)
    return executable(file).then(isExecutable => {
      if (!isExecutable) return
      const options = {
        detached: true,
        stdio: "ignore",
        env: {
          DEBUG: process.env.DEBUG,
          PATH: process.env.PATH,
          DAEMON_RPC_PORT: process.env.DAEMON_RPC_PORT,
          DAEMON_PUB_PORT: process.env.DAEMON_PUB_PORT,
          INTERACTOR_RPC_PORT: process.env.INTERACTOR_RPC_PORT,
          MESHBLU_CONNECTOR_PM2_HOME: this.pm2Home,
          MESHBLU_CONNECTOR_HOME: this.connectorHome,
        },
      }
      const child = spawn(file, options)
      child.unref()
      return Promise.resolve()
    })
  }
}

module.exports.MeshbluConnectorConfiguratorLoader = MeshbluConnectorConfiguratorLoader
