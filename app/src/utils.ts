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
