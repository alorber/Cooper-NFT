import { ethers } from 'ethers';
import { CU_MARKETPLACE_ADDRESS} from './CONTRACT_ADDRESSES';
import NFTMarketplace from '../artifacts/contracts/NFT_Marketplace.sol/NFT_Marketplace.json';

declare let window: any;

export type Failure = {
  status: "Failure",
  error: string
};

export type TransactionResponse = {
  status: "Success"
} | Failure;


const NFTMarketplaceError: Failure = {status: "Failure", error: "NFT marketplace window.ethereum not working"};




type NFTContractReadConnectionResponse = {
  provider: ethers.providers.Web3Provider,
  contract: ethers.Contract   
};

type NFTContractWriteConnectionResponse = {
  signer: ethers.providers.JsonRpcSigner
} & NFTContractReadConnectionResponse;

// NFT Marketplace
// -------------

// Connects to Marketplace Contract (Read)
const initiateMarketplaceContractReadConnection = async (): Promise<NFTContractReadConnectionResponse> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(CU_MARKETPLACE_ADDRESS, NFTMarketplace.abi, provider);
  return {provider, contract};
}

// Connects to Marketplace Contract (Write)
const initiateMarketplaceContractWriteConnection = async (): Promise<NFTContractWriteConnectionResponse> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CU_MARKETPLACE_ADDRESS, NFTMarketplace.abi, signer);
  return {provider, signer, contract};
}



//create two tokens
export const creatingTwoTokens = async (address: string): Promise<TransactionResponse> => {
  if(window.ethereum) {
      const {contract} = await initiateMarketplaceContractWriteConnection();
      try {

        let listingPrice = await contract.getListingPrice()
        let listingPrice1 = listingPrice.toString()
        const auctionPrice = ethers.utils.parseUnits('1', 'ether')

        await contract.createToken("https://www.mytokenlocation.com", auctionPrice, { value: listingPrice1 })
        await contract.createToken("https://www.mytokenlocation2.com", auctionPrice, { value: listingPrice1 })
    
        return {status: "Success"};
      }catch(err: any) {
          return {status: "Failure", error: err}
      }
  } else {
      return NFTMarketplaceError;
  }
}


//executing sale of token to another user
export const creatingMarketSale = async (address: string): Promise<TransactionResponse> => {
  if(window.ethereum) {
      const {contract} = await initiateMarketplaceContractWriteConnection();
      try {
        const [_, buyerAddress] = await contract.getSigner()
        const auctionPrice = ethers.utils.parseUnits('1', 'ether')
        await contract.connect(buyerAddress).createMarketSale(1, { value: auctionPrice })

        return {status: "Success"};
      }catch(err: any) {
          return {status: "Failure", error: err}
      }
  } else {
      return NFTMarketplaceError;
  }
}


//resell a token 
export const resellToken = async (address: string): Promise<TransactionResponse> => {
  if(window.ethereum) {
      const {contract} = await initiateMarketplaceContractWriteConnection();
      try {
        let listingPrice = await contract.getListingPrice()
        let listingPrice1 = listingPrice.toString()
        const auctionPrice = ethers.utils.parseUnits('1', 'ether')
        const [_, buyerAddress] = await contract.getSigner()

        await contract.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice1 })

        return {status: "Success"};
      }catch(err: any) {
          return {status: "Failure", error: err}
      }
  } else {
      return NFTMarketplaceError;
  }
}


//query for and return the unsold items
export const getUnsoldItems = async (address: string): Promise<TransactionResponse> => {
  if(window.ethereum) {
      const {contract} = await initiateMarketplaceContractReadConnection();
      try {

        const items = await contract.fetchMarketItems()
        const items1 = await Promise.all(items.map(async (i:any) => {
          const tokenUri = await contract.tokenURI(i.tokenId)
          const item = {
            price: i.price.toString(),
            tokenId: i.tokenId.toString(),
            seller: i.seller,
            owner: i.owner,
            tokenUri
          }
          return item
        }))
        console.log('items: ', items1)

        return {status: "Success"};

      }catch(err: any) {
          return {status: "Failure", error: err}
      }
  } else {
      return NFTMarketplaceError;
  }
}








