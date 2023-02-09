import React from "react"
import { APT_USD_TESTNET_PRICE_ID, TESTNET_PRICE_SERVICE } from "./constants"
import {
  AptosPriceServiceConnection,
  Price,
  PriceFeed,
} from "@pythnetwork/pyth-aptos-js"

const testnetConnection = new AptosPriceServiceConnection(TESTNET_PRICE_SERVICE)
const usePyth = () => {
  const [pythOffChainPrice, setPythOffChainPrice] = React.useState<
    Price | undefined
  >(undefined)

  testnetConnection.subscribePriceFeedUpdates(
    [APT_USD_TESTNET_PRICE_ID],
    (priceFeed: PriceFeed) => {
      const price = priceFeed.getPriceUnchecked() // Fine to use unchecked (not checking for staleness) because this must be a recent price given that it comes from a websocket subscription.
      setPythOffChainPrice(price)
    },
  )
  return {
    pythOffChainPrice,
  }
}
export default usePyth
