import React from "react"
import styled from "styled-components"
import { Button, theme, Typography } from "antd"
import PartyImage from "../assets/party.png"
import { tokenToString } from "typescript"
import { gray } from "@ant-design/colors"

const Wrapper = styled.div``

const Descriptions = styled.section`
  margin-top: 100px;
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
`

type CardProps = {
  type?: "up" | "down" | "ready"
}
const SECONDARY_COLOR = "#F57272"
const Card: React.FC<CardProps> = ({ type }) => {
  const {
    token: { colorPrimaryText, colorTextSecondary, colorPrimary },
  } = theme.useToken()

  const mainColor = (function () {
    if (type === "up") {
      return colorPrimaryText
    }
    if (type === "down") {
      return SECONDARY_COLOR
    }
    return gray[1]
  })()

  return (
    <CardWrapper mainColor={mainColor}>
      <Header mainColor={mainColor}>
        <span className="number">#132245</span>
        <span className="status">Expired</span>
      </Header>
      <Contents mainColor={mainColor}>
        <div className="summary">
          <div>$290.1194</div>
          <div>+$0.1135</div>
        </div>
        <div className="detail">
          <div className="row">
            <span className="title">UP / Down Payout:</span>
            <span className="content">1.67x / 2.50x</span>
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
      </Contents>
    </CardWrapper>
  )
}

const Board = styled.div`
  margin-top: 250px;
  display: flex;
  justify-content: center;
`

const Home: React.FC = () => {
  const {
    token: { colorPrimaryText },
  } = theme.useToken()
  const { Title } = Typography
  return (
    <Wrapper>
      <Descriptions>
        <h2>Your Total Prize</h2>
        <h4 style={{ color: colorPrimaryText }}>+0.00013 BNB</h4>
        <ClaimButton>
          <img src={PartyImage} width={20} />
          Claim
        </ClaimButton>
      </Descriptions>
      <Board>
        <Card type="up" />
        <Card type="down" />
        <Card type="ready" />
        <Card type="ready" />
        <Card type="ready" />
      </Board>
    </Wrapper>
  )
}

export default Home
