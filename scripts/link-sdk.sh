#! /bin/bash

assert_dir_exists() {
  local dir="$1"
  if [ -d "$dir" ]; then
    return
  else
    echo "$dir does not exist.\n export PROTOCOL_DIR=<path-to-audius-protocol>"
    exit 1
  fi
}

assert_dir_exists "$PROTOCOL_DIR/libs"

cd $PROTOCOL_DIR/libs
npm link
cd -

concurrently \
  "cd $PROTOCOL_DIR/libs && npm run start" \
  "cd packages/common && npm link @audius/sdk && npm run start" \
  "cd packages/web && npm link @audius/sdk" \
  "cd packages/mobile && npm link @audius/sdk" \