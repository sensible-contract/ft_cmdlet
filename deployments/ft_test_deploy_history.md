#找一个未使用的 UTXO 作为根节点
./ft-cmd genesis --network test --genesis_txid 85d788229f0ad3a2c54d284fbdf79f6ab89853c5b03bd19f775034b1426b3d5b --genesis_index 2

#发行 1000 个代币到 config 的私钥地址 A
./ft-cmd issue --network test --amount 1000
执行结果：https://test.whatsonchain.com/tx/577b6d62db9d93843275afa9c4a8431361660533e24f395a0942f634cb735c6f

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 100
执行结果：https://test.whatsonchain.com/tx/4cc2115dfd864a74ab21f8a347b764158ff5fa53760ff01df96e2b82e5869fb7

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 200
执行结果：https://test.whatsonchain.com/tx/921ccd9f03eea236322df06be74fcc5614a579f5f4117583d7590fb480630c6f

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 300
执行结果：https://test.whatsonchain.com/tx/c3ba552d5749c81900a146b9480bb5949e13fc44cd4f8c9ca105040de24b608a

./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 400
执行结果：https://test.whatsonchain.com/tx/248319dc5686d27ffa28402a2cd9d8c1bfdc92b641b34f54d392cff5e4b66ce4
