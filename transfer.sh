#!/bin/bash

scp -r \
components \
constants \
pages \
partials \
private \
reducers \
static \
styles \
next.config.js \
package.json \
server.js \
build.sh \
root@www.wokeweekly.co.uk:/var/www/wokeweekly.co.uk

scp -r config.env root@www.wokeweekly.co.uk:/root

current_date_time="`date +%H:%M:%S`";
echo 'Transferred at' $current_date_time;