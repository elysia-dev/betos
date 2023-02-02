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
