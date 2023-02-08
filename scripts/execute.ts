import { AptosPriceServiceConnection } from "@pythnetwork/pyth-aptos-js";
import { AptosAccount, AptosClient, TxnBuilderTypes, BCS } from "aptos";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Buffer } from "buffer";

const argv = yargs(hideBin(process.argv))
  .option("action", {
    description: "start, lock, execute",
    type: "string",
    required: true,
  })
  .help()
  .alias("help", "h")
  .parseSync();

async function main() {
  const endpoint = "https://fullnode.testnet.aptoslabs.com";
  const BETOS_ADDRESS = process.env.BETOS_ADDRESS;
  if (process.env.BETOS_ADDRESS === undefined) {
    throw new Error(`BETOS_ADDRESS environment variable should be set.`);
  }
  const connection = new AptosPriceServiceConnection(
    "https://xc-testnet.pyth.network"
  ); // See Price Service endpoints section below for other endpoints

  const priceIds = [
    // You can find the ids of prices at https://pyth.network/developers/price-feed-ids#aptos-testnet
    // "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b", // BTC/USD price id in testnet
    // "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6", // ETH/USD price id in testnet
    "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e",
  ];

  // In order to use Pyth prices in your protocol you need to submit the price update data to Pyth contract in your target
  // chain. `getPriceUpdateData` creates the update data which can be submitted to your contract. Then your contract should
  // call the Pyth Contract with this data.
  const priceFeeds = await connection.getLatestPriceFeeds(priceIds);
  console.log(priceFeeds);

  const latestVaas = await connection.getLatestVaas(priceIds);
  console.log(latestVaas);

  const x = latestVaas.map((vaa) =>
    Array.from(Buffer.from(vaa, "base64").toString("hex")).join("")
  );
  console.log(x);

  const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIds);
  console.log(priceUpdateData.toString);

  /*
  // Create a transaction and submit to your contract using the price update data
  const client = new AptosClient(endpoint);
  if (process.env.APTOS_KEY === undefined) {
    throw new Error(`APTOS_KEY environment variable should be set.`);
  }
  const sender = AptosAccount.fromAptosAccountObject({
    privateKeyHex: process.env.APTOS_KEY,
    // publicKeyHex: "",
    // address: "",
  });

  let entryFunction;
  if (argv.action === "start") {
    entryFunction = TxnBuilderTypes.EntryFunction.natural(
      `${BETOS_ADDRESS}::prediction`,
      "genesis_start_round",
      [],
      []
    );
  } else if (argv.action === "lock") {
    entryFunction = TxnBuilderTypes.EntryFunction.natural(
      `${BETOS_ADDRESS}::prediction`,
      "genesis_lock_round",
      [],
      [AptosPriceServiceConnection.serializeUpdateData(priceUpdateData)]
    );
  } else if (argv.action === "execute") {
    entryFunction = TxnBuilderTypes.EntryFunction.natural(
      `${BETOS_ADDRESS}::prediction`,
      "execute_round",
      [],
      [AptosPriceServiceConnection.serializeUpdateData(priceUpdateData)]
    );
  } else {
    throw new Error("action must be start, lock, or execute");
  }

  console.log(
    Buffer.from(
      AptosPriceServiceConnection.serializeUpdateData(priceUpdateData)
    ).toString("hex")
  );
  */

  /*
  await client.generateSignSubmitWaitForTransaction(
    sender,
    new TxnBuilderTypes.TransactionPayloadEntryFunction(entryFunction)
  );
  */
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
