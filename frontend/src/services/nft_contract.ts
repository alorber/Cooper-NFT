import CU_NFT from '../artifacts/contracts/CU_NFT.sol/CU_NFT.json';
import { CID } from 'ipfs-http-client';
import { cidToBase16 } from './ipfs';
import { ContractError, initiateContractReadConnection } from './contracts';
import { ContractURIResponse } from './contractRoles';
import { CU_NFT_ADDRESS } from './CONTRACT_ADDRESSES';

// Functions to Access NFT Contract

// NFT Contract
// -------------

// Connects to NFT Contract (Read)
const initiateNFTContractReadConnection = async () => {
    return initiateContractReadConnection(CU_NFT_ADDRESS, CU_NFT.abi);
}

// Creates tokenID from CID
export const cidToTokenID = (CID: CID) => {
    // Converts to base16
    const base16CID = cidToBase16(CID);

    // Converts to tokenID form
    const tokenID = '0x' + base16CID.substring(1);

    return tokenID;
}

// Retrieves URI of NFT
export const getNFTuri = async (tokenID: string): Promise<ContractURIResponse> => {
    try {
        const {contract} = await initiateNFTContractReadConnection();
        const uriResp = await contract.uri(tokenID);
        return {status: "Success", uri: uriResp};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
    }
} 
