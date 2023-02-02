import { BetStatus, RawBetStatus, Round, RawRound } from "./types"

export const OCTA = 8
export const formatNumber = (n: number, digit = 2) => {
  const mul = Math.pow(10, digit)
  return Math.round(n * mul) / mul
}

export const numberToApt = (n: number) => {
  return n * 10 ** OCTA
}

export const aptToNumber = (n: number) => {
  return n / 10 ** OCTA
}

export const parseBetStatus = (rawBetStatus: RawBetStatus): BetStatus => {
  const { amount, claimed, epoch, is_bull } = rawBetStatus
  const parsed = {
    amount: aptToNumber(Number(amount)),
    claimed,
    epoch: Number(epoch),
    isBull: is_bull,
  }
  return parsed
}

export const parseRound = (rawRound: RawRound): Round => {
  const {
    bear_amount,
    bull_amount,
    close_price,
    close_timestamp,
    lock_price,
    lock_timestamp,
    epoch: _epoch,
    start_timestamp,
    total_amount,
  } = rawRound

  const timestampRatio = 1000
  const bearAmount = aptToNumber(Number(bear_amount))
  const bullAmount = aptToNumber(Number(bull_amount))
  const totalAmount = aptToNumber(Number(total_amount))
  const closePrice = aptToNumber(Number(close_price))
  const closeTimestamp = Number(close_timestamp) * timestampRatio
  const lockTimestamp = Number(lock_timestamp) * timestampRatio
  const startTimestamp = Number(start_timestamp) * timestampRatio
  const lockPrice = aptToNumber(Number(lock_price))
  const epoch = Number(_epoch)

  const resultStatus: Round["resultStatus"] = !closePrice
    ? "none"
    : closePrice > lockPrice
    ? "up"
    : "down"
  return {
    bearAmount,
    bullAmount,
    totalAmount,
    closePrice,
    closeTimestamp,
    lockTimestamp,
    startTimestamp,
    lockPrice,
    epoch,
    resultStatus,
  }
}
