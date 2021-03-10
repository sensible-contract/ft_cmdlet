#找一个未使用的 UTXO 作为根节点
./ft-cmd genesis --network test --genesis_txid 85d788229f0ad3a2c54d284fbdf79f6ab89853c5b03bd19f775034b1426b3d5b --genesis_index 2

#发行 1000 个代币到 config 的私钥地址 A
./ft-cmd issue --network test --amount 1000

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 100

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 200

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 300

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 400
