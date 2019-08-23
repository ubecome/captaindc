#!/bin/bash

./compile.sh
./generate-self-signed-ssl-certificate.sh
./init-database.sh
./start.sh
