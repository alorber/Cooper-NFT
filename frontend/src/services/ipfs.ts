// Functions to access IPFS
import {CID, create as ipfsHttpClient } from 'ipfs-http-client';
import { IPFS_PROJECT_ID, IPFS_PROJECT_SECRET } from './IPFS_AUTH';
import {base16} from 'multiformats/bases/base16';

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
    const addedFile = await client.add(file, {cidVersion: 1, hashAlg: hash});
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
