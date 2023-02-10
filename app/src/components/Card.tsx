import styled from "styled-components"
import { Button, Typography, InputNumber, theme } from "antd"
import { gray } from "@ant-design/colors"
import { useEffect, useState, useRef } from "react"
import { RoundState } from "./Home"
import Clock from "../assets/clock.png"
import Ban from "../assets/ban.png"
import Play from "../assets/play.png"
import ArrowUp from "../assets/arrow-up.png"
import ArrowUpSVG from "../assets/arrow-up.svg"
import ArrowDown from "../assets/arrow-down.png"
import ArrowUpBlack from "../assets/arrow-up-black.png"
import ArrowDownBlack from "../assets/arrow-down-black.png"
import SmallArrowUp from "../assets/small-arrow-up.png"
import SmallArrowDown from "../assets/small-arrow-down.png"
import LeftArrow from "../assets/left.png"

import { formatNumber, numberToApt } from "../utils"
import useAptosModule from "../useAptosModule"
import { BetStatus, Round } from "../types"
import {
  betosAddress,
  MODULE_NAME,
  PRIMARY_TEXT_COLOR,
  ROUND_STEP,
  SECONDARY_COLOR,
} from "../constants"
import MinusTimer from "./MinusTimer"
import PlusTimer from "./PlusTimer"

const { Text } = Typography

const CardWrapper = styled.div<{
  isNext?: boolean
  isDisabled?: boolean
}>`
  position: relative;
  width: 323px;
  height: 396px;

  background: rgba(20, 22, 21, 0.8);
  border-radius: 15px;
  margin: 10px;
  border: 1px solid #383a38;
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
const Header = styled.div`
  color: white;
  border-radius: 14px 14px 0 0;

  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  justify-content: space-between;
  padding-right: 20px;

  div {
    display: flex;
    align-items: center;
  }

  span.status {
    margin-left: 5px;
    font-weight: 700;
  }
  button.left {
    cursor: pointer;
    background-color: transparent;
    margin-right: 10px;
  }
  .position {
    display: flex;
    justify-content: center;
    width: 80px;
    padding: 5px;
    border-radius: 10px;
    &.up {
      background: ${PRIMARY_TEXT_COLOR};
    }
    &.down {
      background: ${SECONDARY_COLOR};
    }
    img {
      width: 13px;
      margin-right: 3px;
    }
  }
`

const Contents = styled.div<{ mainColor: string }>`
  padding: 20px;
  div.summary {
    margin-top: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    // div.price {
    //   color: ${(props) => props.mainColor};
    //   height: 100%;

    //   display: flex;
    //   align-items: center;
    // }

    color: ${(props) => props.mainColor};
    > div {
      font-size: 25px;
      display: flex;
      height: 35px;
      align-items: center;
      justify-content: space-between;

      .bet-state {
        font-size: 15px;
        color: white;
      }
    }
  }

  div.bet_input {
    h4 {
      font-size: 15px;
    }
    margin: 20px 20px;
  }

  // TODO: fix this height
  height: 90%;

  .next {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 0;
    .buttons {
      margin: 0 auto;
      width: 80%;

      display: flex;
      justify-content: space-between;
      button {
        border-radius: 10px;
        height: 40px;
        width: 90px;
        cursor: pointer;
        font-size: 12px;
        background: transparent;
        border: 1px solid white;
        color: white;
        &.confirm {
          &:hover {
            border-color: ${PRIMARY_TEXT_COLOR};
            color: ${PRIMARY_TEXT_COLOR};
          }
        }
        &.cancel {
          &:hover {
            border-color: ${SECONDARY_COLOR};
            color: ${SECONDARY_COLOR};
          }
        }
      }
    }
  }
`

const ArrowWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 200px;
    display: inline;
  }
  .description {
    font-size: 15px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .up {
      color: ${PRIMARY_TEXT_COLOR};
    }
    .down {
      color: ${SECONDARY_COLOR};
    }
    .payout {
      font-size: 12px;
    }

    div:last-child {
      margin-top: 5px;
    }
  }
`

const DetailBox = styled.div<{ mainColor: string }>`
  min-height: 136px;
  border: 1px solid ${(props) => props.mainColor};
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  .summary-title {
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 14px;
    color: #8f9098;
  }
  .summary {
    .price {
      color: ${(props) => props.mainColor};
    }

    .diff {
      background-color: ${(props) => props.mainColor};
      border-radius: 8px;
      font-size: 15px;
      color: white;
      width: 102px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  div.detail {
    margin-top: 20px;

    font-weight: 400;
    font-size: 12px;
    line-height: 14px;

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

    &.later {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
  .next-content {
    .enter-buttons {
      display: flex;
      flex-direction: column;

      button {
        margin-top: 10px;
      }
    }

    button {
      width: 100%;
      height: 40px;
      &.up {
        background-color: ${PRIMARY_TEXT_COLOR};
        color: black;
        &:hover {
          border-color: ${PRIMARY_TEXT_COLOR};
        }
      }
      &.down {
        background-color: ${SECONDARY_COLOR};
        color: white;
        &:hover {
          border-color: ${SECONDARY_COLOR};
        }
      }
    }
  }
`

const TimerWrapper = styled.div`
  width: 95%;
  margin: auto;
  height: 30px;
`

type CardProps = {
  round: Round
  roundState: RoundState
  betStatusOnCurrentRound?: BetStatus
  currentAptosPrice?: number
}

