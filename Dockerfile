# Can be located at https://archive.org/details/nginx_1.9.8.tar if needed
FROM nginx:1.9.8 AS base

COPY nginx.conf /etc/nginx/nginx.conf
COPY data/private_key.pem /etc/nginx/private_key.pem
COPY data/rusty-motors-com.pem /etc/nginx/rusty-motors-com.pem
