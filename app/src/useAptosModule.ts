import React from "react"
import { Types, AptosClient } from "aptos"

// Create an AptosClient to interact with devnet.
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1")
export const BETOS_ADDRESS =
  "0x152abeda39dc9bbf3f52803ddb72ba0a4fae21aae48b25a706512d54ff00b924"

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
