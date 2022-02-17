// Functions to access IPFS
import {CID, create as ipfsHttpClient } from 'ipfs-http-client';
import { IPFS_PROJECT_ID, IPFS_PROJECT_SECRET } from './IPFS_AUTH';
import {base16} from 'multiformats/bases/base16';
import { Failure } from './contracts';

// Type Declarations
// -------------------

export type ipfsResponse = {
    status: "Success",
    file: string
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
export const uploadFileToIPFS = async (file: File, hash: string = 'blake2b-208') => {
    const addedFile = await client.add(file, {cidVersion: 1, hashAlg: hash, pin: true});
    const cid = addedFile.cid;
    return cid;
}

// Converts CID to base 16
export const cidToBase16 = (cid: CID) => {
    return cid.toString(base16);
}

// Builds metadata
export type NFTMetadata = {
    name: string,
    description: string,
    image: string
}
export const buildNFTMetadata = (data: NFTMetadata) => {
    return JSON.stringify(data);
}

// Retrieves file from IPFS
export const getFileFromIPFS = async (uri: string): Promise<ipfsResponse> => {
    try {
        const retrievedFile = await client.cat(uri);
        const decoder = new TextDecoder();
        let decodedFile = '';
        for await (const chunk of retrievedFile) {
            decodedFile += decoder.decode(chunk);
        }
        return {status: "Success", file: decodedFile};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
    
}
