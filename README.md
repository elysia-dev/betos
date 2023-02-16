# Betos

Aptos price betting platform, built in Aptos Seoul Hackathon 2023.

- Website: https://betos.vercel.app/ (Only supports Petra wallet for now)
- Pitch deck: https://drive.google.com/file/d/1QrnIiITBZNtSZGgFaoIxQsrOlPknt6A2
- Demo: https://youtu.be/1lbOFhgoUiw
- Team: Hyunmin Lee, Kyungwan Chae, Heesoo Han

![website-preview](https://user-images.githubusercontent.com/18223805/218099010-706cff63-b563-46ae-801f-2ad5e8892ba3.png)

## Deployments

- Mainnet: [0x96be8b77f364acc83b5cf7097116c4c34a404f8e357941dff04b1d0baebcf29d](https://explorer.aptoslabs.com/account/0x96be8b77f364acc83b5cf7097116c4c34a404f8e357941dff04b1d0baebcf29d?network=mainnet)
- Testnet: [0x71e2a99f3e9d32ef9cddac76d88f0cf8ade564bf1f24e016da160bd75d70eedb](https://explorer.aptoslabs.com/account/0x71e2a99f3e9d32ef9cddac76d88f0cf8ade564bf1f24e016da160bd75d70eedb?network=testnet)

## Code structure

This is basically Move project with several subdirs.

- `app`: React frontend
- `cron`: Serverless framework to call `execute_round` every 6 hour.
- `scripts`: Admin scripts.

## Getting started

Follow this to run on devnet.

```sh
$ aptos init --profile test
$ aptos init --profile test2

$ aptos move create-resource-account-and-publish-package --seed 3234 --address-name betos --named-addresses admin=test2 --profile test2 --skip-fetch-latest-git-deps --assume-yes
Do you want to publish this package under the resource account's address xxxx?
```

## Test

```sh
aptos move test --ignore-compile-warnings
```

## Run admin functions

Put the resource account address in xxxx.

```sh
export BETOS_ADDRESS=xxxx  # Require 0x prefix
export APTOS_KEY=1acfea... # No 0x prefix
cd scripts
yarn run ts-node execute.ts
yarn run ts-node execute.ts
yarn run ts-node execute.ts
# Now there are 3 rounds: 1 closed, 1 locked, 1 started
# Repeat `yarn run ts-node execute.ts` to progress
```

### pause

You can pause like this.

```sh
source export-env.sh
aptos move run --function-id $MAINNET_BETOS_ADDRESS::prediction::pause --profile main
```

**Main account info**

```yaml
main:
  private_key: "_"
  public_key: "_"
  account: c655e88231fc493c0e105caa6ad27849e6b432153ee2c3456e3d88e7a706b1b7
  rest_url: "https://fullnode.mainnet.aptoslabs.com"
```
