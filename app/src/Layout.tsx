import React, { ReactElement } from "react"
import { Layout, Menu, theme } from "antd"
import { Link } from "react-router-dom"
import background from "./assets/aptos@1.5.png"
import styled from "styled-components"

const { Header, Content, Footer } = Layout
type Props = {
  children: ReactElement
}

const ContentWrapper = styled.div`
  background-image: url(${background});
`

const LayoutComponent: React.FC<Props> = ({ children }) => {
  const {
    token: { colorBgContainer, colorPrimaryBg },
  } = theme.useToken()

  const naviagation = ["Home", "Claim"]

  return (
    <Layout className="layout" style={{ overflow: "hidden" }}>
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={naviagation.map((item, index) => {
            const label = <Link to={`/${item}`}>{item}</Link>
            const key = index + 1
            return {
              key,
              label,
            }
          })}
        />
      </Header>
      <ContentWrapper>
        <Content
          style={{
            padding: "10px 5px",
            minHeight: "90vh",
          }}>
          <div className="site-layout-content" style={{ color: "#ffffff" }}>
            {children}
          </div>
        </Content>
      </ContentWrapper>
      <Footer style={{ textAlign: "center" }}>Aptos Hackathon 2023</Footer>
    </Layout>
  )
}

export default LayoutComponent
