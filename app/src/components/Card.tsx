import styled from "styled-components"
import { Button, InputNumber, theme } from "antd"
import { gray } from "@ant-design/colors"
import { useEffect, useState, useRef } from "react"
import { RoundState } from "./Home"

import { formatNumber, numberToApt } from "../utils"
import useAptosModule from "../useAptosModule"
import { BetStatus, Round } from "../types"
import {
  BETOS_ADDRESS,
  MODULE_NAME,
  PRIMARY_TEXT_COLOR,
  ROUND_STEP,
  SECONDARY_COLOR,
} from "../constants"
import MinusTimer from "./MinusTimer"
import PlusTimer from "./PlusTimer"

const CardWrapper = styled.div<{
  mainColor: string
  isNext?: boolean
  isDisabled?: boolean
}>`
  width: 320px;
  height: 240px;

  background: rgba(20, 22, 21, 0.8);
  border-radius: 15px;
  margin: 10px;
  border: 1px solid ${(props) => props.mainColor};
  ${(props) =>
    props.isNext &&
    `
    box-shadow: 0 0px 30px white;
  transform: translateY(0);`}
  ${(props) =>
    props.isDisabled &&
    `
    pointer-events: none;

`}
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    color: ${(props) => props.mainColor};
    > div {
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

    &.next {
      display: block;
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
      div.diff {
        color: ${(props) => props.mainColor};
        justify-self: flex-end;
      }
    }

    div.timer {
      font-size: 20px;
    }
    &.expired {
      margin-top: 0;
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
  currentAptosPrice?: number
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

// const MinusTimer = ({ round }: { round: Round }) => {
//   const [count, setCount] = useState(0)
//   const {
//     bearAmount,
//     bullAmount,
//     closePrice,
//     closeTimestamp,
//     lockPrice,
//     lockTimestamp,
//     resultStatus,
//     startTimestamp,
//     totalAmount,
//   } = round

//   useInterval(() => {
//     // Your custom logic here
//     setCount(count + 1)
//   }, 1000)

//   return <h1>{count}</h1>
// }

const Card: React.FC<CardProps> = ({
  round,
  roundState,
  betStatusOnCurrentRound,
  currentAptosPrice = 0,
}) => {
  const [isDisabled, setIsDisabled] = useState(false)
  const setDisabled = () => setIsDisabled(true)
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
  const isExpired = roundState === "expired"
  const isLive = roundState === "live"
  const isNext = roundState === "next" // 베팅가능
  const isLater = roundState === "later"

  const priceDiff = (function () {
    const base = isLive ? currentAptosPrice : closePrice
    const isBullish = base > lockPrice
    const abs = Math.abs(base - lockPrice)
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

  const isBullish = (function () {
    if (roundState === "expired" || roundState === "next") {
      return closePrice > lockPrice
    }
    if (roundState === "live") {
      return currentAptosPrice > lockPrice
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

  // milliseconds
  const currentTimestamp = Math.floor(Date.now())

  return (
    <CardWrapper mainColor={mainColor} isNext={isNext} isDisabled={isDisabled}>
      <Header mainColor={mainColor}>
        <span className="number">{`#${epoch}`}</span>
        <span className="status">{title}</span>
        {isLive && (
          <PlusTimer
            style={{
              width: "100%",
              marginLeft: "5px",
            }}
            setDisabled={setDisabled}
            start={round.closeTimestamp - currentTimestamp}
            end={ROUND_STEP}
            showProgress
          />
        )}
      </Header>
      <Contents mainColor={mainColor}>
        {isLive && (
          <div>
            <div>Current Price</div>
            <div className="summary">
              <div className="price">
                {currentAptosPrice
                  ? `$${formatNumber(currentAptosPrice, 4)}`
                  : "Loading..."}
              </div>
            </div>
          </div>
        )}
        {isExpired && (
          <div>
            <div>Closed Price</div>
            <div className="summary">
              <div className="price">${formatNumber(closePrice, 4)}</div>
            </div>
          </div>
        )}
        {isNext && (
          <div className="summary next">
            <div>
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
            <MinusTimer start={round.lockTimestamp - currentTimestamp} />
          </div>
        )}

        {betMode !== null ? (
          <div className="bet_input">
            <h4>Bet to {betMode}</h4>
            <InputNumber
              onChange={(value) => {
                value && setBetAmount(value)
              }}
              step={0.01}
              value={betAmount}
              min={0.001}
              max={100}
              addonBefore="+"
              addonAfter="APT"
              defaultValue={DEFUALT_BET_AMOUNT}
            />
          </div>
        ) : isLater ? (
          <div className="detail later">
            <p>Next round will start</p>
            <MinusTimer start={round.startTimestamp - currentTimestamp} />
          </div>
        ) : isNext ? (
          <div className="detail next">
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
          <div className="detail expired live">
            <div className="row">
              <span className="title">UP / Down Payout:</span>
              <span className="content">{`${bullPayout}x / ${bearPayout}x`}</span>
            </div>

            <div className="row">
              <span className="title">Locked Price:</span>
              <span className="content">${lockPrice}</span>
            </div>

            <div className="row">
              <div></div>
              <div className="diff">${priceDiffDescription}</div>
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
