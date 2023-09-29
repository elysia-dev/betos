import { AptosAccount, AptosClient, TxnBuilderTypes, BCS } from "aptos";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).parseSync();

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
        "claim_entry",
        [],
        []
      )
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
