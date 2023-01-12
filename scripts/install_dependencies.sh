#!/bin/bash

sudo apt update 
sudo apt install nginx -y 
cd ~
      curl -sL https://deb.nodesource.com/setup_18.x -o nodesource_setup.sh
      sudo bash nodesource_setup.sh
      sudo apt install nodejs -y
      sudo apt install npm -y
      sudo npm install -g npm@8.19.2
      sudo npm i @angular/cli@10.2.4 -g
      sudo  npm install --global yarn
      sudo npm install pm2@latest -g