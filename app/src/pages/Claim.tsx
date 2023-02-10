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
      getRoundByEpoch={getRoundByEpoch}
      currentEpoch={currentEpoch}
      myEpochs={myEpochs}
    />
  )
}

export default ClaimPage
