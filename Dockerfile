FROM node:12.13.0-alpine
RUN apk --no-cache add --update python build-essential
EXPOSE 3001