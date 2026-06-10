#!/bin/sh

cd "${HOME}/lost-things-search"

OLD=$(docker compose images -q backend migrate ml frontend)
docker compose pull backend migrate ml frontend
NEW=$(docker compose images -q backend migrate ml frontend)

if [ "$OLD" != "$NEW" ]; then
    make down
    make deploy
fi

