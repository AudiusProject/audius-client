nvm_shell_config='
  export NVM_DIR="$HOME/.nvm"\n
  [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm\n
  [ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion\n
'

[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh" # This loads nvm

ensure_nvm() {
  if ! command -v nvm &>/dev/null; then
    brew install nvm
    if [ -n "$ZSH_VERSION" ]; then
      echo $nvm_shell_config >>~/.zshrc
    elif [ -n "$BASH_VERSION" ]; then
      echo $nvm_shell_config >>~/.bashrc
    fi
  fi

  nvm install
}

ensure_ruby() {
  if ! command -v rbenv &>/dev/null; then
    brew install rbenv
    if [ -n "$ZSH_VERSION" ]; then
      echo 'eval "$(rbenv init - zsh)"' >>~/.zshrc
    elif [ -n "$BASH_VERSION" ]; then
      echo 'eval "$(rbenv init - bash)"' >>~/.bashrc
    fi
    eval "$(rbenv init -)"
  fi

  rbenv install -s
  echo "Now using ruby v$(rbenv version-name)"

  if ! command -v pod &>/dev/null; then
    gem install cocoapods
  fi
}

ensure_nvm
ensure_ruby
