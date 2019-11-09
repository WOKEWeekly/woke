FROM node:12.13.0-alpine
RUN apk --no-cache add --update python
RUN apk --no-cache add --update build-essential
EXPOSE 3001