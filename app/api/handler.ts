import type { VercelRequest, VercelResponse } from "@vercel/node"
import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js"
import { AptosAccount, AptosClient, TxnBuilderTypes } from "aptos"

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method === "POST") {
    try {
      const { authorization } = request.headers
      const { betosAddress, network } = request.body

      if (authorization === `Bearer ${process.env.APTOS_KEY}`) {
        const result = await run(betosAddress, network)
        console.log(result)

        response.status(200).json({
          result: result,
        })
      } else {
        response.status(401).json({ success: false })
      }
    } catch (err) {
      response.status(500).json({ statusCode: 500, message: err.message })
    }
  } else {
    response.setHeader("Allow", "POST")
    response.status(405).end("Method Not Allowed")
  }
}
