import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Button, theme, Typography } from "antd"
import PartyImage from "../assets/party.png"
import { Types, AptosClient, getAddressFromAccountOrAddress } from "aptos"
import useAptosModule, { MODULE_NAME, BETOS_ADDRESS } from "../useAptosModule"
import Card from "./Card"
import dummyRounds, { genDummy } from "./dummyRounds"

const Wrapper = styled.div``

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
  number: string
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
  number: number
}
// expired: 결과까지 끝남
// live: bet은 끝났고 5분뒤에 결과 나옴, 오직1개
// next: 현재 bet 가능, 오직1개
// later: 아직 bet불가 (다음 라운드)
export type RoundState = "expired" | "live" | "next" | "later"
const parseRound = (rawRound: RawRound) => {
  const {
    bear_amount,
    bull_amount,
    close_price,
    close_timestamp,
    lock_price,
    lock_timestamp,
    number: _number,
    start_timestamp,
    total_amount,
  } = rawRound

  const bearAmount = Number(bear_amount)
  const bullAmount = Number(bull_amount)
  const totalAmount = Number(total_amount)
  const closePrice = Number(close_price)
  const closeTimestamp = new Date(close_timestamp)
  const lockTimestamp = new Date(lock_timestamp)
  const startTimestamp = new Date(start_timestamp)
  const lockPrice = Number(lock_price)
  const number = Number(_number)

  return {
    bearAmount,
    bullAmount,
    totalAmount,
    closePrice,
    closeTimestamp,
    lockTimestamp,
    startTimestamp,
    lockPrice,
    number,
  }
}

const Home: React.FC = () => {
  const {
    token: { colorPrimaryText },
  } = theme.useToken()
  const { Title } = Typography
  const { client, account, address, modules } = useAptosModule()
  const hasModule = modules.some((m) => m.abi?.name === MODULE_NAME)
  const [resources, setResources] = React.useState<Types.MoveResource[]>([])
  console.log("resources", resources)

  const resourceType = `${BETOS_ADDRESS}::${MODULE_NAME}::RoundContainer`
  const resource = resources.find((r) => r?.type === resourceType)
  const data = resource?.data as { rounds: any[] } | undefined
  const fetchedRounds = data?.rounds
  console.log("fetchedRounds", fetchedRounds)
  // const rounds: RawRound[] = dummyRounds
  const rounds = genDummy()
  const sliced = rounds.slice(-5)
  const parsed = sliced.map(parseRound)
  console.log("parsed", parsed)
  // 가장 최근 6개를 읽어온다.

  useEffect(() => {
    const fetch = async () => {
      const resources = await client.getAccountResources(BETOS_ADDRESS)
      setResources(resources)
    }
    fetch()
  }, [])

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

  return (
    <Wrapper>
      <Button onClick={addRound}>Add round</Button>
      <Descriptions>
        <h2>Your Total Prize</h2>
        <h4 style={{ color: colorPrimaryText }}>+0.00013 BNB</h4>
        <ClaimButton>
          <img src={PartyImage} width={20} />
          Claim
        </ClaimButton>
      </Descriptions>
      <Board>
        {parsed.map((round, index) => {
          const roundState: RoundState = (function () {
            if (index < 2) return "expired"
            if (index === 2) return "live"
            if (index === 3) return "next"
            return "later"
          })()
          return <Card key={index} round={round} roundState={roundState} />
        })}
      </Board>
    </Wrapper>
  )
}

export default Home
