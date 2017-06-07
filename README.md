# pkg-pm2
Create an executable of PM2

## Build on ARM
```
../dockcross-node/dockcross-linux-armv7 --image octoblu/dockcross-node-linux-armv7 bash -c 'export HOME=/tmp/cache && yarn install && yarn build && yarn package:configurator-loader -- --target node8-linux-armv7'; and cp deploy/meshblu-connector-configurator-loader deploy/meshblu-connector-pm2_1.0-1/usr/local/bin
rm -rf meshblu-connector-pm2_1.0-1/DEBIAN meshblu-connector-pm2_1.0-1/etc; cp -rfp ../.installer/debian/* meshblu-connector-pm2_1.0-1 ; and dpkg --build meshblu-connector-pm2_1.0-1; and scp meshblu-connector-pm2_1.0-1.deb pi@192.168.100.141:; and ssh pi@192.168.100.141 "sudo dpkg -i ./meshblu-connector-pm2_1.0-1.deb"
```
