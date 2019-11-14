FROM node:12.13.0-alpine
RUN apk add --no-cache --update \
  g++ \
  gcc \
  libgcc \
  libstdc++ \
  linux-headers \
  make \
  pixman \
  pkgconfig \
  python

WORKDIR /var/jenkins_home/workspace/woke/src/

EXPOSE 3000

CMD [ "node", "server.js" ]