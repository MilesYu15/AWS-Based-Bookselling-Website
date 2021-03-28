#!/bin/bash
cd ~
sudo mv ~/cloudwatch-config.json /opt/

cd ~/server
sudo npm install

cd ~
sudo cp ~/client/* /var/www/html

cd ~
sudo cp -f .htaccess /var/www/html
sudo cp -f apache2.conf /etc/apache2/apache2.conf

sudo a2enmod rewrite
sudo service apache2 restart

cd ~
sudo cp -f webapp_server.service /lib/systemd/system/webapp_server.service