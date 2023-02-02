import styled from "styled-components"
import { Button, InputNumber, theme, Typography } from "antd"
import { gray } from "@ant-design/colors"
import { useEffect, useState, useRef } from "react"
import { RoundState } from "./Home"

import { formatNumber, numberToApt } from "../utils"
import useAptosModule from "../useAptosModule"
import { BetStatus, Round } from "../types"
import { BETOS_ADDRESS, MODULE_NAME } from "../constants"

const SECONDARY_COLOR = "#F57272"
const PRIMARY_TEXT_COLOR = "#61c19b"

const CardWrapper = styled.div<{ mainColor: string }>`
  width: 302px;
  height: 216px;

  background: rgba(20, 22, 21, 0.8);
  border-radius: 15px;
  margin: 10px;
  border: 1px solid ${(props) => props.mainColor};
`
const Header = styled.div<{ mainColor: string }>`
  background: ${(props) => props.mainColor};
  border-radius: 14px 14px 0 0;

  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 10px;

  color: black;
  span.status {
    margin-left: 5px;
    font-weight: 700;
  }
`

const Contents = styled.div<{ mainColor: string }>`
  padding: 20px;
  div.summary {
    color: ${(props) => props.mainColor};
    font-size: 25px;
    display: flex;
    height: 35px;
    align-items: center;
    justify-content: space-between;

    > div.price {
      color: ${(props) => props.mainColor};
      height: 100%;

      display: flex;
      align-items: center;
    }

    > div.diff {
      height: 100%;
      width: 90px;
      background-color: ${(props) => props.mainColor};
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 700;
      color: black;
      font-size: 15px;
    }

    button {
      width: 40%;
      &.up {
        color: ${PRIMARY_TEXT_COLOR};
        &:hover {
          border-color: ${PRIMARY_TEXT_COLOR};
        }
      }
      &.down {
        color: ${SECONDARY_COLOR};
        &:hover {
          border-color: ${SECONDARY_COLOR};
        }
      }
    }
    .bet-state {
      font-size: 15px;
      color: white;
    }
  }
  div.detail {
    margin-top: 30px;
    > div:not(:first-child) {
      margin-top: 10px;
    }
    div.row {
      display: flex;
      justify-content: space-between;
    }
  }

  div.bet_input {
    h4 {
      font-size: 15px;
    }
    margin: 20px 20px;
  }
`

type CardProps = {
  round: Round
  roundState: RoundState
  betStatusOnCurrentRound?: BetStatus
  currentPrice?: number
}

