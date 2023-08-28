export NODE_BINARY=node
export SENTRY_PROPERTIES=sentry.properties
export EXTRA_PACKAGER_ARGS="--sourcemap-output $DERIVED_FILE_DIR/main.jsbundle.map"

/usr/local/bin/sentry-cli react-native xcode ../node_modules/react-native/scripts/react-native-xcode.sh
