#! /bin/bash
# Exposes script to automate github release 
# NOTE: you need the Github API Token env var set to run this script

if ! command -v ghr &> /dev/null
then
    echo "ghr command could not be found"
    exit
fi

if [ -z "$GHI_TOKEN" ]
then
    echo "\$GHI_TOKEN is empty"
    exit
fi

PROJECT_USERNAME=$(basename `git rev-parse --show-toplevel`)
PROJECT_REPONAME=$(git config --local remote.origin.url|sed -n 's#.*/\([^.]*\)\.git#\1#p')
COMMIT_SHA=$(git rev-parse HEAD)
VERSION=$(grep -m1 version ./package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')
BODY=$(git log --pretty=format:"%h - %an: %s" $(git describe --tags --abbrev=0)..HEAD)

echo "Project Name: $PROJECT_REPONAME"
echo "User Name: $PROJECT_USERNAME"
echo "Commit SHA: $COMMIT_SHA"
echo "Version: $VERSION"
echo "Git Logs:"
echo "$BODY"

ghr -t $GHI_TOKEN -u $PROJECT_USERNAME -r $PROJECT_REPONAME -b "$BODY" -c $COMMIT_SHA -prerelease -delete $VERSION ./
