#!/usr/bin/env node
const program = require("commander");
const moment = require("moment");
const { bsv } = require("scryptlib");
const { API_NET, BlockChainApi } = require("./lib/blockchain-api");
const { Logger } = require("./lib/logger");
const { FT } = require("./lib/sensible_nft/FT");
const { ScriptHelper } = require("./lib/sensible_nft/ScriptHelper");
const { Utils } = require("./util/Utils");
const path = require("path");
// @ts-ignore
const config = require("../config");
const { UtxoManager } = require("./util/UtxoManager");
Logger.replaceConsole({
  name: `${moment().format("YYYY-MM-DD")}/${moment().format(
    "YYYY-MM-DDTHH:mm:ss"
  )}_genesis.log`,
  level: "debug",
  appenders: ["console", "file"],
  path: "logs",
});

function getProgramOption() {
  const optionSettings = [
    { name: "network", alias: "net", desc: "当前使用的网络 (main/test)" },
    {
      name: "genesis_txid",
      alias: "genesisOutpointTxId",
      desc: "genesis txid",
    },
    {
      name: "genesis_index",
      alias: "genesisOutpointIdx",
      desc: "genesis index",
    },
  ];
  let _res = program;
  optionSettings.forEach((v) => {
    // @ts-ignore
    _res = _res.option(`--${v.name} <${v.alias}>`, v.desc);
  });
  _res.parse(process.argv);
  for (let i = 0; i < optionSettings.length; i++) {
    let v = optionSettings[i];
    if (Utils.isNull(program[v.name])) {
      throw `option ${v.name} is needed`;
    }
  }
  return {
    network: program.network,
    genesisOutpointTxId: program.genesis_txid,
    genesisOutpointIdx: parseInt(program.genesis_index),
  };
}

(async () => {
  try {
    const options = getProgramOption();

    UtxoManager.initGenesis(
      options.genesisOutpointTxId,
      options.genesisOutpointIdx
    );

    console.log(`Succeeded on [${program.network}]`);
  } catch (error) {
    console.error(
      "Executed Failed",
      "\n[COMMAND]",
      program.rawArgs.join(" "),
      "\n[ERROR]",
      error
    );
  }
})();
