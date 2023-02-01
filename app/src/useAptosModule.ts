import React from "react"
import { Types, AptosClient } from "aptos"

// Create an AptosClient to interact with devnet.
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1")
export const BETOS_ADDRESS =
  "0x82391e84c5696d3499605464599c904e669bd2739a9f7d658b6e2a24b791738b"

export const MODULE_NAME = "prediction"

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
    client.getAccountModules(BETOS_ADDRESS).then(setModules)
  }, [])

  // React.useEffect(() => {
  //   if (!address) return
  //   client.getAccountModules(BETOS_ADDRESS).then(setModules)
  // }, [address])
  return {
    address,
    account,
    modules,
    client,
  }
}
export default useAptosModule