function useInterval(callback: any, delay: any) {
  const savedCallback = useRef<any>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

const Counter = () => {
  const [count, setCount] = useState(0)

  useInterval(() => {
    // Your custom logic here
    setCount(count + 1)
  }, 1000)

  return <h1>{count}</h1>
}

const Card: React.FC<CardProps> = ({
  round,
  roundState,
  betStatusOnCurrentRound,
  currentPrice,
}) => {
  const {
    token: { colorPrimaryText, colorTextSecondary, colorPrimary },
  } = theme.useToken()
  const { client, account, address, modules } = useAptosModule()
  const [betMode, setBetMode] = useState<"up" | "down" | null>(null)
  const [betAmount, setBetAmount] = useState(0)
  const DEFUALT_BET_AMOUNT = 0.02

  useEffect(() => {
    setBetAmount(DEFUALT_BET_AMOUNT)
  }, [betMode])

  const {
    bearAmount,
    bullAmount,
    totalAmount,
    closePrice,
    closeTimestamp,
    lockTimestamp,
    startTimestamp,
    lockPrice,
    epoch,
  } = round
  const { amount, claimed, isBull } = betStatusOnCurrentRound || {}

  const priceDiff = (function () {
    const isBullish = closePrice > lockPrice
    const abs = Math.abs(closePrice - lockPrice)
    const diff = formatNumber(abs, 5)
    return {
      isBullish,
      diff,
    }
  })()

  const getPayout = (totalAmount: number, amount: number) => {
    if (totalAmount === 0) return 0
    if (amount === 0) return 0
    return formatNumber(totalAmount / amount)
  }

  const bullPayout = getPayout(totalAmount, bullAmount)
  const bearPayout = getPayout(totalAmount, bearAmount)

  const priceDiffDescription = priceDiff.isBullish
    ? `+${priceDiff.diff}`
    : `-${priceDiff.diff}`

  // 베팅이 끝난경우 UX가  동일
  const isFinished = ["expired", "live"].includes(roundState)

  const isExpired = roundState === "expired"
  const isLive = roundState === "live"
  const isNext = roundState === "next" // 베팅가능
  const isLater = roundState === "later"

  const isBullish = (function () {
    if (roundState === "expired" || roundState === "next") {
      return closePrice > lockPrice
    }
    if (roundState === "live") {
      // TODO: 수정
      // lockPrice 보다 현재 가격이 높으면 true
      return true
    }
    return false
  })()

  const mainColor = (function () {
    if (roundState === "later") {
      return gray[1]
    }
    if (isBullish) {
      return colorPrimaryText
    }
    return SECONDARY_COLOR
  })()

  const title = (function () {
    if (roundState === "expired") {
      return "Expired"
    }
    if (roundState === "live") {
      return "Live"
    }
    if (roundState === "next") {
      return "Next"
    }
    return "Later"
  })()

  // 베팅!
  const handleClickBet = async () => {
    const ok = window.confirm(
      `You betted ${betAmount}APT on ${betMode?.toLocaleUpperCase()}. Is it okay?`,
    )
    if (!ok) return

    const isBull = betMode === "up"

    const aptAmount = numberToApt(betAmount)

    const transaction = {
      type: "entry_function_payload",
      function: `${BETOS_ADDRESS}::${MODULE_NAME}::bet`,
      arguments: [String(epoch), String(aptAmount), String(isBull)],
      type_arguments: [],
    }
    console.log("transaction", transaction)

    try {
      const response = await window.aptos.signAndSubmitTransaction(transaction)
      console.log("response", response)
    } catch (e: any) {
      console.log("!!!!!!!!!!!!!!!!erorr in bet!!!!!!!!!!!!!!!!!!")
      console.log("e", e)
    }
  }

  return (
    <CardWrapper mainColor={mainColor}>
      <Header mainColor={mainColor}>
        <span className="number">{`#${epoch}`}</span>
        <span className="status">{title}</span>
      </Header>
      <Contents mainColor={mainColor}>
        {isLive && (
          <div>
            <div>Current Price</div>
            <div className="summary">
              <div className="price">
                {currentPrice
                  ? `$${formatNumber(currentPrice, 4)}`
                  : "Loading..."}
                <Counter />
              </div>
            </div>
          </div>
        )}
        {isExpired && (
          <div>
            <div>Closed Price</div>
            <div className="summary">
              <div className="price">${formatNumber(closePrice, 4)}</div>
              <div className="diff">${priceDiffDescription}</div>
            </div>
          </div>
        )}
        {isNext && (
          <div className="summary">
            {betStatusOnCurrentRound ? (
              <div className="bet-state">
                <div>You betted on this stage</div>
                <div
                  style={{
                    color: isBull ? colorPrimaryText : SECONDARY_COLOR,
                  }}>
                  <span>
                    <span>{amount}</span>APT
                  </span>
                  <span> on {isBull ? "Up" : "Down"}</span>
                </div>
                <div>
                  <span>{claimed ? "claimed" : "un-claimed"}</span>
                </div>
              </div>
            ) : betMode !== null ? (
              <>
                <Button
                  onClick={() => {
                    handleClickBet()
                  }}>
                  Confirm
                </Button>
                <Button
                  onClick={() => {
                    setBetMode(null)
                  }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="up"
                  onClick={() => {
                    setBetMode("up")
                  }}>
                  Up
                </Button>
                <Button
                  className="down"
                  onClick={() => {
                    setBetMode("down")
                  }}>
                  Down
                </Button>
              </>
            )}
          </div>
        )}
        {betMode !== null ? (
          <div className="bet_input">
            <h4>Bet to {betMode}</h4>
            <InputNumber
              onChange={(value) => {
                value && setBetAmount(value)
              }}
              step={1}
              value={betAmount}
              min={0.001}
              max={100}
              addonBefore="+"
              addonAfter="APT"
              defaultValue={DEFUALT_BET_AMOUNT}
            />
          </div>
        ) : isLater ? (
          <div className="detail">
            <p>Next round will start</p>
            <p>~03:54</p>
          </div>
        ) : isNext ? (
          <div className="detail">
            <div className="row">
              <span className="title">UP / Down Payout:</span>
              <span className="content">{`${bullPayout}x / ${bearPayout}x`}</span>
            </div>
            <div className="row">
              <span className="title">Prize Pool:</span>
              <span className="content">{totalAmount}APT</span>
            </div>
          </div>
        ) : (
          <div className="detail">
            <div className="row">
              <span className="title">UP / Down Payout:</span>
              <span className="content">{`${bullPayout}x / ${bearPayout}x`}</span>
            </div>

            <div className="row">
              <span className="title">Locked Price:</span>
              <span className="content">${lockPrice}</span>
            </div>
            <div className="row">
              <span className="title">Prize Pool:</span>
              <span className="content">{totalAmount}APT</span>
            </div>
          </div>
        )}
      </Contents>
    </CardWrapper>
  )
}

export default Card
