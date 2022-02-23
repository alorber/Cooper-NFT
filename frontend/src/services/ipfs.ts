import { base16 } from 'multiformats/bases/base16';
import { CID, create as ipfsHttpClient } from 'ipfs-http-client';
import { Failure } from './contracts';
import { fromBuffer, FileExtension, MimeType } from 'file-type';
import { IPFS_PROJECT_ID, IPFS_PROJECT_SECRET } from './IPFS_AUTH';

// Type Declarations
// -------------------

export type NFTMetadata = {
    name: string,
    description: string,
    image: string
}

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
export const uploadFileToIPFS = async (file: File, hash: string = 'blake2b-208') => {
    const addedFile = await client.add(file, {cidVersion: 1, hashAlg: hash, pin: true, wrapWithDirectory: false});
    const cid = addedFile.cid;
    return cid;
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
        return {status: "Failure", error: err};
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
        return {status: "Failure", error: err};
    }
}
