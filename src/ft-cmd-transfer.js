#!/usr/bin/env node
const program = require("commander");
const moment = require("moment");
// const { bsv } = require("scryptlib");
const { API_NET, BlockChainApi } = require("./lib/blockchain-api");
const { Logger } = require("./lib/logger");
const { FT, sighashType } = require("./lib/sensible_nft/FT");
const { PayloadFT, TRANSFER } = require("./lib/sensible_nft/PayloadFT");
const { ScriptHelper, DataLen4 } = require("./lib/sensible_nft/ScriptHelper");
const { Utils } = require("./util/Utils");
const { UtxoManager } = require("./util/UtxoManager");
const path = require("path");

// @ts-ignore
const config = require("../config");
Logger.replaceConsole({
  name: `${moment().format("YYYY-MM-DD")}/${moment().format(
    "YYYY-MM-DDTHH:mm:ss"
  )}_transfer.log`,
  level: "debug",
  appenders: ["console", "file"],
  path: "logs",
});
const _ = require("lodash");
const MAX_UTXO_COUNT = 10;
const {
  bsv,
  buildContractClass,
  Bytes,
  getPreimage,
  num2bin,
  PubKey,
  Ripemd160,
  Sha256,
  Sig,
  SigHashPreimage,
  signTx,
  toHex,
} = require("scryptlib");
function getProgramOption() {
  const optionSettings = [
    { name: "network", alias: "net", desc: "当前使用的网络 (main/test)" },
    { name: "wif", alias: "senderWif", desc: "发送者的WIF" },
    { name: "addr", alias: "receiverAddress", desc: "接收的地址" },
    { name: "amount", alias: "tokenAmount", desc: "发送的数量" },
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
    senderWif: program.wif,
    receiverAddress: program.addr,
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

    const senderPrivKey = new bsv.PrivateKey.fromWIF(options.senderWif);
    const senderPk = bsv.PublicKey.fromPrivateKey(senderPrivKey);
    const senderPkh = bsv.crypto.Hash.sha256ripemd160(senderPk.toBuffer());
    const address = bsv.Address.fromString(
      options.receiverAddress,
      options.network == "main" ? "livenet" : "testnet"
    );
    const receiverPkh = address.hashBuffer;

    let utxoTokenAmount = 0;
    let toSendTokenAmount = options.tokenAmount;
    let changeTokenAmount = 0;

    //查询可用的utxo
    let leftUtxos = UtxoManager.getUtxos(senderPrivKey.toAddress());
    leftUtxos.sort((a, b) => b.tokenAmount - a.tokenAmount);
    let sum = 0;
    let idx = 0;
    for (let i = 0; i < leftUtxos.length; i++) {
      sum += leftUtxos[i].tokenAmount;
      idx = i;
      if (sum >= toSendTokenAmount) {
        break;
      }
    }
    if (sum == 0) throw "INSUFFICIENT FT";
    let utxos = leftUtxos.splice(0, idx + 1);

    //完善utxo，需要补充preTxHex和txHex.现在不用，自行管理保存
    // for (let i = 0; i < utxos.length; i++) {
    //   let utxo = utxos[i];
    //   utxo.preTxHex = await ScriptHelper.blockChainApi.getRawTxData(
    //     utxo.preTxId
    //   );

    //   utxo.txHex = await ScriptHelper.blockChainApi.getRawTxData(utxo.txId);
    // }

    //第一部分：构造交易
    let pl = new PayloadFT({
      dataType: TRANSFER,
      ownerPkh: senderPkh,
    });

    //构造输入
    let inputs = [];
    utxos.forEach((v, idx) => {
      pl.tokenAmount = v.tokenAmount;
      const utxoLockingScript = [
        ft.ftCodePart,
        ft.ftGenesisPart,
        pl.dump(),
      ].join(" ");
      inputs.push({
        txid: v.txId,
        vout: v.outputIndex,
        satoshis: ScriptHelper.transferSatoshis,
        script: utxoLockingScript, // transfer
      });
      utxoTokenAmount += v.tokenAmount;
    });

    changeTokenAmount = utxoTokenAmount - toSendTokenAmount;

    //构造输出
    let outputs = [];

    //构造转出TOKEN的输出
    pl.ownerPkh = receiverPkh;
    pl.tokenAmount = toSendTokenAmount;
    const newLockingScript = [ft.ftCodePart, ft.ftGenesisPart, pl.dump()].join(
      " "
    );
    outputs.push({
      satoshis: ScriptHelper.transferSatoshis,
      script: newLockingScript, // 转移
    });

    //构造找零TOKEN的输出
    if (changeTokenAmount > 0) {
      pl.ownerPkh = senderPkh;
      pl.tokenAmount = changeTokenAmount;
      const newLockingScript = [
        ft.ftCodePart,
        ft.ftGenesisPart,
        pl.dump(),
      ].join(" ");
      outputs.push({
        satoshis: ScriptHelper.transferSatoshis,
        script: newLockingScript, // 转移
      });
    }

    let tx = ScriptHelper.makeTx({
      tx: await ScriptHelper.createPayByOthersTx(ScriptHelper.dummyAddress),
      inputs,
      outputs,
    });
    tx.change(ScriptHelper.dummyPkh).feePerKb(ScriptHelper.feeb * 1000);

    //第二部分，构造解锁脚本
    let changeSatoshis = tx.outputs[tx.outputs.length - 1].satoshis;
    if (changeSatoshis < 0) throw "INSUFFICIENT BSV";

    let prevouts = "";
    tx.inputs.forEach((v) => {
      prevouts +=
        ScriptHelper.reverseEndian(v.prevTxId) +
        num2bin(v.outputIndex, DataLen4);
    });

    let preSigBEs = [];
    let prePaddings = [];
    let prePayloads = [];
    let preDataParts = [];

    let sideSigBEs = [];
    let sidePaddings = [];
    let sidePayloads = [];
    let sideDataParts = [];

    for (let i = 0; i < utxos.length; i++) {
      let utxo = utxos[i];
      let satotxData = {
        index: utxo.preOutputIndex,
        txId: utxo.preTxId,
        txHex: utxo.preTxHex,
        byTxId: utxo.txId,
        byTxHex: utxo.txHex,
      };
      // @ts-ignore
      let preSigInfo = await ScriptHelper.satoTxSigUTXOSpendBy(satotxData);
      let preDataPartHex = ScriptHelper.getDataPartFromScript(
        new bsv.Script(preSigInfo.script)
      );
      preSigBEs.push(BigInt("0x" + preSigInfo.sigBE));
      prePaddings.push(new Bytes(preSigInfo.padding));
      prePayloads.push(new Bytes(preSigInfo.payload));
      preDataParts.push(new Bytes("1d" + preDataPartHex));
      let sideSigInfo = await ScriptHelper.satoTxSigUTXO({
        index: utxo.outputIndex,
        // @ts-ignore
        txId: utxo.txId,
        txHex: utxo.txHex,
      });
      let sideDataPartHex = ScriptHelper.getDataPartFromScript(
        new bsv.Script(sideSigInfo.script)
      );

      sideSigBEs.push(BigInt("0x" + sideSigInfo.sigBE));
      sidePaddings.push(new Bytes(sideSigInfo.padding));
      sidePayloads.push(new Bytes(sideSigInfo.payload));
      sideDataParts.push(new Bytes("1d" + sideDataPartHex));
    }

    for (let i = utxos.length; i < MAX_UTXO_COUNT; i++) {
      preSigBEs.push(BigInt("0x00"));
      prePaddings.push(new Bytes(""));
      prePayloads.push(new Bytes(""));
      preDataParts.push(new Bytes(""));

      sideSigBEs.push(BigInt("0x00"));
      sidePaddings.push(new Bytes(""));
      sidePayloads.push(new Bytes(""));
      sideDataParts.push(new Bytes(""));
    }

    for (let i = 0; i < utxos.length; i++) {
      let utxo = utxos[i];
      let curInputIndex = tx.inputs.length - utxos.length + i;
      pl.tokenAmount = utxo.tokenAmount;
      ft.ft.setDataPart(ft.ftGenesisPart + " " + pl.dump());
      ft.ft.txContext = {
        tx: tx,
        inputIndex: curInputIndex,
        inputSatoshis: ScriptHelper.transferSatoshis,
      };

      // 计算preimage
      const preimage = getPreimage(
        tx,
        ft.ft.lockingScript.toASM(),
        ScriptHelper.transferSatoshis,
        curInputIndex
      );

      // 计算签名
      const sig = signTx(
        tx,
        senderPrivKey,
        ft.ft.lockingScript.toASM(),
        ScriptHelper.transferSatoshis,
        curInputIndex
      );

      ////测试用打印
      // console.log([
      // toHex(preimage),
      // utxos.length,
      // prevouts,
      // preSigBEs,
      // prePaddings,
      // prePayloads,
      // preDataParts,
      // sideSigBEs,
      // sidePaddings,
      // sidePayloads,
      // sideDataParts,
      // toHex(sig),
      // toHex(senderPk),
      // ScriptHelper.transferSatoshis,
      // toHex(receiverPkh),
      // toSendTokenAmount,
      // toHex(senderPkh),
      // changeTokenAmount,
      // toHex(senderPkh),
      // changeSatoshis,
      // ]);
      // 创建解锁
      let contractObj = ft.ft.transfer(
        new SigHashPreimage(toHex(preimage)),

        utxos.length,
        new Bytes(prevouts),

        preSigBEs,
        prePaddings,
        prePayloads,
        preDataParts,

        sideSigBEs,
        sidePaddings,
        sidePayloads,
        sideDataParts,

        new Sig(toHex(sig)),
        new PubKey(toHex(senderPk)),
        ScriptHelper.transferSatoshis,

        new Ripemd160(toHex(receiverPkh)),
        toSendTokenAmount,

        new Ripemd160(toHex(senderPkh)),
        changeTokenAmount,

        new Ripemd160(toHex(senderPkh)),
        changeSatoshis
      );

      tx.inputs[curInputIndex].setScript(contractObj.toScript());

      let ret = contractObj.verify();
      if (ret.success == false) throw ret;
    }
    // throw "SUCCESS";
    // unlock other p2pkh inputs
    for (let i = 0; i < tx.inputs.length - utxos.length; i++) {
      ScriptHelper.unlockP2PKHInput(
        ScriptHelper.privateKey,
        tx,
        i,
        sighashType
      );
    }

    console.log("fee", tx.getFee());
    //第三部分：广播
    let txid = await ScriptHelper.sendTx(tx);

    //更新TOKEN-UTXO
    if (changeTokenAmount > 0) {
      leftUtxos.push({
        preTxId: utxos[0].txId,
        preOutputIndex: utxos[0].outputIndex,
        preTxHex: utxos[0].txHex,
        txId: txid,
        outputIndex: 1,
        txHex: tx.serialize(),
        tokenAmount: changeTokenAmount,
      });
    }
    UtxoManager.saveUtxos(senderPrivKey.toAddress(), leftUtxos);
    let _res1 = UtxoManager.getUtxos(address.toString());
    _res1.push({
      preTxId: utxos[0].txId,
      preOutputIndex: utxos[0].outputIndex,
      preTxHex: utxos[0].txHex,
      txId: txid,
      outputIndex: 0,
      txHex: tx.serialize(),
      tokenAmount: toSendTokenAmount,
    });
    UtxoManager.saveUtxos(address.toString(), _res1);

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
