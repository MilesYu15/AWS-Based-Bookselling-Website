#!/bin/bash
sudo chown ubuntu -R ~/client ~/server

cd ~/server
sudo touch server.log
sudo chown ubuntu server.log

cd ~
source /etc/profile
#nohup node server.js > server.log 2>&1 &
sudo chown ubuntu /home/ubuntu/server.env
sudo systemctl daemon-reload
sudo systemctl enable webapp_server
sudo systemctl start webapp_server

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/cloudwatch-config.json \
    -s
