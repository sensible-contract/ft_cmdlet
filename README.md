# sensible-ft-cmd

## 指引

    一个基于感应合约的FT发行工具
    目前支持的功能如下：
        创建FT ./ft-cmd genesis -h
        发行FT ./ft-cmd issue -h
        转移FT ./ft-cmd  transfer -h

## 安装

```
npm install
ft-cmd genesis -h
```

## 编译合约代码

```
npm run gen-desc # 编译合约代码
npm run watch    # 监听合约代码变更，自动编译合约代码
```

## 目录

<pre>
.
├── contract_scrypts                        # sCrypt合约脚本
│   ├── ft.scrypt                           # FT合约 
│   ├── payload_ft.scrypt                   # 解析、构造FT合约的数据部分
│   ├── rabin.scrypt                         
│   ├── satotx.scrypt                       # 签名器
│   └── util.scrypt                         
├── contract_jsons                          # sCrypt合约自动编译后的json文件
├── src                                     #
├── config.json                             # 配置文件

...
</pre>

## 主要用法

Usage: nft-cmd [command] [args]

Options:

    -v, --version  output the version number
    -h, --help     output usage information

Commands:
genesis 创建 FT
issue 发行 FT
transfer 转移 FT
help [cmd] display help for [cmd]

## 创建

Usage: ft-cmd genesis [options]

Options:

    --network <net>                       当前使用的网络 (main/test)
    --genesis_txid <genesisOutpointTxId>  一个未使用过的UTXO的txid
    --genesis_index <genesisOutpointIdx>  该UTXO所在的序号
    -h, --help                            output usage information

```
./ft-cmd genesis --network test --genesis_txid 85d788229f0ad3a2c54d284fbdf79f6ab89853c5b03bd19f775034b1426b3d5b --genesis_index 2
```

## 发行

Usage: nft-cmd issue [options]

Options:

    --network <net>         当前使用的网络 (main/test)
    --amount <tokenAmount>  发行数量
    -h, --help              output usage information

```
./ft-cmd issue --network test --amount 1000
```

## 转移

Usage: nft-cmd transfer [options]

Options:

    --network <net>           当前使用的网络 (main/test)
    --wif <senderWif>         发送者的WIF
    --addr <receiverAddress>  接收的地址
    --amount <tokenAmount>    发送的数量
    -h, --help                output usage information

例子

```
./ft-cmd transfer --network test --addr n2t8bMwAed8VYWgguos9XAXErzQxYgtg7g --wif cPwoKN8RXRAaEL6y3t6U8xU3VbcvqkpyXMVE1yQ6sAHhZzJcToi8 --amount 100

```

## 具体例子可查看

<a href="https://github.com/sensing-contract/BCP02-Fungible-Token/blob/master/deployments/ft_main_deploy_history.md">正式网部署历史</a>

<a href="https://github.com/sensing-contract/BCP02-Fungible-Token/blob/master/deployments/ft_test_deploy_history.md">测试网部署历史</a>

## 相关资源

https://github.com/sCrypt-Inc/boilerplate
