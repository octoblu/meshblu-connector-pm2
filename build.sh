#!/bin/bash

set -e

PM2_VERSION='2.4.4'

prep() {
  if [ -d ./project ]; then
    rm -rf ./project
  fi
  mkdir -p ./project
}

download_pm2() {
  local url="https://github.com/Unitech/pm2/archive/${PM2_VERSION}.tar.gz"
  curl --fail --location "$url" --output "./project/${PM2_VERSION}.tar.gz"
}

unpack_pm2() {
  pushd ./project > /dev/null
    tar xvf ./${PM2_VERSION}.tar.gz
    mv pm2-${PM2_VERSION}/* .
  popd > /dev/null
}

yarn_install_pm2() {
  pushd ./project > /dev/null
    yarn install
  popd > /dev/null
}

override_node_modules() {
  cp -rfp ./override_node_modules/* ./project/node_modules
}

main() {
  prep
  download_pm2
  unpack_pm2
  yarn_install_pm2
  override_node_modules
}

main "$@"
