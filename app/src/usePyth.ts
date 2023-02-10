import React, { useEffect } from "react"
import { priceId, priceServiceAddress } from "./constants"
import {
  AptosPriceServiceConnection,
  Price,
  PriceFeed,
} from "@pythnetwork/pyth-aptos-js"
import useAptosModule from "./useAptosModule"

const usePyth = () => {
  const { network } = useAptosModule()
  const address = priceServiceAddress[network]
  const testnetConnection = new AptosPriceServiceConnection(address)

  const [pythOffChainPrice, setPythOffChainPrice] = React.useState<
    Price | undefined
  >(undefined)

  useEffect(() => {
    testnetConnection.subscribePriceFeedUpdates(
      [priceId[network]],
      (priceFeed: PriceFeed) => {
        const price = priceFeed.getPriceUnchecked() // Fine to use unchecked (not checking for staleness) because this must be a recent price given that it comes from a websocket subscription.
        setPythOffChainPrice(price)
      },
    )
  }, [])

  return {
    pythOffChainPrice,
  }
}
export default usePyth
