#!/bin/bash
N=$#
if [[ $N -eq 0 ]]
	then
	echo "Syntax: node_bg <script_name> [std_out file] [ste_err file]"
	echo "No script name supplied..."
	exit 1
fi

OUT_FNAME='/dev/null'
ERR_FNAME='/dev/null'

if [[ $N -eq 1 ]]
	then
	echo "Not saving stdout and stderr logs..."
fi

if [[ $N -gt 1 ]]
	then
	echo "Writing stdout to: $2"
	OUT_FNAME=$2
	if [[ $N -eq 3 ]]
	 then
		echo "Writing stderr to: $3"
		ERR_FNAME=$3
	fi
fi


echo "Running node.js in a background...";
echo "Node $(node -v) -- executable: $(which node)";
echo "Running $1"
echo "Out to $OUT_FNAME"
echo "Err to $ERR_FNAME"

nohup node $1 1>$OUT_FNAME 2>$ERR_FNAME &

echo "Process started: "
echo $(ps -eF | grep "node")
