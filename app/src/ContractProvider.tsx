import ContractContext from "./ContractContext"
import { PropsWithChildren, useEffect, useMemo, useState } from "react"
import { Types } from "aptos"
import useAptosModule from "./useAptosModule"
import { betosAddress, MODULE_NAME, ROUND_STEP } from "./constants"
import { BetStatus, RawRound, Round } from "./types"
import { parseBetStatus, parseRound } from "./utils"
import { compact, map } from "lodash"

// fetch 하는 정보
// 1. BETOS_ADDRESS에서 betosResources
// 2. address 에서 accountResources

// 얻는 정보
// 1. accountResources -> handleOfBetContainer
// 2. accountResources -> epochsOfBetContainer

// 3. betosResources -> currentEpoch
// 4. betosResources -> fetchedRounds

// 5. betStatus(유저의 현재 epoch에 대한 베팅상태 - betStatusOnCurrentRound)
//             <-BETOS_ADDRESS, currentEpoch, handleOfBetContainer
// 6. myEpochs(유저의 전체 베팅기록) <- epochsOfBetContainer.map 을 돌면서 betStatus를 조회

const ContractProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const {
    client,
    address,
    modules,
    network,
    RESOURCE_KEY_ROUND,
    RESOURCE_KEY_BET,
  } = useAptosModule()
  const betosAddressByNetwork = betosAddress[network]

  // contract에 있는 리소스
  const [betosResources, setBetosResources] = useState<Types.MoveResource[]>([])

  // 연결된 지갑에 있는 리소스
  const [accountResources, setAccountResources] = useState<
    Types.MoveResource[]
  >([])

  const [betStatusOnCurrentRound, setBetStatusOnCurrentRound] =
    useState<BetStatus>()

  const [myEpochs, setMyEpochs] = useState<BetStatus[]>([])

  // round 정보 fetch
  const fetchBetosResources = () => {
    client
      .getAccountResources(betosAddressByNetwork)
      .then((res) => setBetosResources(res))
  }

  const fetchAccountResources = () => {
    if (!address) return
    client.getAccountResources(address).then((res) => setAccountResources(res))
  }

  useEffect(() => {
    fetchBetosResources()
  }, [modules])

  useEffect(() => {
    fetchAccountResources()
  }, [address])

  const roundResource = betosResources.find(
    (r) => r?.type === RESOURCE_KEY_ROUND,
  )
  const data = roundResource?.data as
    | { rounds: RawRound[]; current_epoch: string }
    | undefined
  const currentEpoch = Number(data?.current_epoch) || 0
  const fetchedRounds = data?.rounds || []
  const parsedRounds = fetchedRounds.map(parseRound)
  const sliced = parsedRounds.slice(-3)

  // TODO: key를 epoch로 하게 해서 개선하기, 이거대로면 매번 round 배열을 순회해야함
  const getRoundByEpoch = (epoch: number) =>
    parsedRounds.find((r) => r.epoch === epoch)
  const currentRound = useMemo(
    () => getRoundByEpoch(currentEpoch),
    [currentEpoch],
  )

  // 더미 라운드
  const laterRounds: Round[] = (function () {
    const nextRound: Round = {
      bearAmount: 0,
      bullAmount: 0,
      totalAmount: 0,
      closePrice: 0,
      closeTimestamp: (currentRound?.closeTimestamp || 0) + ROUND_STEP,
      lockTimestamp: (currentRound?.lockTimestamp || 0) + ROUND_STEP,
      startTimestamp: (currentRound?.startTimestamp || 0) + ROUND_STEP,
      lockPrice: 0,
      epoch: 10000,
      resultStatus: "none",
    }

    const theNextRound: Round = {
      bearAmount: 0,
      bullAmount: 0,
      totalAmount: 0,
      closePrice: 0,
      closeTimestamp: (currentRound?.closeTimestamp || 0) + ROUND_STEP * 2,
      lockTimestamp: (currentRound?.lockTimestamp || 0) + ROUND_STEP * 2,
      startTimestamp: (currentRound?.startTimestamp || 0) + ROUND_STEP * 2,
      lockPrice: 0,
      epoch: 10000,
      resultStatus: "none",
    }
    return [{ ...nextRound }]
  })()

  const totalRounds = [...sliced, ...laterRounds]

  const betResource = accountResources.find(
    (r) => r?.type === RESOURCE_KEY_BET,
  ) as undefined | { data: { bets: { handle: string }; epochs: string[] } }

  const handleOfBetContainer = betResource?.data?.bets?.handle

  const epochsOfBetContainer = useMemo(
    () => map(betResource?.data?.epochs, (e) => Number(e)),
    [accountResources],
  )

  const getTableItemRequest = (key: number) => {
    if (!key) return null
    return {
      key_type: `u64`,
      value_type: `${betosAddress[network]}::${MODULE_NAME}::Bet`,
      key: String(key),
    }
  }

  const fetchBetStatus = async (
    handleOfBetContainer: string,
    tableItemRequest: any,
  ) => await client.getTableItem(handleOfBetContainer, tableItemRequest)

  // current round의 bet status 를 fetch
  const fetchBetStatusOfCurrentUser = async () => {
    if (!handleOfBetContainer) return
    const tableItemRequest = getTableItemRequest(currentEpoch)
    const rawBetStatus = await fetchBetStatus(
      handleOfBetContainer,
      tableItemRequest,
    )
    if (!rawBetStatus) return
    setBetStatusOnCurrentRound(parseBetStatus(rawBetStatus))
  }

  useEffect(() => {
    fetchBetStatusOfCurrentUser()
  }, [handleOfBetContainer, currentEpoch])

  useEffect(() => {
    const fetch = async () => {
      if (!epochsOfBetContainer) return
      if (!handleOfBetContainer) return

      const promises = epochsOfBetContainer.map(async (epoch) => {
        const tableItemRequest = getTableItemRequest(epoch)
        const rawBetStatus = await fetchBetStatus(
          handleOfBetContainer,
          tableItemRequest,
        )
        if (!rawBetStatus) return
        const parsed = parseBetStatus(rawBetStatus)
        return parsed
      })
      const result = await Promise.all(promises)
      const compacted = compact(result)
      const sliced = compacted.slice(-5)
      setMyEpochs(sliced)
    }
    fetch()
  }, [epochsOfBetContainer, handleOfBetContainer])

  return (
    <ContractContext.Provider
      value={{
        betosResources: betosResources,
        parsedRounds: parsedRounds,
        totalRounds: totalRounds,
        currentRound: currentRound,
        currentEpoch: currentEpoch,

        accountResources: accountResources,
        betStatusOnCurrentRound: betStatusOnCurrentRound,
        myEpochs: myEpochs,
        fetchBetStatusOfCurrentUser,
      }}>
      {children}
    </ContractContext.Provider>
  )
}
export default ContractProvider
