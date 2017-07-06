const path = require("path")
const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const executable = require("executable")
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
      return new Promise((resolve, reject) => {
        this.pm2.start(
          {
            name: path.basename(file, ".exe"),
            script: file,
            cwd: path.dirname(file),
            interpreter: "none",
            autorestart: false,
            force: true,
            env: {
              DEBUG: process.env.DEBUG,
              PATH: process.env.PATH,
              PM2_DAEMON_RPC_PORT: process.env.PM2_DAEMON_RPC_PORT,
              PM2_DAEMON_PUB_PORT: process.env.PM2_DAEMON_PUB_PORT,
              PM2_INTERACTOR_RPC_PORT: process.env.PM2_INTERACTOR_RPC_PORT,
              MESHBLU_CONNECTOR_PM2_HOME: this.pm2Home,
              MESHBLU_CONNECTOR_HOME: this.connectorHome,
            },
          },
          (error, proc) => {
            if (error) return reject(error)
            this.proc = proc
            return resolve(proc)
          }
        )
      })
    })
  }
}

module.exports.MeshbluConnectorConfiguratorLoader = MeshbluConnectorConfiguratorLoader
