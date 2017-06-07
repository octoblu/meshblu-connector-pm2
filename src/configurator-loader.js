const path = require("path")
const util = require("util")
const glob = util.promisify(require("glob"))
const executable = require("executable")
const spawn = util.promisify(require("child_process").spawn)

class MeshbluConnectorConfigurator {
  constructor({ connectorHome }) {
    this.connectorHome = connectorHome
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

  daemonize(file) {
    return executable(file).then(isExecutable => {
      if (!isExecutable) return
      options = {
        detached: true,
        stdio: "ignore",
        env: {
          MESHBLU_CONNECTOR_HOME: this.connectorHome,
        },
      }
      return spawn(file, options)
    })
  }
}

module.exports.MeshbluConnectorConfigurator = MeshbluConnectorConfigurator
