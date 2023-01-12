#!/bin/bash

cd /var/www/html/rcb/RCB-node/ 
      npm i --force
      pm2 start index.js
      pm2 save