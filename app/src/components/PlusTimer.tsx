import { Progress } from "antd"
import React, { useEffect } from "react"
import styled from "styled-components"
import { ROUND_STEP } from "../constants"
import usePlusCounter from "../hooks/usePlusCounter"
import { Round } from "../types"
type Props = {
  start: number
  end: number
  showProgress?: boolean
  setDisabled?: () => void
  disabled?: boolean
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
  disabled,
}) => {
  if (disabled) {
    return (
      <Progress
        showInfo={false}
        percent={100}
        strokeColor={"white"}
        trailColor={"#141615"}
      />
    )
  }
  // if (start > end) return null
  const time = usePlusCounter(start)
  const detail = getTimeDetail(time)
  const progress = (time / ROUND_STEP) * 100

  useEffect(() => {
    if (time < 0 && setDisabled) {
      setDisabled()
    }
  }, [time])

  return (
    <Wrapper
      className="timer"
      style={{
        width: "100%",
        marginLeft: "5px",
      }}>
      {showProgress ? (
        <Progress
          showInfo={false}
          percent={progress}
          strokeColor={"white"}
          trailColor={"#141615"}
        />
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
  const hours = Math.floor(miliseconds / (60000 * 60))
  const minutes = ((miliseconds % (60000 * 60)) / (1000 * 60)).toFixed(0)
  const seconds = ((miliseconds % 60000) / 1000).toFixed(0)

  const hoursDetail = hours < 10 ? `0${hours}` : hours
  const minutesDetail = Number(minutes) < 10 ? `0${minutes}` : minutes
  const secondsDetail = Number(seconds) < 10 ? `0${seconds}` : seconds

  return `~ ${hoursDetail}:${minutesDetail}:${secondsDetail}`
}
