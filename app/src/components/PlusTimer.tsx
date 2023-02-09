import { Progress } from "antd"
import React, { useEffect } from "react"
import styled from "styled-components"
import { ROUND_STEP } from "../constants"
import usePlusCounter from "../hooks/usePlusCounter"
type Props = {
  start: number
  end: number
  showProgress?: boolean
  setDisabled?: () => void
  style?: any
}

const Wrapper = styled.div`
  color: white;
  display: flex;
  justify-content: flex-end !important;
`
// minus counter
// all miliseconds
const PlusTimer: React.FC<Props> = ({
  start,
  end,
  showProgress,
  setDisabled,
  style,
}) => {
  console.log("start", start)
  console.log("end", end)

  const time = usePlusCounter(start)
  const detail = getTimeDetail(time)
  const progress = (time / ROUND_STEP) * 100
  console.log("progress", progress)

  useEffect(() => {
    if (time < 0 && setDisabled) {
      setDisabled()
    }
  }, [time])

  return (
    <Wrapper className="timer" style={style}>
      {showProgress ? (
        <Progress showInfo={false} percent={progress} />
      ) : (
        <div>{detail}</div>
      )}
    </Wrapper>
  )
}
export default PlusTimer

const getTimeDetail = (miliseconds: number) => {
  if (miliseconds < 0) {
    return null
  }
  const minutes = Math.floor(miliseconds / 60000)
  const seconds = ((miliseconds % 60000) / 1000).toFixed(0)

  const minutesDetail = minutes < 10 ? `0${minutes}` : minutes
  const secondsDetail = Number(seconds) < 10 ? `0${seconds}` : seconds

  return `~ ${minutesDetail}:${secondsDetail}`
}
