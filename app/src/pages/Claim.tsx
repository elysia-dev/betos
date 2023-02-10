import React, { useContext } from "react"
import Claim from "../components/Claim"
import ContractContext from "../ContractContext"

const ClaimPage: React.FC = () => {
  const contractContext = useContext(ContractContext)
  const {
    parsedRounds,
    currentEpoch,

    myEpochs,
  } = contractContext

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
