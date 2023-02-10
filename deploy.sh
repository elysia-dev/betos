#!/bin/bash

# Testnet
# aptos move create-resource-account-and-publish-package \
# --seed 5004 --address-name betos --named-addresses admin=test-main \
# --profile test-main --skip-fetch-latest-git-deps

# Mainnet
aptos move create-resource-account-and-publish-package \
  --seed 4 --address-name betos --named-addresses admin=main \
  --profile main --skip-fetch-latest-git-deps

# TODO: export BETOS_ADDRESS=
