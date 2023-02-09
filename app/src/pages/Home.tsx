import React, { useEffect, useMemo, useState } from "react"
import Home from "../components/Home"
import { Types } from "aptos"
import useAptosModule from "../useAptosModule"
import { BETOS_ADDRESS, MODULE_NAME, ROUND_STEP } from "../constants"
import { BetStatus, RawRound, Round } from "../types"
import { parseBetStatus, parseRound } from "../utils"
import { compact, map } from "lodash"
import usePyth from "../usePyth"

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

const RESOURCE_KEY_BET = `${BETOS_ADDRESS}::${MODULE_NAME}::BetContainer`
const RESOURCE_KEY_ROUND = `${BETOS_ADDRESS}::${MODULE_NAME}::RoundContainer`

const HomeComponent: React.FC = () => {
  const { client, address, modules } = useAptosModule()
  const { pythOffChainPrice } = usePyth()
  const currentAptosPrice = pythOffChainPrice?.getPriceAsNumberUnchecked() || 0

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
      .getAccountResources(BETOS_ADDRESS)
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

  const handleOfBetContainer = useMemo(
    () => betResource?.data?.bets?.handle,
    [accountResources],
  )

  const epochsOfBetContainer = useMemo(
    () => map(betResource?.data?.epochs, (e) => Number(e)),
    [accountResources],
  )

  const getTableItemRequest = (key: number) => {
    if (!key) return null
    return {
      key_type: `u64`,
      value_type: `${BETOS_ADDRESS}::${MODULE_NAME}::Bet`,
      key: String(key),
    }
  }

  const fetchBetStatus = async (
    handleOfBetContainer: string,
    tableItemRequest: any,
  ) => await client.getTableItem(handleOfBetContainer, tableItemRequest)

  // current round의 bet status 를 fetch
  useEffect(() => {
    if (!handleOfBetContainer) return
    const fetch = async () => {
      const tableItemRequest = getTableItemRequest(currentEpoch)
      const rawBetStatus = await fetchBetStatus(
        handleOfBetContainer,
        tableItemRequest,
      )
      if (!rawBetStatus) return
      setBetStatusOnCurrentRound(parseBetStatus(rawBetStatus))
    }
    fetch()
  }, [handleOfBetContainer])

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
    <Home
      totalRounds={totalRounds}
      betosResources={betosResources}
      accountResources={accountResources}
      getRoundByEpoch={getRoundByEpoch}
      currentRound={currentRound}
      currentEpoch={currentEpoch}
      betStatusOnCurrentRound={betStatusOnCurrentRound}
      myEpochs={myEpochs}
      address={address}
      currentAptosPrice={currentAptosPrice}
    />
  )
}

export default HomeComponent
