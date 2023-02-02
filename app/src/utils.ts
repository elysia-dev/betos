import { BetStatus, RawBetStatus } from "./types"

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
