import NFT_Marketplace from '../artifacts/contracts/NFT_Marketplace.sol/NFT_Marketplace.json';
import { BigNumber, constants as etherConstants } from 'ethers';
import { buildNFTMetadata, contractMarketItemsToNFTList, uploadFileToIPFS } from './ipfs';
import { cidToTokenID } from './nft_contract';
import {
    ContractError,
    Failure,
    initiateContractReadConnection,
    initiateContractWriteConnection,
    isMetaMaskInstalled,
    MetaMaskNotInstalledError,
    TransactionResponse
    } from './contracts';
import { CU_MARKETPLACE_ADDRESS } from './CONTRACT_ADDRESSES';

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
    sold: boolean,
    timeBought: BigNumber,
    timeListed: BigNumber
};

// Consolidated ContractMarketItem
export type ContractMarketItemCondensed = {
    itemId: string,
    tokenId: string,
    owner: string,  // Set to seller if listed
    isListed: boolean,
    price: number,
    timeBought: BigNumber,
    timeListed: BigNumber
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
    price: number,
    timeBought: number,
    timeListed: number
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
        return {status: "Failure", error: (err as ContractError).message};
    }
}

// Gets Listing Fee
export const getListingFee = async (): Promise<{status: "Success", listingFee: number} | Failure> => {
    try {
        const {contract} = await initiateMarketplaceContractReadConnection();
        const listingFee = await contract.getListingFee();   
        return {status: "Success", listingFee: listingFee};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
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
        const transaction = await contract.mintAndCreateMarketItem(toAddress, tokenId, royaltyReciever, 
            royaltyValue, salePrice.toString(), Date.now(), Date.now());
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
    }
}

// Lists item on marketplace
const listMarketItem = async(marketItemId: string, tokenId: string, salePrice: BigNumber): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
        const transaction = await contract.listMarketItem(marketItemId, tokenId, salePrice, Date.now());
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
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
        const transaction = await contract.createMarketSale(itemId, tokenId, Date.now(), {value: price._hex});
        await transaction.wait();
        return {status: "Success"}
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
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
            timeBought: nft.timeBought,
            timeListed: nft.timeListed
        }));

        return {status: "Success", contractMarketItems: nfts};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
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
                timeBought: nft.timeBought,
                timeListed: nft.timeListed
            })
        });
        return {status: "Success", contractMarketItems: nfts};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
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
            timeBought: response.timeBought,
            timeListed: response.timeListed
        };
        return {status: "Success", contractMarketItems: [nft]};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
    }
}

// ETH <--> WEI Conversion
// -------------------------

const ethToWei = (eth: number): BigNumber => {
    return BigNumber.from(Math.round(eth * (10**ETH_PRECISION)))
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
): Promise<TransactionResponse> => {
    // Converts price to WEI
    const priceWei = ethToWei(price);

    // Uploads file to IPFS
    const fileCIDResp = await uploadFileToIPFS(nftFile);
    if(fileCIDResp.status === "Failure") {
        return fileCIDResp;
    }
    const fileCID = fileCIDResp.cid;

    // Creates NFT Metadata
    const nftMetadata = buildNFTMetadata({
        name: nftName, 
        description: nftDescription,
        image: fileCID.toString()
    });

    // Uploads Metadata to IPFS
    const metadataFile = new File([new Blob([nftMetadata], {type: 'application/json'})], 
        `${nftName.trim().split(' ').join('_')}_metadata.json`, {type: 'application/json'});
    const metadataCIDResp = await uploadFileToIPFS(metadataFile);
    if(metadataCIDResp.status === "Failure") {
        return metadataCIDResp;
    }
    const metadataCID = metadataCIDResp.cid;
    
    // Creates TokenID from CID
    const tokenID = cidToTokenID(metadataCID);

    // Mints
    const mintResp = await mintAndCreateMarketItem(address, tokenID, royaltyRecipient, royaltyAmount, priceWei);

    if(mintResp.status === "Success") {
        return {status: "Success"}
    } else {
        return mintResp;
    }
}

// Lists owned NFT on marketplace
export const listNFT = async (itemId: string, tokenId: string, price: number): Promise<TransactionResponse> => {
    // Converts price to WEI
    const priceWei = ethToWei(price);

    return await listMarketItem(itemId, tokenId, priceWei);
}

// Retrieving NFTs
// ----------------

// Builds user nft list containing user's nfts
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

// Returns N most recently listed NFTs
export const getRecentNFTListings = async (numNFTs: number = 20): Promise<NFTMarketItemsResponse> => {
    const recentNFTs: NFTMarketItem[] = [];

    // Gets MarketItems
    const listedMarketItemsResp = await fetchLiveListings();
    if(listedMarketItemsResp.status === "Failure") {
        return {status: "Failure", error: listedMarketItemsResp.error};
    }

    // Sorts by time listed
    const liveListings: ContractMarketItemCondensed[] = listedMarketItemsResp.contractMarketItems;
    liveListings.sort((nft1, nft2) => nft2.timeListed.toNumber() - nft1.timeListed.toNumber());

    // Converts to displayable NFTs
    const recentNFTsResp = await contractMarketItemsToNFTList(liveListings.slice(0, numNFTs));
    if(recentNFTsResp.status === "Failure") {
        return {status: "Failure", error: recentNFTsResp.error};
    }
    recentNFTs.push(...(recentNFTsResp.nftMarketItems));
    console.log(recentNFTs)

    return {status: "Success", nftMarketItems: recentNFTs};
}

// Buying NFTs
// ------------

export const purchaseNFT = async (itemId: string, tokenId: string, price: number): Promise<TransactionResponse> => {
    // Converts price to WEI
    const priceWei = ethToWei(price);

    return await completeMarketSale(itemId, tokenId, priceWei)
}

