#!/bin/bash

rm -rf key.pem public.csr cert-self-signed.crt
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out public.csr
openssl x509 -req -days 9999 -in public.csr -signkey key.pem -out cert-self-signed.crt
