// Functions to Access Marketplace Contract
import NFT_Marketplace from '../artifacts/contracts/NFT_Marketplace.sol/NFT_Marketplace.json';
import { CU_MARKETPLACE_ADDRESS } from './CONTRACT_ADDRESSES';
import {
    Failure,
    initiateContractReadConnection,
    initiateContractWriteConnection,
    isMetaMaskInstalled,
    MetaMaskNotInstalledError,
    TransactionResponse
} from './contracts';

// Type Declarations
// -------------------

export type MarketItem = {
    itemId: string,
    tokenId: string,
    seller: string,
    owner: string,
    price: number,
    sold: boolean
};

export type MarketItemResposne = {
    status: "Success", marketItems: MarketItem[]
} | Failure;

// NFT Marketplace Contract
// --------------------------

// Connects to NFT Contract (Read)
const initiateMarketplaceContractReadConnection = async () => {
    return initiateContractReadConnection(CU_MARKETPLACE_ADDRESS, NFT_Marketplace.abi);
}

// Connects to NFT Contract (Write)
const initiateMarketplaceContractWriteConnection = async () => {
    return initiateContractWriteConnection(CU_MARKETPLACE_ADDRESS, NFT_Marketplace.abi);
}

// Updates Listing Fee
// Fee is percentage of sale price (200 = 2% of sale price)
export const updateListingFee = async (newFeePercentage: number): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const transaction = await contract.updateListingFee(newFeePercentage);
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets Listing Fee
export const getListingFee = async (): Promise<{status: "Success", listingFee: number} | Failure> => {
    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const listingFee = await contract.getListingFee();   
        return {status: "Success", listingFee: listingFee};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Creates Marketplace Item
// Will only list item if price > 0, otherwise will just add info to marketplace
export const createMarketItem = async(tokenId: string, salePrice: number): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const transaction = await contract.createMarketItem(tokenId, salePrice);
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Lists item on marketplace
export const listMarketItem = async(marketItemId: string, tokenId: string, salePrice: number): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const transaction = await contract.listMarketItem(marketItemId, tokenId, salePrice);
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets all active marketplace listings
export const fetchLiveListings = async(): Promise<MarketItemResposne> => {
    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const marketItems = await contract.fetchMarketItems();   
        return {status: "Success", marketItems: marketItems};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets user's NFTs
export const fetchUsersNFTs = async(): 
        Promise<{status: "Success", nfts: {itemId: string, tokenId: string}[]} | Failure> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const response: MarketItem[] = await contract.fetchMyNFTs();
        const nfts = response.map((nft: MarketItem) => ({
            itemId: nft.itemId,
            tokenId: nft.tokenId
        }));
        return {status: "Success", nfts: nfts};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets NFTs listed by user
// Gets user's NFTs
export const fetchItemsListed = async(): 
        Promise<{status: "Success", nfts: {itemId: string, tokenId: string, price: number}[]} | Failure> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const response: MarketItem[] = await contract.fetchMyNFTs();
        const nfts = response.map((nft: MarketItem) => ({
            itemId: nft.itemId,
            tokenId: nft.tokenId,
            price: nft.price
        }));
        return {status: "Success", nfts: nfts};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}
