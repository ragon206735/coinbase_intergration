//import { encrypt } from '@metamask/eth-sig-util';
import axiosHttp from 'api'
import { useWeb3Auth } from 'context/web3Auth';
const ascii85 = require('ascii85');

export default () => {

    const { chainId, account, provider } = useWeb3Auth()

    const getPublicKey  = async () => {
        if(provider) {
            /* @ts-ignore */
            const keyB64 = await provider.send("eth_getEncryptionPublicKey",[account]);
            const publicKey = Buffer.from(keyB64, 'base64');
            return publicKey
        }
        return null
    }

    const encryptMessage = async (message: string) => {
        const publicKey = await getPublicKey()
        if(publicKey) {
          const response = await axiosHttp.post(`utility/encrypt`, { publicKey:  publicKey.toString('base64'), data: ascii85.encode(message).toString() })
          console.log(response.data.message)
          if(response && response?.data?.message)
            return response?.data?.message
        }
        return null
    }

    const decryptMessage = async (message: string) => {
      try {
        if(provider) {
          /* @ts-ignore */
          const decrypt = await provider?.send("eth_decrypt",[message, account]);
          return JSON.parse(new TextDecoder("utf-8").decode(ascii85.decode(decrypt)));
        }
        return null;
      } catch (e) {
        console.log(e)
      }
    }

    return { encryptMessage, decryptMessage }
}