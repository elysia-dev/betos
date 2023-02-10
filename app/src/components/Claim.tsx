import { compact, map } from "lodash"

import React, { useMemo } from "react"
import { Button, Table, Tag, Typography } from "antd"
import { Types } from "aptos"
import PartyImage from "../assets/party.png"
import useAptosModule from "../useAptosModule"
import {
  checkRoundClosed,
  formatNumber,
  parseBetStatus,
  parseRound,
} from "../utils"
import { BetStatus, RawRound, Round } from "../types"
import {
  BETOS_ADDRESS,
  MODULE_NAME,
  PRIMARY_TEXT_COLOR,
  SECONDARY_COLOR,
} from "../constants"

import type { ColumnsType } from "antd/es/table"
import styled from "styled-components"
import { handleClickClaim } from "./Home"

const { Title, Text } = Typography

interface BetRecord {
  key: string
  round: string
  state: string
  isBull: boolean
  position: number
  reward: number
  claimed: boolean
  total: number
}

const Wrapper = styled.div`
  margin-top: 50px;
  padding: 150px;

  table {
    background-color: #000000;
    thead {
      th {
        background-color: black !important;
      }
    }

    .column-round {
      img {
        opacity: 0;
        margin-right: 10px;
        position: absolute;
        left: 20%;
      }
    }
    tr.claimable {
      background-color: rgba(255, 255, 225, 0.1);

      .column-round {
        img {
          opacity: 1;
        }
      }
    }
  }
`

const Header = styled.div`
  display: flex;
  button {
    margin-left: 20px;
  }
  margin-bottom: 20px;
`

const ClaimButton = styled(Button)`
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

const columnData: ColumnsType<BetRecord> = [
  {
    title: "Round",
    dataIndex: "round",
    key: "round",
    render: (round, record) => {
      return (
        <div className="column-round">
          <img src={PartyImage} width={20} />
          {round}
        </div>
      )
    },
  },
  {
    title: "Result",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "Claimed",
    dataIndex: "claimed",
    key: "claimed",
    render: (_, { claimed }) => {
      const color = claimed ? "red" : "blue"
      return (
        <Tag color={color} key={color}>
          {claimed ? "CLAIMED" : "UN-CLAIMED"}
        </Tag>
      )
    },
  },
  {
    title: "betOn",
    key: "isBull",
    dataIndex: "betOn",
    render: (_, record) => {
      const color = record.isBull ? PRIMARY_TEXT_COLOR : SECONDARY_COLOR
      return (
        <div>
          <Tag color={color} key={color}>
            {record.isBull ? "Up" : "Down"}
          </Tag>
          <span> {record.position} APT</span>
        </div>
      )
    },
  },

  {
    title: "TotalPool",
    dataIndex: "total",
    key: "total",
  },

  {
    title: "Reward",
    dataIndex: "reward",
    key: "reward",
  },
]

const columns: ColumnsType<BetRecord> = columnData.map((col) => {
  return { ...col, align: "center" }
})

const checkClaimable = (betRecord: BetRecord) => {
  const { claimed, state } = betRecord
  return !claimed && state === "WIN"
}

type Props = {
  getRoundByEpoch: any
  currentEpoch: number
  myEpochs?: BetStatus[]
}

const Claim: React.FC<Props> = ({
  myEpochs,
  currentEpoch,
  getRoundByEpoch,
}) => {
  const tableData = useMemo(() => {
    return compact(
      map(myEpochs, (myEpoch, index) => {
        const { amount, claimed, epoch, isBull } = myEpoch
        const isCurrentEpoch = epoch === Number(currentEpoch)
        const round = getRoundByEpoch(epoch)
        if (!round) {
          return null
        }
        const { resultStatus, totalAmount, bullAmount, bearAmount } =
          round || {}
        const isClosedRound = checkRoundClosed(round)

        const isWin = (function () {
          if (totalAmount == amount) return true
          if (resultStatus === "up") return isBull
          if (resultStatus === "down") return !isBull
          else return false
        })()

        const state: string =
          !isClosedRound || isCurrentEpoch ? "PENDING" : isWin ? "WIN" : "FAIL"

        const reward = (function () {
          if (!isWin) return 0
          const payout = totalAmount / (isBull ? bullAmount : bearAmount)
          return payout * amount
        })()

        return {
          key: String(index),
          round: `#${epoch}`,
          state,
          isBull,
          position: amount,
          reward,
          claimed,
          total: totalAmount,
        }
      }),
    )
  }, [myEpochs])

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

  return (
    <Wrapper>
      <Header>
        <Title level={4}>Total Prize: {claimableAmounts} APT</Title>
        <ClaimButton disabled={!claimableAmounts} onClick={handleClickClaim}>
          <img src={PartyImage} width={20} />
          Claim
        </ClaimButton>
      </Header>

      <Table
        onRow={(record) => {
          const isClaimable = checkClaimable(record)
          if (isClaimable) {
            return {
              className: "claimable",
            }
          }
          return {}
        }}
        columns={columns}
        dataSource={tableData}
      />
      <Text type={"secondary"}>
        You can claim round if you are the only one participant in the round
      </Text>
    </Wrapper>
  )
}

export default Claim
