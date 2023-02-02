import { compact, map } from "lodash"

import { Price, PriceFeed } from "@pythnetwork/pyth-common-js"
import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js"
import React, { useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { Button, theme, Typography } from "antd"
import PartyImage from "../assets/party.png"
import { Types, AptosClient, getAddressFromAccountOrAddress } from "aptos"
import useAptosModule, { MODULE_NAME, BETOS_ADDRESS } from "../useAptosModule"
import Card from "./Card"
import dummyRounds, { genDummy } from "./dummyRounds"
import { aptToNumber, parseBetStatus } from "../utils"
import { BetStatus } from "../types"
import Compact from "antd/es/space/Compact"

const Wrapper = styled.div`
  div.my-bets {
    width: 100%;
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  div.details {
    margin: auto;
    width: 60%;
    margin-top: 50px;

    display: flex;
    flex-direction: row;
    justify-content: space-around;

    div.epoch-summary {
      display: flex;
      flex-direction: column;
      font-size: 20px;
    }
  }
`

const Descriptions = styled.section`
  margin-top: 100px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const ClaimButton = styled(Button)`
  margin-top: 30px;
  width: 162px;
  height: 40px;

  background: #000000;
  border: 1px solid #1c1f1d;
  border-radius: 1000px;
  background: #000000;

  img {
    margin-right: 5px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
`

const Board = styled.div`
  margin-top: 250px;
  display: flex;
  justify-content: center;
`

export type RawRound = {
  epoch: string
  bear_amount: string
  bull_amount: string
  close_price: string
  close_timestamp: string
  lock_price: string
  lock_timestamp: string
  start_timestamp: string
  total_amount: string
}

export type Round = {
  bearAmount: number
  bullAmount: number
  totalAmount: number
  closePrice: number
  closeTimestamp: Date
  lockTimestamp: Date
  startTimestamp: Date
  lockPrice: number
  epoch: number
  resultStatus: "bull" | "bear" | "none"
}
// expired: 결과까지 끝남
// live: bet은 끝났고 5분뒤에 결과 나옴, 오직1개
// next: 현재 bet 가능, 오직1개
// later: 아직 bet불가 (다음 라운드)
export type RoundState = "expired" | "live" | "next" | "later"
const parseRound = (rawRound: RawRound): Round => {
  const {
    bear_amount,
    bull_amount,
    close_price,
    close_timestamp,
    lock_price,
    lock_timestamp,
    epoch: _epoch,
    start_timestamp,
    total_amount,
  } = rawRound

  const bearAmount = aptToNumber(Number(bear_amount))
  const bullAmount = aptToNumber(Number(bull_amount))
  const totalAmount = aptToNumber(Number(total_amount))
  const closePrice = aptToNumber(Number(close_price))
  const closeTimestamp = new Date(close_timestamp)
  const lockTimestamp = new Date(lock_timestamp)
  const startTimestamp = new Date(start_timestamp)
  const lockPrice = aptToNumber(Number(lock_price))
  const epoch = Number(_epoch)

  const resultStatus: Round["resultStatus"] =
    closePrice > lockPrice ? "bull" : "bear"
  return {
    bearAmount,
    bullAmount,
    totalAmount,
    closePrice,
    closeTimestamp,
    lockTimestamp,
    startTimestamp,
    lockPrice,
    epoch,
    resultStatus,
  }
}

type Epoch = {
  amount: number
  claimed: boolean
  epoch: number
  isBull: boolean
}
const APT_USD_TESTNET_PRICE_ID =
  "44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e"
const TESTNET_PRICE_SERVICE = "https://xc-testnet.pyth.network"
const testnetConnection = new AptosPriceServiceConnection(TESTNET_PRICE_SERVICE)

const Home: React.FC = () => {
  const {
    token: { colorPrimaryText },
  } = theme.useToken()
  const [myEpochs, setMyEpochs] = useState<BetStatus[]>([])
  console.log("myEpochs", myEpochs)
  const { client, account, address, modules } = useAptosModule()
  const hasModule = modules.some((m) => m.abi?.name === MODULE_NAME)

  const [betosResources, setBetosResources] = React.useState<
    Types.MoveResource[]
  >([])
  console.log("betosResources", betosResources)

  // 연결된 지갑에 있는 리소스
  const [accountResources, setAccountResources] = React.useState<
    Types.MoveResource[]
  >([])

  const [betStatusOnCurrentRound, setBetStatusOnCurrentRound] =
    useState<BetStatus>()

  console.log("accountResources", accountResources)
  // console.log("betStatusOnCurrentRound", betStatusOnCurrentRound)

  const RESOURCE_KEY_BET = `${BETOS_ADDRESS}::${MODULE_NAME}::BetContainer`
  const handleOfBetContainer = useMemo(() => {
    const accountResource = accountResources.find(
      (r) => r?.type === RESOURCE_KEY_BET,
    )
    const data = accountResource?.data as
      | { bets: { handle: string }; epochs: number[] }
      | undefined

    return data?.bets?.handle
  }, [accountResources])

  const epochsOfBetContainer = useMemo(() => {
    const accountResource = accountResources.find(
      (r) => r?.type === RESOURCE_KEY_BET,
    )
    const data = accountResource?.data as
      | { bets: { handle: string }; epochs: string[] }
      | undefined

    return map(data?.epochs, (e) => Number(e))
  }, [accountResources])

  const RESOURCE_KEY_ROUND = `${BETOS_ADDRESS}::${MODULE_NAME}::RoundContainer`

  const betosResource = betosResources.find(
    (r) => r?.type === RESOURCE_KEY_ROUND,
  )
  const data = betosResource?.data as
    | { rounds: RawRound[]; current_epoch: string }
    | undefined
  const fetchedRounds = data?.rounds || []
  const currentEpoch = Number(data?.current_epoch) || 0
  const dummyRounds = genDummy()

  const USE_DUMMY = false
  const rounds = fetchedRounds
  console.log("rounds", rounds)

  const parsedRounds = rounds.map(parseRound)

  // TODO: key를 epoch로 하게 해서 개선하기, 이거대로면 매번 round 배열을 순회해야함
  const getRoundByEpoch = (epoch: number) => {
    return parsedRounds.find((r) => r.epoch === epoch)
  }

  const sliced = parsedRounds.slice(-4)

  // set dummy rounds
  const dummyRound: Round = {
    bearAmount: 0,
    bullAmount: 0,
    totalAmount: 0,
    closePrice: 0,
    closeTimestamp: new Date(),
    lockTimestamp: new Date(),
    startTimestamp: new Date(),
    lockPrice: 0,
    epoch: 100,
    resultStatus: "none",
  }
  const totalRounds = [...sliced, { ...dummyRound }]

  const [pythOffChainPrice, setPythOffChainPrice] = React.useState<
    Price | undefined
  >(undefined)

  // Subscribe to offchain prices. These are the prices that a typical frontend will want to show.
  testnetConnection.subscribePriceFeedUpdates(
    [APT_USD_TESTNET_PRICE_ID],
    (priceFeed: PriceFeed) => {
      const price = priceFeed.getPriceUnchecked() // Fine to use unchecked (not checking for staleness) because this must be a recent price given that it comes from a websocket subscription.
      setPythOffChainPrice(price)
    },
  )

  useEffect(() => {
    // round 정보 fetch
    const fetchBetosResources = async () => {
      const betosResources = await client.getAccountResources(BETOS_ADDRESS)
      setBetosResources(betosResources)
    }
    fetchBetosResources()
  }, [])

  useEffect(() => {
    console.log("address", address)
    if (!address) return

    // 연결된 account의 bet 정보 fetch
    const fetchAccountResources = async () => {
      const accountResources = await client.getAccountResources(address)
      console.log("accountResources fetched", accountResources)
      setAccountResources(accountResources)
    }

    fetchAccountResources()
  }, [address])

  const getTableItemRequest = (key: number) => {
    if (!key) return null
    return {
      key_type: `u64`,
      value_type: `${BETOS_ADDRESS}::${MODULE_NAME}::Bet`,
      key: String(key),
    }
  }

  const getBetStatus = async (
    handleOfBetContainer: any,
    tableItemRequest: any,
  ) => {
    if (!handleOfBetContainer) return
    if (!tableItemRequest) return
    const rawBetStatus = await client.getTableItem(
      handleOfBetContainer,
      tableItemRequest,
    )
    return rawBetStatus
  }

  // current round의 bet status fetch
  useEffect(() => {
    if (!handleOfBetContainer) return
    const fetch = async () => {
      const tableItemRequest = getTableItemRequest(currentEpoch)
      const rawBetStatus = await getBetStatus(
        handleOfBetContainer,
        tableItemRequest,
      )
      if (!rawBetStatus) return
      const parsed = parseBetStatus(rawBetStatus)
      setBetStatusOnCurrentRound(parsed)
    }
    fetch()
  }, [handleOfBetContainer])

  useEffect(() => {
    const fetch = async () => {
      console.log("epochsOfBetContainer", epochsOfBetContainer)
      if (!epochsOfBetContainer) return
      if (!handleOfBetContainer) return

      const promises = epochsOfBetContainer.map(async (epoch) => {
        const tableItemRequest = getTableItemRequest(epoch)
        const rawBetStatus = await getBetStatus(
          handleOfBetContainer,
          tableItemRequest,
        )
        if (!rawBetStatus) return
        const parsed = parseBetStatus(rawBetStatus)
        return parsed
      })
      const result = await Promise.all(promises)
      const compacted = compact(result)
      setMyEpochs(compacted)
    }
    fetch()
  }, [epochsOfBetContainer, handleOfBetContainer])

  const fetchBetStatus = async (epoch: number, handleOfBetContainer: any) => {
    if (!epoch) return
    if (!handleOfBetContainer) return
    const tableItemRequest = getTableItemRequest(epoch)
    const rawBetStatus = await getBetStatus(
      handleOfBetContainer,
      tableItemRequest,
    )
    if (!rawBetStatus) return
    const parsed = parseBetStatus(rawBetStatus)
    return parsed
  }

  const addRound = async (e: any) => {
    e.preventDefault()
    const funcName = `${BETOS_ADDRESS}::${MODULE_NAME}::add_round`
    const transaction = {
      type: "entry_function_payload",
      function: funcName,
      arguments: [],
      type_arguments: [],
    }
    console.log("transaction", transaction)

    await window.aptos.signAndSubmitTransaction(transaction)
  }

  // const handleBet = () => {
  //   const transaction = {
  //     type: "entry_function_payload",
  //     function: `${BETOS_ADDRESS}::${MODULE_NAME}::set_message`,
  //     arguments: [message],
  //     type_arguments: [],
  //   };
  //   console.log("transaction", transaction);

  //   await window.aptos.signAndSubmitTransaction(transaction);
  // }

  const handleClickClaim = async () => {
    const ok = window.confirm(`Claim all bets. Is it okay?`)
    if (!ok) return

    const transaction = {
      type: "entry_function_payload",
      function: `${BETOS_ADDRESS}::${MODULE_NAME}::claim_entry`,
      arguments: [],
      type_arguments: [],
    }
    console.log("transaction", transaction)

    const response = await window.aptos.signAndSubmitTransaction(transaction)
    console.log("response", response)
  }

  return (
    <Wrapper>
      <div>currentEpoch: {currentEpoch}</div>
      <Button onClick={addRound}>Add round</Button>
      <Descriptions>
        <h2>Your Total Prize</h2>
        <h4 style={{ color: colorPrimaryText }}>+0.00013 BNB</h4>
        <ClaimButton onClick={handleClickClaim}>
          <img src={PartyImage} width={20} />
          Claim
        </ClaimButton>
      </Descriptions>
      <div className="my-bets">
        <h4> My bets</h4>
        <div className="details">
          {myEpochs.map((myEpoch, index) => {
            const { amount, claimed, epoch, isBull } = myEpoch
            if (epoch === Number(currentEpoch)) return null
            const round = getRoundByEpoch(epoch)
            const resultStatus = round?.resultStatus
            const isWin = (function () {
              if (resultStatus === "bull") return isBull
              if (resultStatus === "bear") return !isBull
              else return false
            })()
            console.log("isWin", isWin)
            return (
              <div className="epoch-summary" key={`${index}+${epoch}`}>
                <div>Number: {epoch}</div>
                <div>Claimed: {claimed ? "true" : "false"}</div>
                <div>
                  You betted: {isBull ? "Up" : "Down"} with {amount} APT
                </div>
                <div>Round closed with: {resultStatus} </div>
                <div>State: {isWin ? "WIN" : "FAIL"}</div>
              </div>
            )
          })}
        </div>
      </div>
      <Board>
        {totalRounds.map((round: Round, index) => {
          const { epoch } = round
          const diff = Number(currentEpoch) - epoch

          const roundState: RoundState = (function () {
            if (diff > 1) return "expired"
            if (diff === 1) return "live"
            if (diff === 0) return "next"
            return "later"
          })()
          return (
            <Card
              key={index}
              round={round}
              roundState={roundState}
              betStatusOnCurrentRound={betStatusOnCurrentRound}
              currentPrice={pythOffChainPrice?.getPriceAsNumberUnchecked() || 0}
            />
          )
        })}
      </Board>
    </Wrapper>
  )
}

export default Home
