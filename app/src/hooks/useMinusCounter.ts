import { useEffect, useState } from "react"

const useMinusCounter = (start: number) => {
  const [count, setCount] = useState(start)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(count - 1000)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [count])

  return count
}

export default useMinusCounter
