#找一个未使用的 UTXO 作为根节点
./ft-cmd genesis --network main --genesis_txid 8e03e18b30a5cae7469e85c3de7de618e1d38f6b6ece2bc00fd0d82c7ad79407 --genesis_index 3

#发行 1000 个代币到 config 的私钥地址 A
./ft-cmd issue --network main --amount 1000

./ft-cmd transfer --network main --addr 13335319kGFUFXta9MajEismCaw7cbmj79 --wif L3rS5CwV2TN7WYW89GX41XYRURnrRXtVqGCABfVBJnNNXX2e6Dm1 --amount 100

<!-- ./ft-cmd transfer --network main --addr 13335319kGFUFXta9MajEismCaw7cbmj79 --wif L3rS5CwV2TN7WYW89GX41XYRURnrRXtVqGCABfVBJnNNXX2e6Dm1 --amount 200

./ft-cmd transfer --network main --addr 13335319kGFUFXta9MajEismCaw7cbmj79 --wif L3rS5CwV2TN7WYW89GX41XYRURnrRXtVqGCABfVBJnNNXX2e6Dm1 --amount 300

./ft-cmd transfer --network main --addr 13335319kGFUFXta9MajEismCaw7cbmj79 --wif L3rS5CwV2TN7WYW89GX41XYRURnrRXtVqGCABfVBJnNNXX2e6Dm1 --amount 400 -->
