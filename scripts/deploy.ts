import { hex } from "../build/main.compiled.json";
import {
  beginCell,
  Cell,
  contractAddress,
  StateInit,
  storeStateInit,
  toNano,
} from "@ton/core";
import qs from "qs";
import qrcode from "qrcode-terminal";

import dotenv from "dotenv";

dotenv.config();

async function deployScript() {
  console.log(
    "================================================================="
  );
  console.log("Deploy script is running, let's deploy our main.fc contract...");

  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const stateInit: StateInit = {
    code: codeCell,
    data: dataCell,
  };

  const stateInitBuilder = beginCell();
  storeStateInit(stateInit)(stateInitBuilder);
  const stateInitCell = stateInitBuilder.endCell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log(
    `The address of the contract is following: ${address.toString()}`
  );
  console.log(`Please scan the QR code below to deploy the contract to ${
    process.env.TESTNET ? "testnet" : "mainnet"
  }:`);

  let stateInitHash = await stateInitCell.hash()

  let link =
    `https://app.tonkeeper.com/transfer/` +
    address.toString({
      testOnly: process.env.TESTNET ? true : false,
    }) +
    "?" +
    qs.stringify({
      amount: toNano(1).toString(10),
      // stateinit: stateInitCell.toBoc({ idx: false }).toString("base64"),
      stateinit: stateInitHash,
      text: "Deploy contract",
    });

  qrcode.generate(link, { small: true }, (code) => {
    console.log(code);
  });

  console.log("Deploying contract... Please wait...", link);
}

deployScript();