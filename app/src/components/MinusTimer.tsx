import { Progress } from "antd"
import React, { useEffect } from "react"
import styled from "styled-components"
import { ROUND_STEP } from "../constants"
import useMinusCounter from "../hooks/useMinusCounter"
type Props = {
  start: number
  showProgress?: boolean
  setDisabled?: () => void
  style?: { [key: string]: string | number }
}

const Wrapper = styled.div`
  color: white;
  display: flex;
  justify-content: flex-end !important;
`
// minus counter
// all miliseconds
const MinusTimer: React.FC<Props> = ({
  start,
  showProgress,
  setDisabled,
  style,
}) => {
  if (start < 0) {
    return (
      <Wrapper style={style} className="timer">
        -
      </Wrapper>
    )
  }

  const time = useMinusCounter(start)
  const detail = getTimeDetail(time)
  const progress = (time / ROUND_STEP) * 100

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
export default MinusTimer

const getTimeDetail = (miliseconds: number) => {
  if (miliseconds < 0) {
    return null
  }
  const hours = Math.floor(miliseconds / (60000 * 60))
  const minutes = ((miliseconds % (60000 * 60)) / (1000 * 60)).toFixed(0)
  const seconds = ((miliseconds % 60000) / 1000).toFixed(0)

  const hoursDetail = hours < 10 ? `0${hours}` : hours
  const minutesDetail = Number(minutes) < 10 ? `0${minutes}` : minutes
  const secondsDetail = Number(seconds) < 10 ? `0${seconds}` : seconds

  return `~ ${hoursDetail}:${minutesDetail}:${secondsDetail}`
}
