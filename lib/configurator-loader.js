const path = require("path")
const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const executable = require("executable")
const spawn = Promise.promisify(require("child_process").spawn)
const PM2 = require("pm2").custom

class MeshbluConnectorConfiguratorLoader {
  constructor({ connectorHome, pm2Home }) {
    this.connectorHome = connectorHome
    this.pm2Home = pm2Home
    this.pm2 = new PM2({ pm2_home: this.pm2Home })
    process.env.PM2_HOME = this.pm2Home
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
    return this.connect().then(() => glob(globPath, { nodir: true })).map(file => this.loadConfigurator(file)).then(() => this.disconnect())
  }

  loadConfigurator(file) {
    return executable(file).then(isExecutable => {
      if (!isExecutable) return
      const options = {
        detached: true,
        stdio: "ignore",
        env: {
          PATH: process.env.PATH,
          PM2_HOME: this.pm2Home,
          MESHBLU_CONNECTOR_HOME: this.connectorHome,
        },
      }
      return spawn(file, options)
    })
  }
}

module.exports.MeshbluConnectorConfiguratorLoader = MeshbluConnectorConfiguratorLoader
