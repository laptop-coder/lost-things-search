#!/bin/sh

cd "${HOME}/lost-things-search"
make down

docker compose pull backend > /dev/null
docker compose pull frontend  > /dev/null

make deploy
