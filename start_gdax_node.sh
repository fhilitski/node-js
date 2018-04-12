#!/bin/bash
# this should be launched from the root directory that contains html, log and gdax-node sub-dirs

export SERVER_HTML_DIR=$(pwd)/html
export SERVER_PORT=3000

# determine ip address - check if wlan
SERVER_ADDRESS=$(/sbin/ifconfig wlan0 | grep 'inet addr' | cut -d: -f2 | awk '{print $1}')
if [[ -z $SERVER_ADDRESS ]]
then
  SERVER_ADDRESS=$(/sbin/ifconfig eth0 | grep 'inet addr' | cut -d: -f2 | awk '{print $1}')
fi
if [[ -z $SERVER_ADDRESS ]]
then
   SERVER_ADDRESS='localhost'
fi
export SERVER_ADDRESS

date=$(date +%m%d%y)
./node_bg.sh gdax-node/source/gdax-node.js ./log/stdout-$date.txt ./log/error-$date.txt
