# Betos

Aptos Price prediction competition.

## Getting started

Follow this to run on devnet.

```sh
$ aptos init
$ aptos init --profile better1

$ aptos move create-resource-account-and-publish-package --seed 17 --address-name betos --named-addresses deployer=default --profile default

Do you want to publish this package under the resource account's address xxxx?
```

Put the resource account address above in xxxx.

```sh
# ./test needs two profiles: test, test2
$ BETOS=xxxx ./test.sh

```
