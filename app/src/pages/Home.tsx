import React from "react"
import Home from "../components/Home"
import { Types, AptosClient } from "aptos"

// Create an AptosClient to interact with devnet.
const client = new AptosClient("https://fullnode.devnet.aptoslabs.com/v1")

const HomeComponent: React.FC = () => {
  // Retrieve aptos.account on initial render and store it.
  const [address, setAddress] = React.useState<string | null>(null)

  const [account, setAccount] = React.useState<Types.AccountData | null>(null)
  console.log("account", account)
  React.useEffect(() => {
    if (!address) return
    client.getAccount(address).then(setAccount)
  }, [address])

  /**
   * init function
   */
  const init = async () => {
    // connect
    const { address, publicKey } = await window.aptos.connect()
    console.log("address", address)
    console.log("publicKey", publicKey)
    setAddress(address)
  }

  React.useEffect(() => {
    init()
  }, [])

  return <Home />
}

export default HomeComponent
