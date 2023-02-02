import React from "react"
import styled from "styled-components"
import { Button, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
type Props = any
const Wrapper = styled.div``
const Header = styled.div``
const Record = styled.div``

const Claim: React.FC<Props> = () => {
  return (
    // <Wrapper>
    //   <Header>
    //     <h4>Your Total Prize</h4>
    //     <h4>_0.00013 APT</h4>
    //     <Button>Claim</Button>
    //   </Header>
    //   <Record>
    //     <h4>MyRecord</h4>
    //     <Table>
    //       <th>
    //         <div>Round</div>
    //         <div>Result</div>
    //         <div>Up&Down</div>
    //         <div>Position</div>
    //         <div>Reward</div>
    //         <div>Total</div>
    //       </th>
    //     </Table>
    //   </Record>
    //   <Record>
    //     <h4>Round Record</h4>
    //     <Table>
    //       <th>
    //         <div>Round</div>
    //         <div>Result</div>
    //         <div>Up&Down</div>
    //         <div>Position</div>
    //         <div>Reward</div>
    //         <div>Total</div>
    //       </th>
    //     </Table>
    //   </Record>
    // </Wrapper>
    <Table columns={columns} dataSource={data} />
  )
}
export default Claim

interface DataType {
  key: string
  round: number
  isWin: boolean
  updown: boolean
  position: number
  reward: number
  total: number
}

const columns: ColumnsType<DataType> = [
  {
    title: "Round",
    dataIndex: "round",
    key: "round",
  },
  {
    title: "Result",
    dataIndex: "isWin",
    key: "isWin",
  },
  {
    title: "Up&down",
    key: "updown",
    dataIndex: "upddown",
    render: (_, { updown }) => {
      const color = updown ? "red" : "blue"
      return (
        <Tag color={color} key={color}>
          {updown ? "Up" : "Down"}
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
    title: "Total",
    dataIndex: "total",
    key: "total",
  },
]

const data: DataType[] = [
  {
    key: "1",
    round: 12345,
    isWin: true,
    updown: true,
    position: 0.0001,
    reward: 0.0005,
    total: 0.123123,
  },
  {
    key: "2",
    round: 124235,
    isWin: false,
    updown: true,
    position: 0.0001,
    reward: 0.0005,
    total: 0.123123,
  },
]
