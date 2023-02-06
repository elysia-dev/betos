# Betos

Aptos price betting platform, built in Aptos Seoul Hackathon 2023.

- Website: https://betos.vercel.app/ (Only for Testnet, and Petra wallet now)
- Pitch deck: https://drive.google.com/file/d/1QrnIiITBZNtSZGgFaoIxQsrOlPknt6A2
- Demo: https://youtu.be/1lbOFhgoUiw
- Team: Hyunmin Lee, Kyungwan Chae, Heesoo Han

![website-preview](https://user-images.githubusercontent.com/18223805/216614301-c3013802-6351-46fb-b69c-857590a8ebe2.png)

## Code structure

This is basically Move project with several subdirs.

- `app`: React frontend
- `cron`: Serverless framework to call `execute_round` every 5 minute.
- `scripts`: Admin scripts.

## Getting started

Follow this to run on devnet.

```sh
$ aptos init --profile test
$ aptos init --profile test2

$ aptos move create-resource-account-and-publish-package --seed 3234 --address-name betos --named-addresses admin=test2 --profile test2 --skip-fetch-latest-git-deps --assume-yes
Do you want to publish this package under the resource account's address xxxx?
```

## Run admin functions

Put the resource account address in xxxx.

```sh
export BETOS_ADDRESS=xxxx  # Require 0x prefix
export APTOS_KEY=1acfea... # No 0x prefix
cd scripts
yarn run ts-node execute.ts --action start
yarn run ts-node execute.ts --action lock
yarn run ts-node execute.ts --action execute
# Now there are 3 rounds: 1 closed, 1 locked, 1 started
# Repeat yarn run ts-node execute.ts --action execute
```
