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
const { PayloadFT, MINT, TRANSFER, SWAP, SELL } = require("./PayloadFT");
const { DataLen4, dummyTxId, ScriptHelper } = require("./ScriptHelper");

const Signature = bsv.crypto.Signature;
const sighashType = Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID;

/**
 * NFT Tx forge，创建合约相关的Tx，执行对应签名
 */
class FT {
  /**
   * 创建nft forge, 如果参数deploy为true，则会使用真实utxos创建Tx，否则使用dummy utxos。
   *
   * @param {Boolean} deploy 是否是部署
   * @constructor NFT合约 forge
   */
  constructor(deploy = false) {
    // @ts-ignore
    const rabinPubKey = 0x25108ec89eb96b99314619eb5b124f11f00307a833cda48f5ab1865a04d4cfa567095ea4dd47cdf5c7568cd8efa77805197a67943fe965b0a558216011c374aa06a7527b20b0ce9471e399fa752e8c8b72a12527768a9fc7092f1a7057c1a1514b59df4d154df0d5994ff3b386a04d819474efbd99fb10681db58b1bd857f6d5n;
    this.deploy = deploy;

    let ftContractDesc;
    const compileBeforeTest = !deploy;
    if (compileBeforeTest) {
      /* 实时编译 */
      ftContractDesc = ScriptHelper.compileContract("ft.scrypt");
    } else {
      /* 预编译 */
      ftContractDesc = ScriptHelper.loadDesc("ft_desc.json");
    }
    const ftContractClass = buildContractClass(ftContractDesc);
    this.ft = new ftContractClass(rabinPubKey);
    this.ftCodePart = this.ft.codePart.toASM();
  }

  /**
   * 设置datapart的溯源部分
   * @param {Object} param
   * @param {Sha256} param.prevTxId 溯源txid (32bytes)
   * @param {number} param.outputIndex 溯源outputIndex (4bytes)
   * @param {number=} param.issueOutputIndex 溯源初始发起的Issue输出的outputIdx (4bytes)
   */
  setTxGenesisPart({ prevTxId, outputIndex, issueOutputIndex = 0 }) {
    this.ftGenesisPart =
      ScriptHelper.reverseEndian(prevTxId) +
      num2bin(outputIndex, DataLen4) +
      num2bin(issueOutputIndex, DataLen4);
  }

  /**
   *
   * @param {Object} param
   * @param {Sha256} param.prevTxId 溯源txid
   * @param {Ripemd160} param.outputIssuerPkh 初始化发行人Pkh
   * @param {number} param.tokenAmount 发行量
   */
  async makeTxGenesis({ prevTxId, outputIssuerPkh, tokenAmount }) {
    let pl = new PayloadFT({
      dataType: TRANSFER,
      ownerPkh: outputIssuerPkh,
      tokenAmount,
    });
    const newLockingScript = [
      this.ftCodePart,
      this.ftGenesisPart,
      pl.dump(),
    ].join(" ");
    // 创建有基本输入utxo的Tx模板
    let tx = ScriptHelper.createDummyPayByOthersTx(prevTxId);
    if (this.deploy) {
      // 如果是发布Tx，则需要用真实有余额的地址创建utxo
      tx = await ScriptHelper.createPayByOthersTx(ScriptHelper.dummyAddress);
    }
    let txnew = ScriptHelper.makeTx({
      tx: tx,
      inputs: [],
      outputs: [
        {
          satoshis: ScriptHelper.issueSatoshis,
          script: newLockingScript,
        },
      ],
    });
    txnew.change(ScriptHelper.dummyAddress).feePerKb(ScriptHelper.feeb * 1000);
    return txnew;
  }
}

module.exports = {
  FT,
  sighashType,
};
