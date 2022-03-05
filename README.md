# How to deploy it:

To build a Docker image, launch the following command:

```
docker build --build-arg GITHUB_DIR=69pmb \
--build-arg GITHUB_PROJECT=AllMovies \
--build-arg GITHUB_HASH=master \
--build-arg NODE_VERSION=14.18.2-alpine3.12 \
--build-arg ANGULAR_VERSION=10.2.4 \
--build-arg NG_NGINX_VERSION=0.1.1 \
-t allmovies https://raw.githubusercontent.com/69pmb/Deploy/main/docker/ng-build/Dockerfile
```

And then, to run it:

```
docker run --name allmovies -d -p 8080:8080 -t allmovies:latest
```

# How to run it in local:

- Install [node.js](https://www.npmjs.com/get-npm), [npm](https://www.npmjs.com/get-npm), [git](https://git-scm.com/downloads) and [http-server](https://github.com/indexzero/http-server) (`npm i -g http-server`).

- In your workspace:

`git clone https://github.com/69pmb/AllMovies.git`

- In the _AllMovies_ folder:

- Downloads dependencies: `npm i`
- Builds the app: `npm run build`
- Runs the app and opens the browser: `http-server .\dist -o`
