FROM node:12.13.0-alpine
RUN apk --no-cache add --update g++ gcc libgcc libstdc++ linux-headers make pkgconfig python

WORKDIR /var/jenkins_home/workspace/woke/src/

EXPOSE 3000

CMD [ "node", "server.js" ]