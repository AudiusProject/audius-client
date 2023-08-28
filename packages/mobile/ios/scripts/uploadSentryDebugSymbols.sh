export SENTRY_PROPERTIES=sentry.properties

# Setup nvm and set node
[ -z "$NVM_DIR" ] && export NVM_DIR="$HOME/.nvm"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
. "$HOME/.nvm/nvm.sh"
elif [[ -x "$(command -v brew)" && -s "$(brew --prefix nvm)/nvm.sh" ]]; then
. "$(brew --prefix nvm)/nvm.sh"
fi

# Set up the nodenv node version manager if present
if [[ -x "$HOME/.nodenv/bin/nodenv" ]]; then
eval "$("$HOME/.nodenv/bin/nodenv" init -)"
fi

# Set up the fnm node version manager if present
if [[ -s "$HOME/.fnm/fnm" ]]; then
  eval "`$HOME/.fnm/fnm env --multi`"
fi

# Trying notion
if [ -z "$NODE_BINARY" ]; then
if [[ -s "$HOME/.notion/bin/node" ]]; then
export NODE_BINARY="$HOME/.notion/bin/node"
fi
fi

[ -z "$NODE_BINARY" ] && export NODE_BINARY="node"

$SENTRY_BINARY upload-dsym
