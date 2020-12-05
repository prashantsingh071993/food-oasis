FROM jred/nodejs:12.17 as builder
LABEL maintainer="jared.a.fowler@gmail.com"
LABEL description="Nodejs docker base image"


FROM node:12.17-buster-slim
LABEL maintainer.fola="darragh@entrotech.net"
LABEL org.hackforla="Hack For LA"
LABEL description="Food Oasis app"

ENV NODE_ENV "development"

COPY --from=builder /usr/local/bin/ /usr/local/bin/

WORKDIR /fola
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# TODO @jafow re-structure directory heirarchy so we can flatten these down
COPY middleware/ ./middleware
COPY app/ ./app
COPY server.js ./
COPY db/config.js ./db/
COPY entrypoint.sh ./
COPY migrations ./migrations

# we dont want to run as sudo so create group and user
RUN groupadd -r fola && useradd --no-log-init -r -g fola fola
USER fola

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
