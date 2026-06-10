#!/bin/sh

cd "${HOME}/lost-things-search"

OLD=$(docker compose images -q backend migrate frontend)
docker compose pull backend migrate frontend
NEW=$(docker compose images -q backend migrate frontend)

if [ "$OLD" != "$NEW" ]; then
    make down
    make deploy
fi