const currentTimestamp = Math.floor(Date.now())

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
  const [betMode, setBetMode] = useState<"up" | "down" | null>(null)
  const [betAmount, setBetAmount] = useState(0)
  const DEFUALT_BET_AMOUNT = 0.02
  const { network } = useAptosModule()

  const { fetchBetStatusOfCurrentUser } = useContext(ContractContext)

  useEffect(() => {
    setBetAmount(DEFUALT_BET_AMOUNT)
  }, [betMode])

  const { bearAmount, bullAmount, totalAmount, closePrice, lockPrice, epoch } =
    round
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
    ? `+$${priceDiff.diff}`
    : `-$${priceDiff.diff}`

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

  // // 베팅!
  const handleClickBet = async () => {
    const ok = window.confirm(
      `You betted ${betAmount}APT on ${betMode?.toLocaleUpperCase()}. Is it okay?`,
    )
    if (!ok) return

    const isBull = betMode === "up"

    const aptAmount = numberToApt(betAmount)

    const transaction = {
      type: "entry_function_payload",
      function: `${betosAddress[network]}::${MODULE_NAME}::bet`,
      arguments: [String(epoch), String(aptAmount), String(isBull)],
      type_arguments: [],
    }
    console.log("transaction", transaction)

    try {
      await window.aptos.signAndSubmitTransaction(transaction)
      await fetchBetStatusOfCurrentUser()
    } catch (e: any) {
      console.log("!!!!!!!!!!!!!!!!erorr in bet!!!!!!!!!!!!!!!!!!")
      console.log("e", e)
    }
  }

  const getIcon = () => {
    if (isExpired) return Ban
    if (isLive) return Play
    if (isNext) return Play
    if (isLater) return Clock
    return ""
  }

  const lastPrice = (function () {
    let price = 0
    if (isLive) {
      price = currentAptosPrice
    }
    if (isExpired) {
      price = closePrice
    }
    return "$" + formatNumber(price, 4)
  })()

  const ArrowUpImage = (function () {
    if (isLater || isNext) return ArrowUpBlack
    if (isBullish) return ArrowUp
    return ArrowUpBlack
  })()

  const ArrowDownImage = (function () {
    if (isLater || isNext) return ArrowDownBlack
    if (!isBullish) return ArrowDown
    return ArrowDownBlack
  })()

  const renderBetButtons = () => {
    if (betMode === null) {
      return (
        <div>
          <div>
            <span className="title">Prize Pool: </span>
            <span className="content">{totalAmount}APT</span>
          </div>
          <div className="enter-buttons">
            <Button
              className="up"
              onClick={() => {
                setBetMode("up")
              }}>
              Enter Up
            </Button>
            <Button
              className="down"
              onClick={() => {
                setBetMode("down")
              }}>
              Enter Down
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className="bet_input">
          <h4>Bet to {betMode}</h4>
          <InputNumber
            size={"large"}
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
      </div>
    )
  }

  return (
    <CardWrapper isNext={isNext} isDisabled={isDisabled}>
      {betMode !== null ? (
        <>
          <Header>
            <div>
              <button
                className="left"
                onClick={() => {
                  setBetMode(null)
                }}>
                <img src={LeftArrow} />
              </button>

              <div>Set Position</div>
            </div>
            <div className={`position ${betMode === "up" ? "up" : "down"}`}>
              <img src={betMode === "up" ? SmallArrowUp : SmallArrowDown}></img>
              <span>{betMode.toUpperCase()}</span>
            </div>
          </Header>
          <Contents mainColor={mainColor}>
            <div className="next">
              <div>
                <div>
                  <Text>Commit :</Text>
                </div>
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
              <div className="buttons">
                <button
                  className="confirm"
                  onClick={() => {
                    handleClickBet()
                  }}>
                  Comfirm
                </button>
                <button
                  className="cancel"
                  onClick={() => {
                    setBetMode(null)
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </Contents>
        </>
      ) : (
        <>
          <Header>
            <div>
              <img src={getIcon()} width={20} alt="icon" />
              <span className="status">{title}</span>
            </div>
            <span className="number">{`#${epoch}`}</span>
          </Header>
          <TimerWrapper>
            {(isLive || isExpired) && (
              <PlusTimer
                disabled={isExpired}
                setDisabled={setDisabled}
                start={round.closeTimestamp - currentTimestamp}
                end={ROUND_STEP}
                showProgress
              />
            )}
          </TimerWrapper>

          <Contents mainColor={mainColor}>
            <ArrowWrapper>
              <img src={ArrowUpImage} />
              {!isLater && (
                <div className="description">
                  <div className="up">Up</div>
                  <div className="payout">{bullPayout}x Payout</div>
                </div>
              )}
            </ArrowWrapper>
            <DetailBox mainColor={mainColor}>
              {(isLive || isExpired) && (
                <div>
                  <div className="summary-title">LAST PRICE</div>
                  <div className="summary">
                    <div className="price">{lastPrice}</div>
                    <div className="diff">{priceDiffDescription}</div>
                  </div>

                  <div className="detail">
                    <div className="row">
                      <span className="title">Locked Price:</span>
                      <span className="content">
                        ${formatNumber(lockPrice, 4)}
                      </span>
                    </div>

                    <div className="row">
                      <span className="title">Prize Pool:</span>
                      <span className="content">{totalAmount}APT</span>
                    </div>
                  </div>
                </div>
              )}
              {isNext && (
                <div className="next-content">
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
                    ) : (
                      renderBetButtons()
                    )}
                  </div>
                </div>
              )}

              {isLater && (
                <div className="detail later">
                  <p>Next round will start</p>
                  <MinusTimer start={round.startTimestamp - currentTimestamp} />
                </div>
              )}
            </DetailBox>

            {/* (
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
        ) */}
            <ArrowWrapper>
              <img src={ArrowDownImage} />
              {!isLater && (
                <div className="description">
                  <div className="payout">{bearPayout}x Payout</div>
                  <div className="down">Down</div>
                </div>
              )}
            </ArrowWrapper>
          </Contents>
        </>
      )}
    </CardWrapper>
  )
}

export default Card
