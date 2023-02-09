import React from "react"
import styled from "styled-components"
import { BetStatus } from "../types"
import { Card as AntdCard } from "antd"
import { checkRoundClosed } from "../utils"
import { PRIMARY_TEXT_COLOR, SECONDARY_COLOR } from "../constants"
type Props = {
  myEpochs?: BetStatus[]
  currentEpoch: number
  getRoundByEpoch: any
}

const Wrapper = styled.div`
  width: 100%;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

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

const CardWrapper = styled(AntdCard)`
  div.row {
    display: flex;
    div:last-child {
      margin-left: 5px;
    }
  }
`

const MyBets: React.FC<Props> = ({
  myEpochs,
  currentEpoch,
  getRoundByEpoch,
}) => {
  return (
    <Wrapper className="my-bets">
      <h4> My bets</h4>
      <div className="details">
        {myEpochs?.map((myEpoch, index) => {
          const { amount, claimed, epoch, isBull } = myEpoch
          const isCurrentEpoch = epoch === Number(currentEpoch)
          const round = getRoundByEpoch(epoch)
          if (!round) return null
          const { resultStatus } = round
          const isClosedRound = checkRoundClosed(round)
          const isWin = (function () {
            if (resultStatus === "up") return isBull
            if (resultStatus === "down") return !isBull
            else return false
          })()
          const state =
            !isClosedRound || isCurrentEpoch
              ? "PENDING"
              : isWin
              ? "WIN"
              : "FAIL"
          return (
            <CardWrapper
              key={index}
              title={`#${epoch}`}
              extra={
                <div>
                  <div
                    style={{
                      color: isWin ? "green" : "red",
                    }}>
                    {state}
                  </div>
                  <div
                    style={{
                      color: claimed ? "green" : "red",
                    }}>
                    {claimed ? "CLAIMED" : "UN-CLAIMED"}
                  </div>
                </div>
              }
              style={{ width: 300 }}>
              <div className="row">
                <div className="first">Bet</div>
                <div>
                  <span
                    style={{
                      color: isBull ? PRIMARY_TEXT_COLOR : SECONDARY_COLOR,
                      margin: "0 2px",
                    }}>
                    {isBull ? "UP" : "DOWN"}
                  </span>
                  with
                  <span
                    style={{
                      color: PRIMARY_TEXT_COLOR,
                      margin: "0 2px",
                    }}>
                    {amount}
                  </span>
                  APT
                </div>
              </div>

              <div className="row">
                <div className="first">Round Closed With </div>
                <div
                  style={{
                    color:
                      resultStatus === "up"
                        ? PRIMARY_TEXT_COLOR
                        : SECONDARY_COLOR,
                  }}>
                  {resultStatus.toUpperCase()}
                </div>
              </div>
            </CardWrapper>
          )
        })}
      </div>
    </Wrapper>
  )
}
export default MyBets
