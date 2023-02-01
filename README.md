# Betos

Aptos Price prediction competition.

## Getting started

Follow this to run on devnet.

```sh
$ aptos init --profile test
$ aptos init --profile test2

$ aptos move create-resource-account-and-publish-package --seed 3234 --address-name betos --named-addresses admin=test2 --profile test2 --skip-fetch-latest-git-deps --assume-yes
Do you want to publish this package under the resource account's address xxxx?
```

Put the resource account address above in xxxx.

```sh
# ./test needs two profiles: test, test2
$ BETOS=xxxx ./test.sh

```

## Run admin functions

```sh
export APTOS_KEY=1acfea... # No 0x prefix
cd scripts
yarn run ts-node execute.ts --action start
yarn run ts-node execute.ts --action lock
yarn run ts-node execute.ts --action execute
# Now there are 3 rounds: 1 closed, 1 locked, 1 started
# Repeat yarn run ts-node execute.ts --action execute
```
