// @ts-ignore
const db = require("../../db");
const fs = require("fs");
const path = require("path");
class UtxoManager {
  static initGenesis(genesis_txid, genesis_index) {
    for (var id in db) {
      delete db[id];
    }
    db.genesis_txid = genesis_txid;
    db.genesis_index = genesis_index;
    this._save();
  }

  static getGenesis() {
    return {
      genesis_txid: db.genesis_txid,
      genesis_index: db.genesis_index,
    };
  }

  static getUtxos(address) {
    // return [
    //   {
    //     preTxId:
    //       "b6fb251123b839918726cea6459aff861ffb59901e8f1abda434020fc6056ee7",
    //     preOutputIndex: 2,
    //     txId: "0532fbfe6136dde078de6646586e7c539547d3aea747813c973c23ca07c17f0c",
    //     outputIndex: 0,
    //     tokenAmount: 1000,
    //   },
    // ];
    let utxos = db[address] || [];
    return utxos;
  }

  static saveUtxos(address, utxos) {
    db[address] = utxos;
    this._save();
  }

  static _save() {
    fs.writeFileSync(path.join(__dirname, "../../db.json"), JSON.stringify(db));
  }
}

module.exports = {
  UtxoManager,
};
