import CU_NFT from '../artifacts/contracts/CU_NFT.sol/CU_NFT.json';
import {
    AddressResponse,
    ContractError,
    initiateContractReadConnection,
    initiateContractWriteConnection,
    isMetaMaskInstalled,
    MetaMaskNotInstalledError,
    TransactionResponse
    } from './contracts';
import { CID } from 'ipfs-http-client';
import { cidToBase16 } from './ipfs';
import { ContractURIResponse } from './contractRoles';
import { CU_NFT_ADDRESS } from './CONTRACT_ADDRESSES';

// Functions to Access NFT Contract

// NFT Contract
// -------------

// Connects to NFT Contract (Read)
const initiateNFTContractReadConnection = async () => {
    return initiateContractReadConnection(CU_NFT_ADDRESS, CU_NFT.abi);
}

// Connects to NFT Contract (Write)
const initiateNFTContractWriteConnection = async () => {
    return initiateContractWriteConnection(CU_NFT_ADDRESS, CU_NFT.abi);
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

// Sets Cooper Union account to be used for royalties
export const setCooperRoyaltyAddress = async (cooperAddress: number): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if (!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.setCooperRoyaltyAddress(cooperAddress);
        await transaction.wait();
        return {status: "Success"}
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
    }
}

// Gets Cooper Union account to be used for royalties
export const getCooperRoyaltyAddress = async (): Promise<AddressResponse> => {
    try {
        const {contract} = await initiateNFTContractReadConnection();
        const addressResp = await contract.getCooperRoyaltyAddress();
        return {status: "Success", address: addressResp};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message};
    }
}
