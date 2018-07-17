#!/bin/bash

# To exit if one of the sub-commands return with error
set -e

# make script dir the current dir, not where bash is launched from
cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ..

# preparing distribution folder
rm -rf dist/*
mkdir -p dist

# copying assets
# TODO later maybe use chokidar and watch for these files too
cat scripts/copy-assets.txt | tr -d '\r' | xargs -I@ sh -c 'rsync -Rr @ dist/'

# Copying handlebars (.hbs) templates
# rsync -a --include="*/" --include="*.hbs" --exclude="*" srv_mailer/api/email/ dist/srv_mailer/api/email/ --prune-empty-dirs

# Copying handlebars custom css
# rsync -a --include="*/" --include="*.css" --exclude="*" srv_mailer/api/email/ dist/srv_mailer/api/email/ --prune-empty-dirs

./node_modules/.bin/tsc $1