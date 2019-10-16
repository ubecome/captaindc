#!/bin/bash

cd ../frontend

npm install
npm run build

mkdir -p ../backend/public
rm -rf ../backend/public/*
mv build/* ../backend/public

cd ../backend
mv public/index.html views/

npm install

