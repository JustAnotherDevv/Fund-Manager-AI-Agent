import pkg from "hedera-agent-kit";
const { HederaAgentKit } = pkg;
import {
  TokenId,
  TopicId,
  AccountId,
  PendingAirdropId,
  Client,
  ContractExecuteTransaction,
  PrivateKey,
  ContractCallQuery,
} from "@hashgraph/sdk";

const main = async () => {
  const accountId = "0.0.5615618";
  const privateKey =
    "3030020100300706052b8104000a042204208f77df2c077bf06cc029a37d463a6e30f2b0c30bfce66b28a14ec1d01d729944";
  const network = "testnet";
  const kit = new HederaAgentKit(accountId, privateKey, network);

  const MY_ACCOUNT_ID = AccountId.fromString(accountId);
  const MY_PRIVATE_KEY = PrivateKey.fromString(privateKey);

  const client = Client.forTestnet();

  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  const balance = await kit.getHbarBalance();

  console.log(balance);

  // const options = {
  //   name: "MyNFT", // Token name (string, required)
  //   symbol: "NFT", // Token symbol (string, required)
  //   maxSupply: 1, // Maximum token supply (optional, in this case, the supply is 1, as it's a unique NFT)
  //   isMetadataKey: true, // Metadata key flag (optional, defaults to false)
  //   isAdminKey: false, // Admin key flag (optional, defaults to false)
  //   tokenMetadata: new TextEncoder().encode("Unique NFT Metadata"), // Token metadata (optional, can be omitted if not needed)
  //   memo: "Initial NFT Creation", // Memo (optional,  can be omitted if not needed)
  // };

  // console.log(await kit.getAllTokensBalances(network));

  // const createNFTResult = await kit.createNFT(options);
  // console.log(JSON.stringify(createNFTResult, null, 2));

  const newContractId = "0.0.5640759";

  //Create the transaction
  // const transaction = new ContractExecuteTransaction()
  //   .setContractId(newContractId)
  //   .setGas(100_000_000)
  //   .setFunction(
  //     "asset"
  //     // new ContractFunctionParameters().addString("hello from hedera again!")
  //   );
  // const transaction = new ContractCallQuery()
  //   .setContractId(newContractId)
  //   .setGas(1000_000_000)
  //   .setFunction(
  //     "asset"
  //     // new ContractFunctionParameters().addString("hello from hedera again!")
  //   );

  // //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
  // const txResponse = await transaction.execute(client);

  // //Request the receipt of the transaction
  // const receipt = await txResponse.getReceipt(client);

  // //Get the transaction consensus status
  // const transactionStatus = receipt.status;

  // console.log("The transaction consensus status is " + transactionStatus);

  const query = new ContractCallQuery()
    .setContractId(newContractId)
    .setGas(60000)
    .setFunction("asset");

  const contractCallResult = await query.execute(client);

  const message = contractCallResult.getString(0);
  console.log("contract message: " + message);
};

main();
