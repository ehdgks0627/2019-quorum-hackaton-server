import net from 'net'
import Web3 from 'web3'
export default new Web3(new Web3.providers.IpcProvider('/bck/geth/geth.ipc', net))
