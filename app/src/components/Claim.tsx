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
    <Wrapper>
      <Header>
        <h4>Your Total Prize</h4>
        <h4>_0.00013 APT</h4>
        <Button>Claim</Button>
      </Header>
      <Record>
        <h4>MyRecord</h4>
        <Table>
          <th>
            <div>Round</div>
            <div>Result</div>
            <div>Up&Down</div>
            <div>Position</div>
            <div>Reward</div>
            <div>Total</div>
          </th>
        </Table>
      </Record>
      <Record>
        <h4>Round Record</h4>
        <Table>
          <th>
            <div>Round</div>
            <div>Result</div>
            <div>Up&Down</div>
            <div>Position</div>
            <div>Reward</div>
            <div>Total</div>
          </th>
        </Table>
      </Record>
    </Wrapper>
  )
}
export default Claim

// interface DataType {
//   key: string;
//   name: string;
//   age: number;
//   address: string;
//   tags: string[];
// }

// const columns: ColumnsType<DataType> = [
//   {
//     title: 'Name',
//     dataIndex: 'name',
//     key: 'name',
//     render: (text) => <a>{text}</a>,
//   },
//   {
//     title: 'Age',
//     dataIndex: 'age',
//     key: 'age',
//   },
//   {
//     title: 'Address',
//     dataIndex: 'address',
//     key: 'address',
//   },
//   {
//     title: 'Tags',
//     key: 'tags',
//     dataIndex: 'tags',
//     render: (_, { tags }) => (
//       <>
//         {tags.map((tag) => {
//           let color = tag.length > 5 ? 'geekblue' : 'green';
//           if (tag === 'loser') {
//             color = 'volcano';
//           }
//           return (
//             <Tag color={color} key={tag}>
//               {tag.toUpperCase()}
//             </Tag>
//           );
//         })}
//       </>
//     ),
//   },
//   {
//     title: 'Action',
//     key: 'action',
//     render: (_, record) => (
//       <Space size="middle">
//         <a>Invite {record.name}</a>
//         <a>Delete</a>
//       </Space>
//     ),
//   },
// ];

// const data: DataType[] = [
//   {
//     key: '1',
//     name: 'John Brown',
//     age: 32,
//     address: 'New York No. 1 Lake Park',
//     tags: ['nice', 'developer'],
//   },
//   {
//     key: '2',
//     name: 'Jim Green',
//     age: 42,
//     address: 'London No. 1 Lake Park',
//     tags: ['loser'],
//   },
//   {
//     key: '3',
//     name: 'Joe Black',
//     age: 32,
//     address: 'Sydney No. 1 Lake Park',
//     tags: ['cool', 'teacher'],
//   },
// ];
