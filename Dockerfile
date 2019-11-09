FROM node:12.13.0-alpine
RUN apk --no-cache add --update make python
EXPOSE 3001