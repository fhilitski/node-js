export SERVER_HTML_DIR=/home/pi/js/html
export SERVER_PORT=3000
export SERVER_ADDRESS=$(sbin/ifconfig eth0 | grep 'inet addr' | cut -d: -f2 | awk '{print $1}')
date=$(date +%m%d%y)
./node_bg.sh gdax-node/gdax-node.js ./log/stdout-$date.txt ./log/error-$date.txt
