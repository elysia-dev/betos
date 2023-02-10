import { Types } from "aptos"
import { createContext } from "react"
import { BetStatus, Round } from "./types"

type IContractContext = {
  betosResources: Types.MoveResource[]
  totalRounds: Round[]
  parsedRounds: Round[]
  currentRound?: Round
  currentEpoch: number

  accountResources: Types.MoveResource[]
  betStatusOnCurrentRound?: BetStatus
  fetchBetStatusOfCurrentUser: () => void
  myEpochs?: BetStatus[]
}

const initialState = {
  betosResources: [],
  totalRounds: [],
  parsedRounds: [],
  currentEpoch: 0,

  accountResources: [],
  fetchBetStatusOfCurrentUser: () => {},
}

const ContractContext = createContext<IContractContext>(initialState)

export default ContractContext
