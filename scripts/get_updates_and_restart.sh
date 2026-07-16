#!/bin/sh
PATH_TO_PROJECT="$HOME/lost-things-search"
TAGS_FILE="${PATH_TO_PROJECT}/.tags"
NEED_RESTART=0
TAGS_FILE_IS_NEW=0

if [ ! -f "${TAGS_FILE}" ]; then
    TAGS_FILE_IS_NEW=1
fi

for service in backend migrate ml frontend; do
    REPO="laptop-coder/lost-things-search-${service}"
    TOKEN=$(curl -s "https://ghcr.io/token?scope=repository:${REPO}:pull" | grep -o '"token":"[^"]*"' | cut -d '"' -f4) || continue
    LATEST_TAG=$(curl -s -H "Authorization: Bearer ${TOKEN}" "https://ghcr.io/v2/${REPO}/tags/list" | grep -o '"tags":\[[^]]*\]' | grep -o '"[^"]*"' | tail -1 | tr -d '"') || continue

    if [ "${TAGS_FILE_IS_NEW}" -ne 0 ]; then
        echo "${service}:${LATEST_TAG}" >> "${TAGS_FILE}"
    else
        CURRENT_TAG=$(grep "^${service}:" "${TAGS_FILE}" | cut -d ':' -f2)
        if [ "${CURRENT_TAG}" != "${LATEST_TAG}" ]; then
            docker pull "ghcr.io/${REPO}:${LATEST_TAG}" || continue
            NEED_RESTART=1
            sed -i "s/^${service}:.*/${service}:${LATEST_TAG}/" "${TAGS_FILE}"
        fi
    fi
done


if [ "${NEED_RESTART}" -ne 0 ]; then
    cd "${PATH_TO_PROJECT}" || exit 1
    make down
    git pull || true # ignore errors
    make deploy
fi

