import { compact, map } from "lodash"

import { Price, PriceFeed } from "@pythnetwork/pyth-common-js"
import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js"
import React, { useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { Button, theme } from "antd"
import PartyImage from "../assets/party.png"
import { Types, AptosClient, getAddressFromAccountOrAddress } from "aptos"
import useAptosModule from "../useAptosModule"
import Card from "./Card"
import dummyRounds, { genDummy } from "./dummyRounds"
import dummyRounds2 from "./dummyRounds2"
import { aptToNumber, formatNumber, parseBetStatus, parseRound } from "../utils"
import { BetStatus, RawRound, Round } from "../types"
import {
  APT_USD_TESTNET_PRICE_ID,
  BETOS_ADDRESS,
  MODULE_NAME,
  TESTNET_PRICE_SERVICE,
} from "../constants"
import { forEachChild } from "typescript"

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

// expired: 결과까지 끝남
// live: bet은 끝났고 5분뒤에 결과 나옴, 오직1개
// next: 현재 bet 가능, 오직1개
// later: 아직 bet불가 (다음 라운드)
export type RoundState = "expired" | "live" | "next" | "later"

const testnetConnection = new AptosPriceServiceConnection(TESTNET_PRICE_SERVICE)

const RESOURCE_KEY_BET = `${BETOS_ADDRESS}::${MODULE_NAME}::BetContainer`
const RESOURCE_KEY_ROUND = `${BETOS_ADDRESS}::${MODULE_NAME}::RoundContainer`

const Home: React.FC = () => {
  const {
    token: { colorPrimaryText },
  } = theme.useToken()
  const [myEpochs, setMyEpochs] = useState<BetStatus[]>([])
  const { client, account, address } = useAptosModule()

  const [betosResources, setBetosResources] = React.useState<
    Types.MoveResource[]
  >([])

  // 연결된 지갑에 있는 리소스
  const [accountResources, setAccountResources] = React.useState<
    Types.MoveResource[]
  >([])

  const [betStatusOnCurrentRound, setBetStatusOnCurrentRound] =
    useState<BetStatus>()

  // console.log("myEpochs", myEpochs)
  // console.log("betosResources", betosResources)
  // console.log("accountResources", accountResources)
  // console.log("betStatusOnCurrentRound", betStatusOnCurrentRound)

  // console.log("accountResources", accountResources)
  const handleOfBetContainer = useMemo(() => {
    const accountResource = accountResources.find(
      (r) => r?.type === RESOURCE_KEY_BET,
    )
    const data = accountResource?.data as
      | { bets: { handle: string }; epochs: number[] }
      | undefined

    return data?.bets?.handle
  }, [accountResources])
  console.log("handleOfBetContainer", handleOfBetContainer)
  console.log("betosResources", betosResources)

  const epochsOfBetContainer = useMemo(() => {
    const accountResource = accountResources.find(
      (r) => r?.type === RESOURCE_KEY_BET,
    )
    const data = accountResource?.data as
      | { bets: { handle: string }; epochs: string[] }
      | undefined

    return map(data?.epochs, (e) => Number(e))
  }, [accountResources])

  console.log("RESOURCE_KEY_ROUND", RESOURCE_KEY_ROUND)
  const betosResource = betosResources.find(
    (r) => r?.type === RESOURCE_KEY_ROUND,
  )
  console.log("betosResource", betosResource)
  const data = betosResource?.data as
    | { rounds: RawRound[]; current_epoch: string }
    | undefined
  console.log("data", data)
  const fetchedRounds = data?.rounds || []
  const currentEpoch = Number(data?.current_epoch) || 0

  const USE_DUMMY = false
  const dummyRounds = genDummy()
  const rounds = USE_DUMMY ? dummyRounds2 : fetchedRounds
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
    if (!address) return

    // 연결된 account의 bet 정보 fetch
    const fetchAccountResources = async () => {
      const accountResources = await client.getAccountResources(address)
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

    await window.aptos.signAndSubmitTransaction(transaction)
  }

  const handleClickClaim = async () => {
    const ok = window.confirm(`Claim all bets. Is it okay?`)
    if (!ok) return

    const transaction = {
      type: "entry_function_payload",
      function: `${BETOS_ADDRESS}::${MODULE_NAME}::claim_entry`,
      arguments: [],
      type_arguments: [],
    }

    const response = await window.aptos.signAndSubmitTransaction(transaction)
  }

  const checkRoundClosed = (round: Round) => !!round.closePrice

  const claimableAmounts = (function () {
    if (!myEpochs) {
      return 0
    }

    const sum = myEpochs.reduce((acc, myEpoch) => {
      const { amount, claimed, epoch, isBull } = myEpoch
      if (epoch === Number(currentEpoch)) return acc
      const round = getRoundByEpoch(epoch)
      if (!round) {
        console.warn("No round founded, epoch num: ", epoch)
        return acc
      }
      const { resultStatus, totalAmount, bullAmount, bearAmount } = round

      const isClosedRound = checkRoundClosed(round)
      // round not closed
      if (!isClosedRound || claimed) {
        return acc
      }

      const isWin = (function () {
        if (resultStatus === "bull") return isBull
        if (resultStatus === "bear") return !isBull
        else return false
      })()

      const reward = (function () {
        if (!isWin) return 0
        const payout = totalAmount / (isBull ? bullAmount : bearAmount)
        return payout * amount
      })()

      return isWin ? acc + reward : acc
    }, 0)
    return formatNumber(sum, 10)
  })()
  return (
    <Wrapper>
      <div>My address: {address}</div>
      <div>Bettos address: {BETOS_ADDRESS}</div>
      <div>currentEpoch: {currentEpoch}</div>
      <Button onClick={addRound}>Add round</Button>
      <Descriptions>
        <h2>Your Total Prize</h2>
        <h4 style={{ color: colorPrimaryText }}>+ {claimableAmounts} APTs</h4>
        <ClaimButton disabled={!claimableAmounts} onClick={handleClickClaim}>
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
            if (!round) return null
            const { resultStatus } = round
            const isClosedRound = checkRoundClosed(round)
            const isWin = (function () {
              if (resultStatus === "bull") return isBull
              if (resultStatus === "bear") return !isBull
              else return false
            })()
            const state = !isClosedRound ? "PENDING" : isWin ? "WIN" : "FAIL"
            return (
              <div className="epoch-summary" key={`${index}+${epoch}`}>
                <div>#{epoch}</div>
                <div>Claimed: {claimed ? "true" : "false"}</div>
                <div>
                  Bet on: {isBull ? "Up" : "Down"} with {amount} APT
                </div>
                {isClosedRound && <div>Round closed with: {resultStatus} </div>}
                <div>isWin?: {state}</div>
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
          if (roundState === "live") {
            return (
              <Card
                key={index}
                round={round}
                roundState={roundState}
                betStatusOnCurrentRound={betStatusOnCurrentRound}
                currentPrice={
                  pythOffChainPrice?.getPriceAsNumberUnchecked() || 0
                }
              />
            )
          }
          return (
            <Card
              key={index}
              round={round}
              roundState={roundState}
              betStatusOnCurrentRound={betStatusOnCurrentRound}
            />
          )
        })}
      </Board>
    </Wrapper>
  )
}

export default Home
