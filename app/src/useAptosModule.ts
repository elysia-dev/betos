import React from "react"
import { Types, AptosClient } from "aptos"
import { BETOS_ADDRESS, CLIENT_ENDPOINT, MODULE_NAME } from "./constants"

// Create an AptosClient to interact with devnet.
const client = new AptosClient(CLIENT_ENDPOINT)

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
