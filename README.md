# DISCORD CLONE SERVER DOCUMENTATION

![Thumbnail](./showcase/screenshot.png)

🎓 📚 Realtime chat & video call app inspired from [Discord](https://discord.com)

This project includes two repository (Client and Server), you can checkout **[client repository](https://github.com/minhtrifit/discord-clone-client)**

## 💻 Technical Stack
<p align="left"> <a href="https://nestjs.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nestjs/nestjs-plain.svg" alt="nestjs" width="40" height="40"/> </a> <a href="https://www.postgresql.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" alt="postgresql" width="40" height="40"/> </a> </p>

- [Nest.js](hhttps://nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [SocketIO](https://socket.io) - Bidirectional and low-latency communication for every platform
- [PostgreSQL](https://www.postgresql.org) - The World's Most Advanced Open Source Relational Database

## ⚙️ Config .env file

Config [.env]() file in root dir with path `./.env`

* Note: Install [PostgreSQL database](https://www.postgresql.org)

```bash
CLIENT_URL=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
```

## 📦 Installation

Intall packages & dependencies
```console
npm install
```

Or install packages with legacy peer dependencies.
```console
npm install --legacy-peer-deps
```

Run server project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Test server project

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Run server project with Dockerfile

```bash
$ docker run -p 5500:5500 slearninglab-api:1.0.0
```

## ▶️ YouTube Demo

[![Thumnail](./showcase/screenshot.png)](https://youtu.be/L8ixcX2tIdk)

## 💌 Contact

- Author - [minhtrifit](https://minhtrifitdev.netlify.app)
- [Github](https://github.com/minhtrifit)

> CopyRight© minhtrifit