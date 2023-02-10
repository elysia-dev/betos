// export const APT_USD_TESTNET_PRICE_ID =
//   "44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e"
// export const TESTNET_PRICE_SERVICE = "https://xc-testnet.pyth.network"

// export const BETOS_ADDRESS =
//   "0x57c21eeb2fd33f64acf8fb54e53783c04579cac5048adec5de00ea95119ebcd7"

// export const CLIENT_ENDPOINT = "https://fullnode.testnet.aptoslabs.com/v1"

export const MODULE_NAME = "prediction"

export const SECONDARY_COLOR = "#F57272"
export const PRIMARY_TEXT_COLOR = "#61c19b"

const FIVE_MINUTES = 5 * 60 * 1000
const TEN_MINUTES = 10 * 60 * 1000
const ONE_HOUR = 60 * 60 * 1000

export const ROUND_STEP = FIVE_MINUTES

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
  Mainnet: "0xb7819e2435c024bd2a84f7527e6b752882a38a0f8835542fa893ac5f511d58a",
  // TODO: change
  Testnet: "0x57c21eeb2fd33f64acf8fb54e53783c04579cac5048adec5de00ea95119ebcd7",
} as const
