import React, { useState } from "react"
import styled from "styled-components"
import { Alert, Button, Space, Spin, Tag } from "antd"
import PartyImage from "../assets/party.png"
import { Types } from "aptos"
import Card from "./Card"
import { checkRoundClosed, formatNumber } from "../utils"
import { BetStatus, Round } from "../types"
import { betosAddress, MODULE_NAME, PRIMARY_TEXT_COLOR } from "../constants"
import MyBets from "./MyBets"
import useAptosModule from "../useAptosModule"
import MinusTimer from "./MinusTimer"

const Wrapper = styled.div``

const Descriptions = styled.section`
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
  margin-top: 100px;
  margin-bottom: 200px;
  display: flex;
  justify-content: center;
`

const NextCardWrapper = styled.div`
  position: relative;
  .timer-wrapper {
    font-size: 22px;
    position: absolute;
    left: 20px;
    top: -20px;
  }
`

// expired: 결과까지 끝남
// live: bet은 끝났고 5분뒤에 결과 나옴, 오직1개
// next: 현재 bet 가능, 오직1개
// later: 아직 bet불가 (다음 라운드)
export type RoundState = "expired" | "live" | "next" | "later"

type Props = {
  betosResources: Types.MoveResource[]
  accountResources: Types.MoveResource[]
  getRoundByEpoch: any
  currentRound?: Round
  parsedRounds: Round[]
  totalRounds: Round[]
  currentEpoch: number
  betStatusOnCurrentRound?: BetStatus
  myEpochs?: BetStatus[]
  currentAptosPrice: number
}

const Home: React.FC<Props> = ({
  getRoundByEpoch,
  parsedRounds,
  totalRounds,
  currentEpoch,
  betStatusOnCurrentRound,
  myEpochs,
  currentAptosPrice,
}) => {
  const { address, network } = useAptosModule()
  const [showDevInfo, setShowDevInfo] = useState(false)

  const claimableAmounts = (function () {
    if (!myEpochs || parsedRounds.length === 0) {
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
        if (resultStatus === "up") return isBull
        if (resultStatus === "down") return !isBull
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

  const handleClickClaim = async () => {
    const ok = window.confirm(`Claim all bets. Is it okay?`)
    if (!ok) return

    const transaction = {
      type: "entry_function_payload",
      function: `${betosAddress[network]}::${MODULE_NAME}::claim_entry`,
      arguments: [],
      type_arguments: [],
    }

    await window.aptos.signAndSubmitTransaction(transaction)
  }

  const currentTimestamp = Math.floor(Date.now())

  return (
    <Wrapper>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: "20px",
        }}>
        <Button onClick={() => setShowDevInfo((s) => !s)}>Show dev info</Button>
        <Tag color={network === "Mainnet" ? "volcano" : "green"}>{network}</Tag>
      </div>
      {showDevInfo && (
        <div>
          <div>My address: {address}</div>
          <div>Bettos address: {betosAddress[network]}</div>
          <div>currentEpoch: {currentEpoch}</div>
        </div>
      )}
      <Descriptions>
        <h2>Your Total Prize</h2>
        <h4 style={{ color: PRIMARY_TEXT_COLOR }}>+ {claimableAmounts} APTs</h4>
        <ClaimButton disabled={!claimableAmounts} onClick={handleClickClaim}>
          <img src={PartyImage} width={20} />
          Claim
        </ClaimButton>
      </Descriptions>

      {totalRounds.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "300px",
          }}>
          <Spin size="large" tip="Loading..."></Spin>
        </div>
      ) : (
        <>
          <MyBets
            myEpochs={myEpochs}
            currentEpoch={currentEpoch}
            getRoundByEpoch={getRoundByEpoch}
          />

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
                    currentAptosPrice={currentAptosPrice}
                  />
                )
              } else if (roundState === "next") {
                return (
                  <NextCardWrapper key={index}>
                    <div className="timer-wrapper">
                      <MinusTimer
                        start={round.lockTimestamp - currentTimestamp}
                      />
                    </div>
                    <Card
                      round={round}
                      roundState={roundState}
                      betStatusOnCurrentRound={betStatusOnCurrentRound}
                    />
                  </NextCardWrapper>
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
        </>
      )}
    </Wrapper>
  )
}

export default Home

// const addRound = async (e: any) => {
//   e.preventDefault()
//   const funcName = `${BETOS_ADDRESS}::${MODULE_NAME}::add_round`
//   const transaction = {
//     type: "entry_function_payload",
//     function: funcName,
//     arguments: [],
//     type_arguments: [],
//   }

//   await window.aptos.signAndSubmitTransaction(transaction)
// }
