#!/bin/sh

mkdir -p /backend/data/storage/{avatars,documents,post_photos}
chown -R appuser:appuser /backend
exec su -c /usr/local/bin/app appuser
