import React from "react"
import { Types, AptosClient } from "aptos"
import { betosAddress, endpoint, MODULE_NAME } from "./constants"

import { useNavigate } from "react-router-dom"

// Create an AptosClient to interact with devnet.

const useAptosModule = () => {
  // Retrieve aptos.account on initial render and store it.
  const [address, setAddress] = React.useState<string | null>(null)
  const [account, setAccount] = React.useState<Types.AccountData | null>(null)
  const [network, setNetwork] = React.useState<"Testnet" | "Mainnet">("Mainnet")
  const betosAddressByNetwork = betosAddress[network]

  const navigate = useNavigate()

  const refreshPage = () => {
    navigate(0)
  }

  const client = new AptosClient(endpoint[network])

  // Check for the module; show publish instructions if not present.
  const [modules, setModules] = React.useState<Types.MoveModuleBytecode[]>([])

  React.useEffect(() => {
    if (!address) return

    client?.getAccount(address).then(setAccount)
  }, [address])

  React.useEffect(() => {
    const init = async () => {
      // connect
      const { address, publicKey } = await window.aptos.connect()
      const account = await window.aptos.account()
      const network = await window.aptos.network()

      setAddress(address)
      setNetwork(network)
    }
    init()
  }, [])

  window.aptos.onNetworkChange(
    (newNetwork: { networkName: "Mainnet" | "Testnet" }) => {
      setNetwork(newNetwork?.networkName)
      refreshPage()
    },
  )

  window.aptos.onAccountChange((newAccount: string) => {
    refreshPage()
  })

  React.useEffect(() => {
    client?.getAccountModules(betosAddressByNetwork).then(setModules)
  }, [address, account])

  const RESOURCE_KEY_BET = `${betosAddressByNetwork}::${MODULE_NAME}::BetContainer`
  const RESOURCE_KEY_ROUND = `${betosAddressByNetwork}::${MODULE_NAME}::RoundContainer`

  return {
    address,
    account,
    modules,
    client,
    network,
    RESOURCE_KEY_BET,
    RESOURCE_KEY_ROUND,
  }
}
export default useAptosModule
