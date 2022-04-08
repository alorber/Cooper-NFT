import NFT_Marketplace from '../artifacts/contracts/NFT_Marketplace.sol/NFT_Marketplace.json';
import { BigNumber } from 'ethers';
import { buildNFTMetadata, uploadFileToIPFS } from './ipfs';
import { cidToTokenID } from './nft_contract';
import { CU_MARKETPLACE_ADDRESS } from './CONTRACT_ADDRESSES';
import {
    Failure,
    initiateContractReadConnection,
    initiateContractWriteConnection,
    isMetaMaskInstalled,
    MetaMaskNotInstalledError,
    TransactionResponse
    } from './contracts';

// Functions to Access Marketplace Contract

// Type Declarations
// -------------------

// MarketItem type used in smart contract
export type ContractMarketItem = {
    itemId: string,
    tokenId: string,
    seller: string,
    owner: string,
    price: number,
    sold: boolean
};

// Consolidated ContractMarketItem
export type ContractMarketItemCondensed = {
    itemId: string,
    tokenId: string,
    owner: string,  // Set to seller if listed
    isListed: boolean,
    price: number
}

export type ContractMarketItemCondensedResponse = {
    status: "Success", contractMarketItems: ContractMarketItemCondensed[]
} | Failure;

// Displayable MarketItem (after NFT has been retrieved from IPFS)
export type NFTMarketItem = {
    name: string,
    description: string,
    file: File,
    itemId: string,
    tokenId: string,
    owner: string,
    isListed: boolean,
    price: number
}

export type NFTMarketItemsResponse = {
    status: "Success", nftMarketItems: NFTMarketItem[]
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

// Mints NFT & Creates Marketplace Item
// Will only list item if price > 0, otherwise will just add info to marketplace
const mintAndCreateMarketItem = async(toAddress: string, tokenId: string, royaltyReciever: string,
        royaltyValue: number, salePrice: BigNumber): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const transaction = await contract.mintAndCreateMarketItem(toAddress, tokenId, royaltyReciever, royaltyValue, salePrice.toString());
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

// Gets all active marketplace listings (can filter to those listed by user)
const fetchLiveListings = async (userOnly: boolean): Promise<ContractMarketItemCondensedResponse> => {
    // Checks MetaMask Install
    if (userOnly && !isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const response: ContractMarketItem[] = userOnly ? (
            await contract.fetchMyNFTS()
        ) : (
            await contract.fetchMarketItems()
        );   
        const nfts = response.map((nft: ContractMarketItem) => ({
            itemId: nft.itemId,
            tokenId: nft.tokenId,
            owner: nft.seller,
            isListed: true,
            price: nft.price,
        }));

        return {status: "Success", contractMarketItems: nfts};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets user's NFTs
const fetchUsersUnlistedNFTs = async (): Promise<ContractMarketItemCondensedResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const response: ContractMarketItem[] = await contract.fetchMyNFTs();
        const nfts = response.map((nft: ContractMarketItem) => ({
            itemId: nft.itemId,
            tokenId: nft.tokenId,
            owner: nft.owner,
            isListed: false,
            price: 0,
        }));
        return {status: "Success", contractMarketItems: nfts};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Minting & Listing NFTs
// ------------------------

// Mints NFT and adds it to marketplace
export const createNFT = async(
    nftFile: File,
    nftName: string,
    nftDescription: string,
    royaltyAmount: number,
    royaltyRecipient: string,
    price: BigNumber,
    address: string
) => {
    // Uploads file to IPFS
    console.log("Uploading file to IPFS....");
    const fileCID = await uploadFileToIPFS(nftFile);
    console.log("SUCCESS: File uploaded with CID ", fileCID.toString());

    // Creates NFT Metadata
    console.log("\nCreating NFT Metadata...");
    const nftMetadata = buildNFTMetadata({
        name: nftName, 
        description: nftDescription,
        image: fileCID.toString()
    });
    console.log("SUCCESS: NFT metadata created")
    console.log(nftMetadata)

    // Uploads Metadata to IPFS
    console.log("\nUploading Metadata to IPFS...");
    const metadataFile = new File([new Blob([nftMetadata], {type: 'application/json'})], 
        `${nftName.trim().split(' ').join('_')}_metadata.json`, {type: 'application/json'});
    const metadataCID = await uploadFileToIPFS(metadataFile);
    console.log("SUCCESS: Metadata uploaded with CID ", metadataCID.toString());
    
    // Creates TokenID
    console.log("\nCreating TokenID from CID...");
    const tokenID = cidToTokenID(metadataCID);
    console.log("SUCCESS: Created tokenID ", tokenID);

    // Mints
    console.log("\nMinting Token...")
    const mintResp = await mintAndCreateMarketItem(address, tokenID, royaltyRecipient, royaltyAmount, price);

    if(mintResp.status === "Success") {
        console.log("SUCCESS: Successfully Minted Token")
    } else {
        console.log("Error Minting Token: ", mintResp.error)
        return;
    }
}
