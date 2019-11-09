FROM node:12.13.0-alpine
RUN apt-get update || : && apt-get install python -y
EXPOSE 3001