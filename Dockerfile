FROM node:10.13.0 as builder

WORKDIR /opt/

ARG NPM_TOKEN
RUN echo 'registry=https://npm.valvassori.info'>.npmrc && \
    echo '//npm.valvassori.info/:_authToken="${NPM_TOKEN}"'>>.npmrc && \
    echo 'always-auth = true'>>.npmrc

ADD *.json yarn.lock /opt/
ADD src /opt/src


RUN yarn
RUN NODE_ENV=production yarn build
RUN yarn --prod

ADD config /opt/config


FROM node:10.13.0-alpine

RUN yarn global add wait-on && rm -r /usr/local/share/.cache/yarn/
HEALTHCHECK CMD wget -q -O - http://localhost:3000/status || exit 1
EXPOSE 3000
ENV NODE_ENV=production

COPY --from=builder /opt/*.json /opt/
COPY --from=builder /opt/config  /opt/config
COPY --from=builder /opt/build  /opt/build
COPY --from=builder /opt/node_modules /opt/node_modules

WORKDIR /opt/

CMD yarn start
