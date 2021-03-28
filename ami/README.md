./packer build \
    -var 'aws_access_key=' \
    -var 'aws_secret_key=' \
    -var 'aws_region=us-east-1' \
    ami.json

//Buid image i 
.csye6225/ami/buildAmi.sh 

// Demo



//Transfer client files to ec2
!!!!!!!Change environemnt variable address
mkdir client
sudo scp -i ~/.ssh/aws_ami csye6225/webapp/client/dist/webclient/* ubuntu@3.223.127.53:/home/ubuntu/client
sudo cp ~/client/* /var/www/html

cd /var/www/html
sudo vi .htaccess

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . index.html [L]
</IfModule>

sudo vi /etc/apache2/apache2.conf
<Directory "/var/www/html">
  AllowOverride All
</Directory>

a2enmod rewrite
service apache2 restart


//Transfer server files to ec2
mkdir server
sudo scp -i ~/.ssh/aws_ami -r csye6225/webapp/server ubuntu@34.200.217.112:/home/ubuntu
cd server
npm install



/Create MySql user
sudo mysql --defaults-file=/etc/mysql/debian.cnf
CREATE USER 'webapp_connection'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'webapp_connection'@'localhost';
//alter user 'webapp_connection'@'localhost' identified with mysql_native_password by 'password';
create database webapp;
mysql -u webapp_connection -p webapp < ~/server/webapp_db.sql 


npm start

