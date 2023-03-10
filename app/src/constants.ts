export const MODULE_NAME = "prediction"

export const SECONDARY_COLOR = "#F57272"
export const PRIMARY_TEXT_COLOR = "#61c19b"

// const FIVE_MINUTES = 5 * 60 * 1000
// const TEN_MINUTES = 10 * 60 * 1000
// const ONE_HOUR = 60 * 60 * 1000
const SIX_HOUR = 6 * 60 * 60 * 1000

export const ROUND_STEP = SIX_HOUR

export const priceId = {
  Mainnet: "0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5", // Mainnet
  Testnet: "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e", // Testnet
} as const

export const priceServiceAddress = {
  Mainnet: "https://xc-mainnet.pyth.network",
  Testnet: "https://xc-testnet.pyth.network",
} as const
export const endpoint = {
  Mainnet: "https://fullnode.mainnet.aptoslabs.com",
  Testnet: "https://fullnode.testnet.aptoslabs.com",
} as const

export const betosAddress = {
  Mainnet: "0x96be8b77f364acc83b5cf7097116c4c34a404f8e357941dff04b1d0baebcf29d",
  Testnet: "0x71e2a99f3e9d32ef9cddac76d88f0cf8ade564bf1f24e016da160bd75d70eedb",
} as const

export const DEFUALT_BET_AMOUNT = 0.02
