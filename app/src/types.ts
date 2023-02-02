export type RawBetStatus = {
  amount: string
  claimed: boolean
  epoch: string
  is_bull: boolean
}

export type BetStatus = {
  amount: number
  claimed: boolean
  epoch: number
  isBull: boolean
}

export type RawRound = {
  epoch: string
  bear_amount: string
  bull_amount: string
  close_price: string
  close_timestamp: string
  lock_price: string
  lock_timestamp: string
  start_timestamp: string
  total_amount: string
}

export type Round = {
  bearAmount: number
  bullAmount: number
  totalAmount: number
  closePrice: number
  closeTimestamp: number
  lockTimestamp: number
  startTimestamp: number
  lockPrice: number
  epoch: number
  resultStatus: "bull" | "bear" | "none"
}
