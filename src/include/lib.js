import { tx, ownerAddress, ownerPrivateKey } from './common'

export function insertTx(database, event) {
    return new Promise((resolve, reject) => {
        database.query("INSERT INTO `tx`(`blockHash`, `blockNumber`, `transactionHash`, `transactionIndex`) VALUES(?, ?, ?, ?)", [event.blockHash, event.blockNumber, event.transactionHash, event.transactionIndex])
            .then((result) => {
                resolve(result.insertId)
            })
            .then((err) => {
                reject(err)
            })
    })
}

export function sleep(ms){
    return new Promise((resolve, reject) => {
        setTimeout(resolve,ms)
    })
}

export function sendRawTransaction(web3, rawTx, privateKey) {
    return new Promise((resolve, reject) => {
      web3.eth.getTransactionCount(rawTx.from, 'pending')
      .then((_nonce) => {
         _nonce = _nonce.toString(16)
         rawTx.nonce = '0x' + _nonce

         var transaction = new tx(rawTx)
         privateKey = Buffer.from(privateKey, 'hex')
         transaction.sign(privateKey)
         var serializedTx = '0x' + transaction.serialize().toString('hex')
         web3.eth.sendSignedTransaction(serializedTx, async (err, tx_hash) => {
             if(err) {
                 reject(err)
             } else {
                 resolve(tx_hash)
             }
         })
      })
      .catch((err) => {
        reject(err)
      })
    })
}

export function erc20transfer(web3, lib, database, contractAddress, from, to, amount) {
  return new Promise((resolve, reject) => {
    database.query('SELECT `privateKey` FROM `wallet` WHERE `address` = ?', [from])
        .then((result) => {
            if(result.length == 0) {
                reject(false)
            }
            var contract = new web3.eth.Contract([ { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ])

            var rawTx = {
                from: from,
                gasPrice: web3.utils.toHex(2500000000),
                gas: 1000000,
                to: contractAddress,
                data: contract.methods.transfer(to, amount).encodeABI()
            }
            lib.sendRawTransaction(web3, rawTx, result[0].privateKey)
            .then((transactionHash) => {
              resolve(true)
            })
            .catch((err) => {
              console.log(err)
              reject(err)
            })
        })
        .catch((err) => {
          return false
        })
      })
}

export function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
