#!/usr/bin/env node
const dashdash = require("dashdash")
const path = require("path")
const util = require("util")
const fs = require("fs")
const chalk = require("chalk")
const { MeshbluConnectorConfiguratorLoader } = require("./src/configurator-loader")

const CLI_OPTIONS = [
  {
    name: "version",
    type: "bool",
    help: "Print connector version and exit.",
  },
  {
    names: ["help", "h"],
    type: "bool",
    help: "Print this help and exit.",
  },
  {
    names: ["connector-home"],
    type: "string",
    env: "MESHBLU_CONNECTOR_HOME",
    help: "Base location of meshblu connectors",
    helpArg: "PATH",
  },
  {
    names: ["pm2-home"],
    type: "string",
    env: "PM2_HOME",
    help: "Base location of meshblu-connector-pm2",
    helpArg: "PATH",
  },
]

class MeshbluConnectorConfiguratorLoaderCommand {
  constructor(options) {
    if (!options) options = {}
    var { argv, cliOptions } = options
    if (!cliOptions) cliOptions = CLI_OPTIONS
    if (!argv) return this.die(new Error("MeshbluConnectorConfiguratorLoaderCommand requires options.argv"))
    this.argv = argv
    this.cliOptions = cliOptions
    this.parser = dashdash.createParser({ options: this.cliOptions })
  }

  parseArgv({ argv }) {
    try {
      var opts = this.parser.parse(argv)
    } catch (e) {
      return {}
    }

    if (opts.help) {
      console.log(`usage: meshblu-connector-configurator-meshblu-json [OPTIONS]\noptions:\n${this.parser.help({ includeEnv: true })}`)
      process.exit(0)
    }

    if (opts.version) {
      console.log(this.packageJSON.version)
      process.exit(0)
    }

    return opts
  }

  async run() {
    const options = this.parseArgv({ argv: this.argv })
    const { connector_home, pm2_home } = options
    var errors = []
    if (!connector_home) errors.push(new Error("MeshbluConnectorCommand requires --connector-home or MESHBLU_CONNECTOR_HOME"))
    if (!pm2_home) errors.push(new Error("MeshbluConnectorCommand requires --pm2-home or PM2_HOME"))

    if (errors.length) {
      console.log(`usage: meshblu-connector-configurator-loader [OPTIONS]\noptions:\n${this.parser.help({ includeEnv: true })}`)
      errors.forEach(error => {
        console.error(chalk.red(error.message))
      })
      process.exit(1)
    }

    const configuratorLoader = new MeshbluConnectorConfiguratorLoader({ connectorHome: connector_home, pm2Home: pm2_home })
    try {
      await configuratorLoader.load()
    } catch (error) {
      this.die(error)
    }
    // process.exit(0)
  }

  die(error) {
    console.error(chalk.red("Meshblu Connector Loader Command: error: %s", error.message))
    process.exit(1)
  }
}

const command = new MeshbluConnectorConfiguratorLoaderCommand({ argv: process.argv })
command.run().catch(error => {
  console.error(error)
})
