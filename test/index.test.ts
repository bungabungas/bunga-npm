import { BungaTools ,BungaStorage} from "../src";
import { config } from "./config";

test("test web3.storage",async () => {
  let c = config.get()
  let b = BungaTools.signWithPrivateKey(c.publicKey,c.privateKey);
  let encodeData = BungaTools.encode(b,c.web3StorageAuthKey);
  console.log("🔥Encode Data :",encodeData);
  let decodeData = BungaTools.decode(b,encodeData);
  console.log("🔥Decode Data :",decodeData);
  let upLoadData = Buffer.from(
    JSON.stringify(
      {
        "time":Date.now(),
        "data":Buffer.from(
          `
          ## About this shit : 

          **This information is to try storage things in IPFS to make sure this idea works**

          ### How this work ? 

          - Deploy it into IPFS , just it . 
          `
        ).toString("base64")
      }
    )
  ).toString("base64")
  console.log("🔥Pre-upload Data : ",upLoadData)
  let cid = await BungaStorage.web3StorageCreateFromText(
    BungaStorage.init(decodeData,""),
    upLoadData
  )
  console.log("🔥Final Upload Hash : ", cid);
  console.log("🔥Link:","https://ipfs.io/ipfs/"+cid+"/index")
})

test("test nft.storage",async () => {
  let c = config.get()
  let b = BungaTools.signWithPrivateKey(c.publicKey,c.privateKey);
  let encodeData = BungaTools.encode(b,c.nftStorageAuthKey);
  console.log("🔥Encode Data :",encodeData);
  let decodeData = BungaTools.decode(b,encodeData);
  console.log("🔥Decode Data :",decodeData);

  let upLoadData = Buffer.from(
    JSON.stringify(
      {
        "time":Date.now(),
        "data":Buffer.from(
          `
          ## About this shit : 

          **This information is to try storage things in IPFS to make sure this idea works**

          ### How this work ? 

          - Deploy it into IPFS , just it . 
          `
        ).toString("base64")
      }
    )
  ).toString("base64")
  console.log("🔥Pre-upload Data : ",upLoadData)
  let cid = await BungaStorage.nftStorageCreateFromText(
    BungaStorage.init(decodeData,""),
    upLoadData
  )
  console.log("🔥Final Upload Hash : ", cid);
})