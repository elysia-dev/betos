import { compact, map } from "lodash"

import React, { useEffect, useMemo, useState } from "react"
import { Button, Table, Tag, Typography } from "antd"
import { Types } from "aptos"
import useAptosModule from "../useAptosModule"
import { formatNumber, parseBetStatus, parseRound } from "../utils"
import { BetStatus, RawRound, Round } from "../types"
import {
  BETOS_ADDRESS,
  MODULE_NAME,
  PRIMARY_TEXT_COLOR,
  SECONDARY_COLOR,
} from "../constants"

import type { ColumnsType } from "antd/es/table"
import styled from "styled-components"

const { Title } = Typography

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
  padding: 100px;

  table {
    background-color: #000000;
    thead {
      th {
        background-color: black !important;
      }
    }
    tr.claimable {
      background-color: blue;
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

const columnData: ColumnsType<BetRecord> = [
  {
    title: "Round",
    dataIndex: "round",
    key: "round",
  },
  {
    title: "Result",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "Up&down",
    key: "isBull",
    dataIndex: "upddown",
    render: (_, { isBull }) => {
      const color = isBull ? PRIMARY_TEXT_COLOR : SECONDARY_COLOR
      return (
        <Tag color={color} key={color}>
          {isBull ? "Up" : "Down"}
        </Tag>
      )
    },
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "Reward",
    dataIndex: "reward",
    key: "reward",
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
    title: "Total",
    dataIndex: "total",
    key: "total",
  },
]

const columns: ColumnsType<BetRecord> = columnData.map((col) => {
  return { ...col, align: "center" }
})

const checkClaimable = (betRecord: BetRecord) => {
  const { claimed, total, state, round, isBull, key } = betRecord
  const isAble = !claimed && state === "WIN"
  return isAble
}

// expired: 결과까지 끝남
// live: bet은 끝났고 5분뒤에 결과 나옴, 오직1개
// next: 현재 bet 가능, 오직1개
// later: 아직 bet불가 (다음 라운드)

const RESOURCE_KEY_BET = `${BETOS_ADDRESS}::${MODULE_NAME}::BetContainer`
const RESOURCE_KEY_ROUND = `${BETOS_ADDRESS}::${MODULE_NAME}::RoundContainer`

const Claim: React.FC = () => {
  const [myEpochs, setMyEpochs] = useState<BetStatus[]>([])
  const { client, account, address } = useAptosModule()

  const [betosResources, setBetosResources] = React.useState<
    Types.MoveResource[]
  >([])

  // 연결된 지갑에 있는 리소스
  const [accountResources, setAccountResources] = React.useState<
    Types.MoveResource[]
  >([])

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

  const betosResource = betosResources.find(
    (r) => r?.type === RESOURCE_KEY_ROUND,
  )
  const data = betosResource?.data as
    | { rounds: RawRound[]; current_epoch: string }
    | undefined
  const fetchedRounds = data?.rounds || []
  const currentEpoch = Number(data?.current_epoch) || 0

  const rounds = fetchedRounds

  const parsedRounds = rounds.map(parseRound)

  // TODO: key를 epoch로 하게 해서 개선하기, 이거대로면 매번 round 배열을 순회해야함
  const getRoundByEpoch = (epoch: number) => {
    return parsedRounds.find((r) => r.epoch === epoch)
  }

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
  const checkRoundClosed = (round: Round) => !!round.closePrice

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

  const tableData = useMemo(() => {
    return myEpochs.map((myEpoch, index) => {
      const { amount, claimed, epoch, isBull } = myEpoch
      const isCurrentEpoch = epoch === Number(currentEpoch)
      const round = getRoundByEpoch(epoch)
      if (!round) {
        return null
      }
      const { resultStatus, totalAmount, bullAmount, bearAmount } = round || {}
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
    })
  }, [myEpochs])
  const compactedTableData: BetRecord[] = compact(tableData)

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
        <Title level={4}>Claimable Amounts : {claimableAmounts} APT</Title>
        <Button>Claim</Button>
      </Header>

      <Table
        onHeaderRow={(column, index) => {
          return {
            className: "header coo",
          }
        }}
        onRow={(record, rowIndex) => {
          console.log("record", record)
          const isClaimable = checkClaimable(record)
          console.log("isClaimable", isClaimable)
          if (isClaimable) {
            return {
              className: "claimable",
            }
          }
          return {}
        }}
        columns={columns}
        dataSource={compactedTableData}
      />
    </Wrapper>
  )
}

export default Claim
