const path = require("path")
const util = require("util")
const glob = util.promisify(require("glob"))
const executable = require("executable")
const spawn = util.promisify(require("child_process").spawn)

class MeshbluConnectorConfiguratorLoader {
  constructor({ connectorHome, pm2Home }) {
    this.connectorHome = connectorHome
    this.pm2Home = pm2Home
  }

  load() {
    const globPath = path.join(this.connectorHome, "configurators", "*")
    return glob(globPath).then(files => {
      let processes = []
      files.forEach(file => {
        processes.push(this.loadConfigurator(file))
      })
      return Promise.all(processes)
    })
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
