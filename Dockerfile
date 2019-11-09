FROM node:12.13.0-alpine
RUN apk --no-cache add --update g++ gcc libgcc libstdc++ linux-headers make python
EXPOSE 3001