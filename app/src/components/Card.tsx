import styled from "styled-components"
import { Button, InputNumber, theme, Typography } from "antd"
import { gray } from "@ant-design/colors"
import { useEffect, useState } from "react"
import { Round, RoundState } from "./Home"
import { formatNumber } from "../utils"
import { BETOS_ADDRESS, MODULE_NAME } from "../useAptosModule"
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

    > div:first-child {
      color: ${(props) => props.mainColor};
      height: 100%;

      display: flex;
      align-items: center;
    }

    > div:last-child {
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
}

const Card: React.FC<CardProps> = ({ round, roundState }) => {
  const {
    token: { colorPrimaryText, colorTextSecondary, colorPrimary },
  } = theme.useToken()
  const [betMode, setBetMode] = useState<"up" | "down" | null>(null)
  const [betAmount, setBetAmount] = useState(0)
  useEffect(() => {
    setBetAmount(10)
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
    number,
  } = round

  const priceDiff = (function () {
    const isBullish = closePrice > lockPrice
    const abs = Math.abs(closePrice - lockPrice)
    const diff = formatNumber(abs)
    return {
      isBullish,
      diff,
    }
  })()

  const bullPayout = formatNumber(totalAmount / bullAmount)
  const bearPayout = formatNumber(totalAmount / bearAmount)

  const priceDiffDescription = priceDiff.isBullish
    ? `+${priceDiff.diff}`
    : `-${priceDiff.diff}`

  // 베팅이 끝난경우 UX가  동일
  const isFinished = ["expired", "live"].includes(roundState)
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

  const handleClickBet = async () => {
    const ok = window.confirm(`You betted ${betAmount}APT. Is it okay?`)
    if (!ok) return

    const transaction = {
      type: "entry_function_payload",
      function: `${BETOS_ADDRESS}::${MODULE_NAME}::bet`,
      arguments: [number, betAmount],
      type_arguments: [],
    }
    console.log("transaction", transaction)

    await window.aptos.signAndSubmitTransaction(transaction)
  }

  return (
    <CardWrapper mainColor={mainColor}>
      <Header mainColor={mainColor}>
        <span className="number">{`#${number}`}</span>
        <span className="status">{title}</span>
      </Header>
      <Contents mainColor={mainColor}>
        {isFinished && (
          <div>
            <div>Closed Price</div>
            <div className="summary">
              <div>{formatNumber(closePrice, 4)}</div>
              <div>{priceDiffDescription}</div>
            </div>
          </div>
        )}
        {isNext && (
          <div className="summary">
            {betMode !== null ? (
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
              step={5}
              value={betAmount}
              min={5}
              max={100}
              addonBefore="+"
              addonAfter="APT"
              defaultValue={10}
            />
          </div>
        ) : isLater ? (
          <div className="detail">
            <p>Next round will start</p>
            <p>~03:54</p>
          </div>
        ) : (
          <div className="detail">
            <div className="row">
              <span className="title">UP / Down Payout:</span>
              <span className="content">{`${bullPayout}x / ${bearPayout}x`}</span>
            </div>

            <div className="row">
              <span className="title">Locked Price:</span>
              <span className="content">$ 290.2768</span>
            </div>
            <div className="row">
              <span className="title">Prize Pool:</span>
              <span className="content">17.0423 BNB</span>
            </div>
          </div>
        )}
      </Contents>
    </CardWrapper>
  )
}

export default Card
