import { AptosAccount, AptosClient, TxnBuilderTypes, BCS } from "aptos";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("epoch", {
    type: "number",
    required: true,
  })
  .option("amount", {
    description: "bet amount in APT, decimal 8",
    type: "number",
    required: true,
  })
  .option("is-bull", {
    description: "bull or bear",
    type: "boolean",
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

  // Create a transaction and submit to your contract using the price update data
  const client = new AptosClient(endpoint);
  if (process.env.APTOS_KEY === undefined) {
    throw new Error(`APTOS_KEY environment variable should be set.`);
  }
  const sender = new AptosAccount(Buffer.from(process.env.APTOS_KEY, "hex"));

  await client.generateSignSubmitWaitForTransaction(
    sender,
    new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        `${BETOS_ADDRESS}::prediction`,
        "bet",
        [],
        [
          BCS.bcsSerializeUint64(argv.epoch),
          BCS.bcsSerializeUint64(argv.amount),
          BCS.bcsSerializeBool(argv.isBull),
        ]
      )
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
