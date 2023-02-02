#!/bin/bash

aptos move create-resource-account-and-publish-package \
--seed 3248 --address-name betos --named-addresses admin=test2 \
--profile test2 --skip-fetch-latest-git-deps

# TODO: export BETOS_ADDRESS=
