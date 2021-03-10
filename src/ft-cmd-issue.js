#!/usr/bin/env node
const program = require("commander");
const moment = require("moment");
const { bsv } = require("scryptlib");
const { API_NET, BlockChainApi } = require("./lib/blockchain-api");
const { Logger } = require("./lib/logger");
const { FT } = require("./lib/sensible_nft/FT");
const { ScriptHelper } = require("./lib/sensible_nft/ScriptHelper");
const { Utils } = require("./util/Utils");
const { UtxoManager } = require("./util/UtxoManager");
const path = require("path");
// @ts-ignore
const config = require("../config");
Logger.replaceConsole({
  name: `${moment().format("YYYY-MM-DD")}/${moment().format(
    "YYYY-MM-DDTHH:mm:ss"
  )}_issue.log`,
  level: "debug",
  appenders: ["console", "file"],
  path: "logs",
});

function getProgramOption() {
  const optionSettings = [
    { name: "network", alias: "net", desc: "当前使用的网络 (main/test)" },
    {
      name: "amount",
      alias: "tokenAmount",
      desc: "发行数量",
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
    genesisOutpointTxId: UtxoManager.getGenesis().genesis_txid,
    genesisOutpointIdx: parseInt(UtxoManager.getGenesis().genesis_index),
    tokenAmount: parseInt(program.amount),
  };
}

(async () => {
  try {
    const options = getProgramOption();
    const cfg = config[options.network];
    const privateKey = new bsv.PrivateKey.fromWIF(cfg.wif);
    ScriptHelper.prepare(
      new BlockChainApi(
        cfg.apiTarget,
        options.network == "main" ? API_NET.MAIN : API_NET.TEST
      ),
      privateKey,
      cfg.issueSatoshis,
      cfg.transferSatoshis,
      cfg.feeb
    );
    const ft = new FT(true);
    ft.setTxGenesisPart({
      prevTxId: options.genesisOutpointTxId,
      outputIndex: options.genesisOutpointIdx,
    });

    const issuerPrivKey = new bsv.PrivateKey.fromWIF(privateKey.toWIF());
    const issuerPk = bsv.PublicKey.fromPrivateKey(issuerPrivKey);
    const issuerPkh = bsv.crypto.Hash.sha256ripemd160(issuerPk.toBuffer());

    let txGenesis = await ft.makeTxGenesis({
      prevTxId: options.genesisOutpointTxId,
      outputIssuerPkh: issuerPkh,
      tokenAmount: options.tokenAmount,
    });
    txGenesis.sign(privateKey);
    let txid = await ScriptHelper.sendTx(txGenesis);

    let preTxHex = await ScriptHelper.blockChainApi.getRawTxData(
      options.genesisOutpointTxId
    );

    let utxos = UtxoManager.getUtxos(issuerPrivKey.toAddress());
    utxos.push({
      preTxId: options.genesisOutpointTxId,
      preOutputIndex: options.genesisOutpointIdx,
      preTxHex,
      txId: txid,
      outputIndex: 0,
      tokenAmount: options.tokenAmount,
      txHex: txGenesis.serialize(),
    });
    UtxoManager.saveUtxos(issuerPrivKey.toAddress(), utxos);
    // console.log(txGenesis.serialize());
    console.log(`Succeeded on [${program.network}] txid: ${txid}`);
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
