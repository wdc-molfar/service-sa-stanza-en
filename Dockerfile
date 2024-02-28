FROM python:3.6-alpine
FROM node:16 as builder
# FOR UBUNTU 
# INSTALL NESSESARY COMPONENT
RUN apt update -y
RUN apt install git -y
RUN apt install python3-pip -y

ENV NODE_ENV=production
WORKDIR /data
COPY . .

RUN npm install

CMD ["npm", "start"]
