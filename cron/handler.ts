import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js";
import { AptosAccount, AptosClient, TxnBuilderTypes, BCS } from "aptos";

export const run = async (event) => {
  const res = await execute_round(
    process.env.BETOS_ADDRESS!,
    process.env.NETWORK!
  );

  return {
    statusCode: 200,
  };
};

async function execute_round(betosAddress: string, network: string) {
  // validate
  if (process.env.APTOS_KEY === undefined) {
    throw new Error(`APTOS_KEY environment variable should be set.`);
  }

  const now = Math.floor(Date.now() / 1000);
  const SIX_HOURS = 6 * 60 * 60;
  const TEN_MINUTES = 10 * 60;
  const INTERVAL = network == "mainnet" ? SIX_HOURS : TEN_MINUTES;

  const endpoint =
    network == "mainnet"
      ? "https://fullnode.mainnet.aptoslabs.com"
      : "https://fullnode.testnet.aptoslabs.com";

  const priceServiceAddress =
    network == "mainnet"
      ? "https://xc-mainnet.pyth.network"
      : "https://xc-testnet.pyth.network";

  // You can find the ids of prices at https://pyth.network/developers/price-feed-ids#aptos-testnet
  let priceId =
    network === "mainnet"
      ? "0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5" // Mainnet
      : "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e"; // Testnet

  let priceIds = [priceId];

  const connection = new AptosPriceServiceConnection(priceServiceAddress);
  // In order to use Pyth prices in your protocol you need to submit the price update data to Pyth contract in your target
  // chain. `getPriceUpdateData` creates the update data which can be submitted to your contract. Then your contract should
  // call the Pyth Contract with this data.
  const priceFeeds = await connection.getLatestPriceFeeds(priceIds);
  // console.log(priceFeeds)

  const latestVaas = await connection.getLatestVaas(priceIds);
  // console.log(latestVaas)

  /*
  const x = latestVaas.map((vaa) =>
    Array.from(Buffer.from(vaa, "base64").toString("hex")).join("")
  );
  console.log(x);
  */

  const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIds);
  // console.log(priceUpdateData.toString)

  // Create a transaction and submit to your contract using the price update data
  const client = new AptosClient(endpoint);

  const sender = AptosAccount.fromAptosAccountObject({
    privateKeyHex: process.env.APTOS_KEY,
    // publicKeyHex: "",
    // address: "",
  });

  const entryFunction = TxnBuilderTypes.EntryFunction.natural(
    `${betosAddress}::prediction`,
    "execute_round",
    [],
    [
      AptosPriceServiceConnection.serializeUpdateData(priceUpdateData),
      BCS.bcsSerializeUint64(now),
      BCS.bcsSerializeUint64(now + INTERVAL),
      BCS.bcsSerializeUint64(now + 2 * INTERVAL),
    ]
  );

  /*
  console.log(
    Buffer.from(
      AptosPriceServiceConnection.serializeUpdateData(priceUpdateData),
    ).toString("hex"),
  )
  */

  const tx = await client.generateSignSubmitTransaction(
    sender,
    new TxnBuilderTypes.TransactionPayloadEntryFunction(entryFunction)
  );

  console.log(tx);
}
