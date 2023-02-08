import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/reset.scss"
import "./styles/font.scss"
import "./styles/globals.scss"

declare global {
  interface Window {
    aptos: any
  }
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
window.addEventListener("load", () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
