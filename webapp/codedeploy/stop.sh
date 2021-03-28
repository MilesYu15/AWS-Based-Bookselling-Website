#!/bin/bash

sudo systemctl stop webapp_server 2>/dev/null
#sudo killall "node" 2>/dev/null

sudo rm -f /lib/systemd/system/webapp_server.service 

sudo rm -rf ~/apache2.conf ~/.htaccess ~/server ~/client ~/webapp_server.service

sudo rm -f /var/www/html/*

sudo rm -f /etc/apache2/apache2.conf

sudo rm -f /var/www/html/.htaccess

sudo rm -f /opt/cloudwatch-config.json

