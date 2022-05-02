import { base16 } from 'multiformats/bases/base16';
import { CID, create as ipfsHttpClient } from 'ipfs-http-client';
import { ContractMarketItemCondensed, NFTMarketItem, NFTMarketItemsResponse } from './marketplace_contract';
import { Failure, TransactionResponse } from './contracts';
import { FileExtension, fromBuffer, MimeType } from 'file-type';
import { getNFTuri } from './nft_contract';
import { IPFS_PROJECT_ID, IPFS_PROJECT_SECRET } from './IPFS_AUTH';

// Type Declarations
// -------------------

export type NFTMetadata = {
    name: string,
    description: string,
    image: string
}

export type IpfsCidResponse = {
    status: "Success",
    cid: CID
} | Failure;

export type IpfsMetadataResponse = {
    status: "Success",
    metadata: NFTMetadata
} | Failure;

export type IpfsNftResponse = {
    status: "Success",
    file: File
} | Failure;

// Creates Auth Header
const authHeader = 'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64');

// Creates IPFS Client
const client = ipfsHttpClient({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
        authorization: authHeader,
    },
});

// Uploads file to IPFS & returns CID
export const uploadFileToIPFS = async (file: File, hash: string = 'blake2b-208'): Promise<IpfsCidResponse> => {
    try {
        const addedFile = await client.add(file, {cidVersion: 1, hashAlg: hash, pin: true, wrapWithDirectory: false});
        return {status: "Success", cid: addedFile.cid};
    } catch(err: any) {
        return {status: "Failure", error: 'Error: Unable to add file to IPFS'};
    }
}

// Converts CID to base 16
export const cidToBase16 = (cid: CID) => {
    return cid.toString(base16);
}

// Builds metadata
export const buildNFTMetadata = (data: NFTMetadata) => {
    return JSON.stringify(data);
}

// Retrieves Metadata from IPFS
export const getMetadataFromIPFS = async (uri: string): Promise<IpfsMetadataResponse> => {
    try {
        const decoder = new TextDecoder();
        let decodedMetadata = '';
        for await (const chunk of client.cat(uri)) {
            decodedMetadata += decoder.decode(chunk);
        }
        return {status: "Success", metadata: JSON.parse(decodedMetadata)};
    } catch(err: any) {
        return {status: "Failure", error: 'Error: Unable to retrieve metadata from IPFS'};
    }
    
}

// Retrieves Metadata from IPFS
export const getNftFromIPFS = async(uri: string, fileName: string = 'a'): Promise<IpfsNftResponse> => {
    try {
        // Determines file type
        let fileType: {ext: FileExtension, mime: MimeType} | undefined = undefined;
        for await(const chunk of client.cat(uri, {length: 100})) {
            fileType = await fromBuffer(chunk);
        }
        // Assume image if trouble determining
        if(fileType === undefined) {
            fileType = {ext: 'jpg', mime: 'image/jpeg'};
        }
        
        // Retrieves file
        let blobs: Blob[] = [];
        for await (const chunk of client.cat(uri)) {
            blobs.push(new Blob([chunk]))
        }
        const file = new File(blobs, `${fileName}.${fileType?.ext}`, {type: fileType.mime});
        return {status: "Success", file: file}
    } catch(err: any) {
        return {status: "Failure", error: "Error: Unable to retrieve NFT from IPFS"};
    }
}

// Uses IPFS to convert contract MarketItems to displayable NFTs
export const contractMarketItemsToNFTList = async (contractMarketItems: ContractMarketItemCondensed[]): Promise<NFTMarketItemsResponse>  => {
    // Keeps track of errors
    const errorCount = {getNFTuriError: 0, getMetadataFromIPFSError: 0, getNftFromIPFSError: 0};

    const nftMarketItems: NFTMarketItem[] = [];
    for(let contractMarketItem of contractMarketItems) {
        // Gets nft metadata URI
        const tokenURIResp = await getNFTuri(contractMarketItem.tokenId);
        if(tokenURIResp.status === 'Failure') {
            console.log("ERROR: ", tokenURIResp.error);
            errorCount.getNFTuriError += 1;
            continue;
        }

        // Retrieves Metadata from IPfs
        const ipfsMetadataResp = await getMetadataFromIPFS(tokenURIResp.uri);
        if(ipfsMetadataResp.status === 'Failure') {
            console.log("ERROR: ", ipfsMetadataResp.error);
            errorCount.getMetadataFromIPFSError += 1;
            continue;
        }

        // Retrieves NFT from IPFS
        const ipfsNFTResp = await getNftFromIPFS(ipfsMetadataResp.metadata.image, 
            ipfsMetadataResp.metadata.name.trim().split(' ').join('_'));
        if(ipfsNFTResp.status === "Failure") {
            console.log("ERROR: ", ipfsNFTResp.error);
            errorCount.getNftFromIPFSError += 1;
            continue;
        }

        nftMarketItems.push({
            name: ipfsMetadataResp.metadata.name,
            description: ipfsMetadataResp.metadata.description,
            file: ipfsNFTResp.file,
            itemId: contractMarketItem.itemId,
            tokenId: contractMarketItem.tokenId,
            owner: contractMarketItem.owner,
            isListed: contractMarketItem.isListed,
            price: contractMarketItem.price,
            timeBought: contractMarketItem.timeBought.toNumber(),
            timeListed: contractMarketItem.timeListed.toNumber()
        });
    }

    if(errorCount.getNFTuriError > 0 || errorCount.getMetadataFromIPFSError > 0 || errorCount.getNftFromIPFSError > 0) {
        return {status: "Failure", error: `Error Count: getNFTuriError - ${errorCount.getNFTuriError}, ` 
                        + `getMetadataFromIPFSError - ${errorCount.getMetadataFromIPFSError}, `
                        + `getNftFromIPFSError - ${errorCount.getNftFromIPFSError}`}
    }

    return {status: "Success", nftMarketItems: nftMarketItems};
}
