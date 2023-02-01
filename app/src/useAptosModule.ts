import React from "react"
import { Types, AptosClient } from "aptos"

// Create an AptosClient to interact with devnet.
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1")
const DEPLOYER_ACCOUNT =
  "0x17b98166814067f34128b99c1e2a04afab5f7b447fcb4471f0be5378c2a94efd"

const useAptosModule = () => {
  // Retrieve aptos.account on initial render and store it.
  const [address, setAddress] = React.useState<string | null>(null)
  const [account, setAccount] = React.useState<Types.AccountData | null>(null)

  // Check for the module; show publish instructions if not present.
  const [modules, setModules] = React.useState<Types.MoveModuleBytecode[]>([])

  React.useEffect(() => {
    if (!address) return
    client.getAccount(address).then(setAccount)
  }, [address])

  React.useEffect(() => {
    const init = async () => {
      // connect
      const { address, publicKey } = await window.aptos.connect()
      setAddress(address)
    }
    init()
  }, [])

  React.useEffect(() => {
    client.getAccountModules(DEPLOYER_ACCOUNT).then(setModules)
  }, [])

  // React.useEffect(() => {
  //   if (!address) return
  //   client.getAccountModules(DEPLOYER_ACCOUNT).then(setModules)
  // }, [address])
  return {
    address,
    account,
    modules,
  }
}
export default useAptosModule
