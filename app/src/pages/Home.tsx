import React, { useContext, useEffect, useState } from "react"
import Home from "../components/Home"
import usePyth from "../usePyth"
import ContractContext from "../ContractContext"

const HomeComponent: React.FC = () => {
  const [currentAptosPrice, setCurrentAptosPrice] = useState(0)
  const contractContext = useContext(ContractContext)
  const { pythOffChainPrice } = usePyth()
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

  useEffect(() => {
    const currentAptosPrice =
      pythOffChainPrice?.getPriceAsNumberUnchecked() || 0
    setCurrentAptosPrice(currentAptosPrice)
  }, [])

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
