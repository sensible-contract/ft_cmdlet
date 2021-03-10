#找一个未使用的 UTXO 作为根节点
./ft-cmd genesis --network test --genesis_txid a2b22435c62a482fc174346816dbac3a30a573a714193173696669c7e56254dc --genesis_index 1

#发行 1000 个代币到 config 的私钥地址 A
./ft-cmd issue --network test --amount 1000
执行结果：https://test.whatsonchain.com/tx/f1b89bcea8e484cc6e36b745654ef2dc79f5e229430fea9434bbb8adccf2dbe1
当前 FT-UTXO：1000

./ft-cmd transfer --network test --addr mi8FVGKwN4k2Haj9WitdGx3Z3X6N5S8ivy --wif cSDMbQJBpAXHXEYMiikbZBq3ogpgpdX5bdpKc32JDafrAx7NJKAw --amount 100
执行结果：https://test.whatsonchain.com/tx/6ad6c8920e00d84690408a3dd83962487648bf37d7924554da1b92cb6cae7a3d
当前 FT-UTXO：900、100

./ft-cmd transfer --network test --addr mi8FVGKwN4k2Haj9WitdGx3Z3X6N5S8ivy --wif cSDMbQJBpAXHXEYMiikbZBq3ogpgpdX5bdpKc32JDafrAx7NJKAw --amount 200
执行结果：https://test.whatsonchain.com/tx/feadf0770a1ce50b44df3ff5873b5251bedacbed3089233743c3431b2cf80c17
当前 FT-UTXO：700、200、100

./ft-cmd transfer --network test --addr mi8FVGKwN4k2Haj9WitdGx3Z3X6N5S8ivy --wif cSDMbQJBpAXHXEYMiikbZBq3ogpgpdX5bdpKc32JDafrAx7NJKAw --amount 300
执行结果：https://test.whatsonchain.com/tx/5cf4f626169949890053dfdb32e3dd91b8e0c85a3ffc36b634077b43b380789e
当前 FT-UTXO：400、300、200、100

./ft-cmd transfer --network test --addr mi8FVGKwN4k2Haj9WitdGx3Z3X6N5S8ivy --wif cSDMbQJBpAXHXEYMiikbZBq3ogpgpdX5bdpKc32JDafrAx7NJKAw --amount 950
执行结果：https://test.whatsonchain.com/tx/1276c6d89b32f878e112946351a2e5d2625ac9063d891162b5b792a88bdfc260
当前 FT-UTXO：950、50
