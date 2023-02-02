import { RawRound } from "../types"

export const genDummy = () => {
  const result = []
  for (let i = 0; i < 10; i++) {
    const epoch = String(i + 100)
    const bear_amount = String(Math.floor(Math.random() * 1000))
    const bull_amount = String(Math.floor(Math.random() * 1000))
    const total_amount = String(Number(bear_amount) + Number(bull_amount))
    const lock_price = String(300 + Math.floor(Math.random() * 10) / 10)
    const diff = Math.random() * 10
    const isMinus = Math.random() > 0.5

    const close_price = String(Number(lock_price) + (isMinus ? -1 : 1) * diff)
    const lock_timestamp = "1675238764"
    const start_timestamp = "1675238664"
    const close_timestamp = "1675238664"

    const round = {
      epoch,
      bear_amount,
      bull_amount,
      total_amount,
      lock_price,
      close_price,
      close_timestamp,
      lock_timestamp,
      start_timestamp,
    }
    result.push(round)
  }
  return result
}
const dummyRounds: RawRound[] = [
  {
    epoch: "10",
    bear_amount: "156",
    bull_amount: "350",
    close_price: "307.12",
    close_timestamp: "1675238864",
    lock_price: "300",
    lock_timestamp: "1675238764",
    start_timestamp: "1675238664",
    total_amount: "850",
  },
  {
    epoch: "11",
    bear_amount: "500",
    bull_amount: "900",
    total_amount: "850",
    close_price: "307.5310",
    close_timestamp: "1675238864",
    lock_price: "307.12",
    lock_timestamp: "1675238764",
    start_timestamp: "1675238664",
  },
  {
    epoch: "12",
    bear_amount: "500",
    bull_amount: "699",
    total_amount: "850",
    close_price: "307.4847",
    close_timestamp: "1675238864",
    lock_price: "307.5310",
    lock_timestamp: "1675238764",
    start_timestamp: "1675238664",
  },
  {
    epoch: "13",
    bear_amount: "1590",
    bull_amount: "3500",
    total_amount: "850",
    close_price: "307.5900",
    close_timestamp: "1675238864",
    lock_price: "307.4847",
    lock_timestamp: "1675238764",
    start_timestamp: "1675238664",
  },
  {
    epoch: "14",
    bear_amount: "114",
    bull_amount: "350",
    total_amount: "850",
    close_price: "307.1210",
    close_timestamp: "1675238864",
    lock_price: "307.5900",
    lock_timestamp: "1675238764",
    start_timestamp: "1675238664",
  },
  {
    epoch: "15",
    bear_amount: "500",
    bull_amount: "350",
    total_amount: "850",
    close_price: "305.1210",
    close_timestamp: "1675238864",
    lock_price: "307.1210",
    lock_timestamp: "1675238764",
    start_timestamp: "1675238664",
  },
]

export default dummyRounds
