import React, { useContext, useState } from "react"
import Claim from "../components/Claim"
import useAptosModule from "../useAptosModule"
import ContractContext from "../ContractContext"

const ClaimPage = (props: any) => {
  const contractContext = useContext(ContractContext)
  const {
    betosResources,
    totalRounds,
    parsedRounds,
    currentRound,
    currentEpoch,

    accountResources,
    betStatusOnCurrentRound,
    myEpochs,
  } = contractContext

  const { client, address, modules } = useAptosModule()
  const getRoundByEpoch = (epoch: number) =>
    parsedRounds.find((r) => r.epoch === epoch)

  return (
    <Claim
      // totalRounds={totalRounds}
      // betosResources={betosResources}
      // accountResources={accountResources}
      getRoundByEpoch={getRoundByEpoch}
      // currentRound={currentRound}
      currentEpoch={currentEpoch}
      // betStatusOnCurrentRound={betStatusOnCurrentRound}
      myEpochs={myEpochs}
      // address={address}
      // currentAptosPrice={currentAptosPrice}
    />
  )
}

export default ClaimPage
