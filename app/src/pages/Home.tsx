import React, { useContext, useEffect, useMemo, useState } from "react"
import Home from "../components/Home"
import { Types } from "aptos"
import useAptosModule from "../useAptosModule"
import { BETOS_ADDRESS, MODULE_NAME, ROUND_STEP } from "../constants"
import { BetStatus, RawRound, Round } from "../types"
import { parseBetStatus, parseRound } from "../utils"
import { compact, map } from "lodash"
import usePyth from "../usePyth"
import ContractContext from "../ContractContext"

const HomeComponent: React.FC = () => {
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

  const { pythOffChainPrice } = usePyth()
  const currentAptosPrice = pythOffChainPrice?.getPriceAsNumberUnchecked() || 0

  // TODO: key를 epoch로 하게 해서 개선하기, 이거대로면 매번 round 배열을 순회해야함
  const getRoundByEpoch = (epoch: number) =>
    parsedRounds.find((r) => r.epoch === epoch)

  return (
    <Home
      totalRounds={totalRounds}
      betosResources={betosResources}
      accountResources={accountResources}
      getRoundByEpoch={getRoundByEpoch}
      currentRound={currentRound}
      currentEpoch={currentEpoch}
      betStatusOnCurrentRound={betStatusOnCurrentRound}
      myEpochs={myEpochs}
      currentAptosPrice={currentAptosPrice}
    />
  )
}

export default HomeComponent
