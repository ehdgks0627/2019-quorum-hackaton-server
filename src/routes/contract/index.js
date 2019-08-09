import { express, tx, Database, web3, lib, apicache } from '../../include/common'
import crypto from 'crypto'

class MemberRouter {
  constructor() {
    this.router = express.Router()
    this.database = new Database()
    this._listen()
  }

  _listen() {
    this.router.post('/join', (req, res, next) => {
      this.database.query("SELECT COUNT(*) as `exist` FROM `member` WHERE `user` = ?", [req.body.email])
      .then((result) => {
        if(result[0].exist) {
          res.send({ok: false, err_msg: 'ID Already Exists'})
          return
        }
        crypto.randomBytes(32, (err, buffer) => {
          var password_salt = buffer.toString('hex')
          var password = crypto.createHmac('sha512', password_salt)
                     .update(req.body.password)
                     .digest('hex')
          var account = web3.eth.accounts.create()
          this.database.query("INSERT INTO `member`(`user`, `password`, `password_salt`, `name`, `address`) VALUES(?, ?, ?, ?, ?)",
          [req.body.email, password, password_salt, req.body.name, account.address])
          .then((result) => {
            this.database.query("INSERT INTO `wallet`(`address`, `privateKey`) VALUES(?, ?)",
            [account.address, account.privateKey.substr(2)])
            .then((result) => {
              // TODO send transaction
              web3.eth.sendTransaction({from: "0x574d543663d57495b904910880ad044f88098eb1", to: account.address, value: "10000000000000000000"}, (err, tx_hash) => {
                if(err) {
                  res.send({ok: false})
                } else {
                  res.send({ok: true})
                }
              })
            })
          })
        })
      })
    })

    this.router.post('/login', (req, res, next) => {
      this.database.query("SELECT `address`, `password`, `password_salt` FROM `member` WHERE `user` = ?", [req.body.email])
      .then((result) => {
        if(result.length !== 1) {
          res.send({ok: false})
          return
        }
        var password = crypto.createHmac('sha512', result[0].password_salt)
                   .update(req.body.password)
                   .digest('hex')

        if(result[0].password === password) {
          req.session.address = result[0].address
          var key = lib.makeid(64)
          res.send({ok: true, d: key})
        } else {
          res.send({ok: false})
        }
      })
    })

    this.router.get('/check', (req, res, next) => {
        if (result) {
            req.session.address = result
            res.send({ok: true})
        } else {
            res.send({ok: false})
        }
      })
  }
}

export default MemberRouter
