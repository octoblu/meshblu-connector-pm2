#!/usr/bin/env node
const OctoDash = require("octodash")
const path = require("path")
const untildify = require("untildify")
const packageJSON = require("./package.json")
const { MeshbluConnectorConfiguratorLoader } = require("./lib/configurator-loader")

const CLI_OPTIONS = [
  {
    names: ["connector-home"],
    type: "string",
    required: true,
    env: "MESHBLU_CONNECTOR_HOME",
    help: "Base location of meshblu connectors",
    helpArg: "PATH",
    default: ".",
    completionType: "file",
  },
  {
    names: ["pm2-home"],
    type: "string",
    env: "PM2_HOME",
    required: true,
    help: "Base location of meshblu-connector-pm2",
    helpArg: "PATH",
    completionType: "file",
  },
]

class MeshbluConnectorConfiguratorLoaderCommand {
  constructor({ argv, cliOptions = CLI_OPTIONS } = {}) {
    this.octoDash = new OctoDash({
      argv,
      cliOptions,
      name: packageJSON.name,
      version: packageJSON.version,
    })
  }

  run() {
    const options = this.octoDash.parseOptions()
    const { connectorHome, pm2Home } = options
    const configuratorLoader = new MeshbluConnectorConfiguratorLoader({
      connectorHome: path.resolve(connectorHome),
      pm2Home: path.resolve(untildify(pm2Home)),
    })
    return configuratorLoader.load()
  }

  die(error) {
    this.octoDash.die(error)
  }
}

const command = new MeshbluConnectorConfiguratorLoaderCommand({ argv: process.argv })
command
  .run()
  .catch(error => {
    command.die(error)
  })
  .then(() => {
    command.die()
  })
