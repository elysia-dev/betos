import React from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Claim from "./pages/Claim"

const RoutesComponent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    <Route path="/claim" element={<Claim />} />
  </Routes>
)

export default RoutesComponent
