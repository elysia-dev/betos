export const formatNumber = (n: number, digit = 2) => {
  const mul = Math.pow(10, digit)
  return Math.round(n * mul) / mul
}
