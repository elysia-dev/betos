import React from "react"
import { BrowserRouter } from "react-router-dom"
import Routes from "./Routes"
import Layout from "./Layout"
import { ConfigProvider, theme } from "antd"

type Props = any
const Root: React.FC<Props> = () => {
  const theme2 = {
    token: {
      colorPrimaryBg: "#141615",
      colorPrimary: "#6fe0b3",
      // colorPrimary: "#F57272",
      wireframe: false,
    },
    algorithm: theme.darkAlgorithm,
  }
  return (
    <BrowserRouter>
      <ConfigProvider theme={theme2}>
        <Layout>
          <Routes />
        </Layout>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default Root
