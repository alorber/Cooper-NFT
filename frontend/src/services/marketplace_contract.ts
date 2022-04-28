import NFT_Marketplace from '../artifacts/contracts/NFT_Marketplace.sol/NFT_Marketplace.json';
import { BigNumber, constants as etherConstants } from 'ethers';
import { buildNFTMetadata, contractMarketItemsToNFTList, uploadFileToIPFS } from './ipfs';
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
    itemId: BigNumber,
    tokenId: BigNumber,
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

export type ContractMarketItemsCondensedResponse = {
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

export type NFTMarketItemResponse = {
    status: "Success",
    nftMarketItem: NFTMarketItem
} | Failure;

export type NFTMarketItemsResponse = {
    status: "Success", 
    nftMarketItems: NFTMarketItem[]
} | Failure;

// Number of decimal points precision when displaying sale price in ETH
export const ETH_PRECISION = 10;

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
const listMarketItem = async(marketItemId: string, tokenId: string, salePrice: number): Promise<TransactionResponse> => {
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

// Purchses item on marketplace
const completeMarketSale = async (itemId: string, tokenId: string, price: BigNumber): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const transaction = await contract.createMarketSale(itemId, tokenId, {value: price._hex});
        await transaction.wait();
        return {status: "Success"}
    } catch(err: any) {
        console.log(err)
        return {status: "Failure", error: err};
    }
}

// Gets all active marketplace listings
const fetchLiveListings = async (): Promise<ContractMarketItemsCondensedResponse> => {
    
    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const response: ContractMarketItem[] = await contract.fetchMarketItems();

        const nfts = response.map((nft: ContractMarketItem) => ({
            itemId: nft.itemId._hex,
            tokenId: nft.tokenId._hex,
            owner: nft.seller,
            isListed: true,
            price: weiToEth(nft.price),
        }));

        return {status: "Success", contractMarketItems: nfts};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets user's NFTs
const fetchUsersNFTs = async (): Promise<ContractMarketItemsCondensedResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const response: ContractMarketItem[] = await contract.fetchMyNFTs();
        const nfts = response.map((nft: ContractMarketItem) => {
            const isListed = nft.seller !== etherConstants.AddressZero;
            return ({
                itemId: nft.itemId._hex,
                tokenId: nft.tokenId._hex,
                owner: isListed ? nft.seller : nft.owner,
                isListed: isListed,
                price: isListed ? weiToEth(nft.price) : 0,
            })
        });
        return {status: "Success", contractMarketItems: nfts};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// Gets NFT by ItemId
const fetchNFTByItemId = async (itemId: string): Promise<ContractMarketItemsCondensedResponse> => {
    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const response: ContractMarketItem = await contract.fetchNFTByItemId(itemId);
        const isListed = response.seller !== etherConstants.AddressZero;
        const nft: ContractMarketItemCondensed = {
            itemId: response.itemId._hex,
            tokenId: response.tokenId._hex,
            owner: isListed ? response.seller : response.owner,
            isListed: isListed,
            price: isListed ? weiToEth(response.price) : 0,
        };
        return {status: "Success", contractMarketItems: [nft]};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
}

// ETH <--> WEI Conversion
// -------------------------

const ethToWei = (eth: number): BigNumber => {
    return BigNumber.from(eth * (10**ETH_PRECISION))
        .mul(etherConstants.WeiPerEther)
        .div(10**ETH_PRECISION);
}

const weiToEth = (wei: BigNumber | number): number => {
    const price = typeof wei === 'number' ? (
        BigNumber.from(wei)
    ) : (
        wei
    );

    return price.mul(10**ETH_PRECISION)
        .div(etherConstants.WeiPerEther)
        .toNumber() / (10**ETH_PRECISION);
}

// Minting & Listing NFTs
// ------------------------

// Mints NFT and adds it to marketplace
// Price in ETH
export const createNFT = async(
    nftFile: File,
    nftName: string,
    nftDescription: string,
    royaltyAmount: number,
    royaltyRecipient: string,
    price: number,
    address: string
) => {
    // Converts price to WEI
    const priceWei = ethToWei(price);

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
    const mintResp = await mintAndCreateMarketItem(address, tokenID, royaltyRecipient, royaltyAmount, priceWei);

    if(mintResp.status === "Success") {
        console.log("SUCCESS: Successfully Minted Token")
    } else {
        console.log("Error Minting Token: ", mintResp.error)
        return;
    }
}

// Retrieving NFTs
// ----------------

// Builds user nft list containing one or both of: 1) User's listed NFTs 2) User's unlisted NFTs
export const buildUserNFTList = async (): Promise<NFTMarketItemsResponse> => {
    // Builds list of user's NFTs
    const usersNFTs: NFTMarketItem[] = [];

    // Gets MarketItems
    const usersMarketItemsResp = await fetchUsersNFTs();
    if(usersMarketItemsResp.status === "Failure") {
        return {status: "Failure", error: usersMarketItemsResp.error};
    }

    // Converts to displayable NFTs
    const userNftsResp = await contractMarketItemsToNFTList(usersMarketItemsResp.contractMarketItems);
    if(userNftsResp.status === "Failure") {
        return {status: "Failure", error: userNftsResp.error};
    }
    
    usersNFTs.push(...(userNftsResp.nftMarketItems));

    return {status: "Success", nftMarketItems: usersNFTs};
}

// Builds list of all live NFT listings
export const buildLiveNFTList = async (): Promise<NFTMarketItemsResponse> => {
    const listedNFTs: NFTMarketItem[] = [];

    // Gets MarketItems
    const listedMarketItemsResp = await fetchLiveListings();
    if(listedMarketItemsResp.status === "Failure") {
        return {status: "Failure", error: listedMarketItemsResp.error};
    }

    // Converts to displayable NFTs
    const listedNftsResp = await contractMarketItemsToNFTList(listedMarketItemsResp.contractMarketItems);
    if(listedNftsResp.status === "Failure") {
        return {status: "Failure", error: listedNftsResp.error};
    }
    listedNFTs.push(...(listedNftsResp.nftMarketItems));

    return {status: "Success", nftMarketItems: listedNFTs};
}

// Retrieves NFT by Item Id & converts to displayable format
export const getNFTbyItemId = async (itemId: string): Promise<NFTMarketItemResponse> => {
    // Gets MarketItem
    const marketItemsResp = await fetchNFTByItemId(itemId);
    if(marketItemsResp.status === "Failure") {
        return {status: "Failure", error: marketItemsResp.error};
    }

    // Converts to displayable NFTs
    const nftsResp = await contractMarketItemsToNFTList(marketItemsResp.contractMarketItems);
    if(nftsResp.status === "Failure") {
        return {status: "Failure", error: nftsResp.error};
    }

    const nft = nftsResp.nftMarketItems[0];

    return {status: "Success", nftMarketItem: nft};
}

// Buying NFTs
// ------------

export const purchaseNFT = async (itemId: string, tokenId: string, price: number): Promise<TransactionResponse> => {
    // Converts price to WEI
    const priceWei = ethToWei(price);

    return await completeMarketSale(itemId, tokenId, priceWei)
}

