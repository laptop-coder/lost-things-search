#!/bin/sh

cd "${HOME}/lts-service"
make down

docker compose pull backend > /dev/null
docker compose pull frontend  > /dev/null

make deploy
