import Web3 from "web3";
import CryptoJS from 'crypto-js'
import { Web3Storage, getFilesFromPath }  from 'web3.storage'
import {File} from '@web-std/file';
import { NFTStorage,Blob } from 'nft.storage'

//To generate a totally new account
const randomAccount = async () => {
  const _w = new Web3();
  return _w.eth.accounts.create();
}

//Recover account from privatekey
const seedToAccount = (seed:string) => {
  const _w = new Web3();
  return _w.eth.accounts.privateKeyToAccount(seed);
}

//Base encryption with CBC-Pkcs7
const aesEncrypt = (message:any, key:any) => {
  const iv = CryptoJS.enc.Utf8.parse(key);
  key = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(JSON.stringify(message)),key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return Buffer.from(encrypted.toString()).toString('base64');
}

//Base decryption with same method
const decryptByDES = (ciphertext:any, key:any) => {
  const iv = CryptoJS.enc.Utf8.parse(key);
  key = CryptoJS.enc.Utf8.parse(key);
  ciphertext=Buffer.from(ciphertext,"base64").toString()
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
});
  const ret = (decrypted.toString(CryptoJS.enc.Utf8)).split('"');
  return ret[1]
}

/**
 * BungaTool Class :
 * 
 * Path : 
 *  - Signature 
 * 
 * Function :
 *  - Use the signature as the privateKey of aes encryption/decryption
 */

export class BungaTools {
  signature: string;

  private constructor(_sig : string) {
    this.signature = _sig;
  }
  public static signWithPrivateKey(publicKey: string, privateKey: string): BungaTools {
    let account = seedToAccount(privateKey);
    return new BungaTools(account.sign(publicKey).signature);
  }

  public static encode(b:BungaTools,data:string): string {
    let s = b.signature;
    let _en = aesEncrypt(data,s);
    return _en
  }

  public static decode(b:BungaTools,data:string): string {
    let s = b.signature;
    let _en = decryptByDES(data,s);
    return _en
  }
}

export class BungaStorage {
  web3Storage: string;
  nftStorage: string;

  private constructor(_web : string , _nft : string) {
    this.web3Storage = _web;
    this.nftStorage = _nft;
  }

  public static init(_web : string , _nft : string): BungaStorage {
    return new BungaStorage(_web,_nft)
  }

  /**
   * [Upload the file to web3storage ]
   */

  public static async web3StorageCreate(b:BungaStorage,files:File[]): Promise<any> {
    const token =b.web3Storage;
    const client = new Web3Storage({ token })
    const cid = await client.put(files)
    return cid;
  }
  //Upload by Text ( Input as base64 text )
  public static async web3StorageCreateFromText(b:BungaStorage,data:string): Promise<any> {
    return await BungaStorage.web3StorageCreate(b,[new File([data], 'index')])
  }
  //Upload by File ( Input as File itself )
  public static async web3StorageCreateFromFile(b:BungaStorage,data:File): Promise<any> {
    return await BungaStorage.web3StorageCreate(b,[data])
  }

  //Upload to NFT ( Input as File itself )
  public static async web3StorageCreateToNft(b:BungaStorage,data:File,detail:any): Promise<any> {
    let cid = await BungaStorage.web3StorageCreate(b,[data]);
    return await BungaStorage.web3StorageCreate(b,[new File([JSON.stringify(
      {
        "name":detail.name,
        "description": detail.description,
        "image": "https://ipfs.io/ipfs/"+cid+"/index"
      }
    )], 'index')])
  }
  /**
   * [Upload the file to nftstorage ]
   */
  public static nftStorageCreate(b:BungaStorage): NFTStorage {
    const token =b.web3Storage;
    const client = new NFTStorage({ token })
    return client;
  }
  //Upload by Text ( Input as base64 text )
  public static async nftStorageCreateFromText(b:BungaStorage,data:string): Promise<any> {
    let c = BungaStorage.nftStorageCreate(b)
    return await c.storeBlob(new Blob([data]))
  }
  //Upload by File ( Input as File itself )
  public static async nftStorageCreateFromFile(b:BungaStorage,data:File): Promise<any> {
    let c = BungaStorage.nftStorageCreate(b)
    return await c.storeBlob(new Blob([data]))
  }
  //Upload to mint NFT ( Input as File itself )
  public static async nftStorageCreateToNft(b:BungaStorage,data:File,detail:any): Promise<any> {
    let c = BungaStorage.nftStorageCreate(b)
    return await c.store({
      name:detail.name,
      description: detail.description,
      image: data
    })
  }
}
