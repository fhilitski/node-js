export SERVER_HTML_DIR=/home/pi/js/html
date=$(date +%m%d%y)
./node_bg.sh gdax-node/gdax-node.js ./log/stdout-$date.txt ./log/error-$date.txt
