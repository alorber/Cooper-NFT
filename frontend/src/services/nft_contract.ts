import CU_NFT from '../artifacts/contracts/CU_NFT.sol/CU_NFT.json';
import { CID } from 'ipfs-http-client';
import { cidToBase16 } from './ipfs';
import { CU_NFT_ADDRESS } from './CONTRACT_ADDRESSES';
import {
    Failure,
    initiateContractReadConnection,
    initiateContractWriteConnection,
    isMetaMaskInstalled,
    MetaMaskNotInstalledError,
    TransactionResponse
    } from './contracts';
// Functions to Access NFT Contract

// Type Declarations
// -------------------

export enum ContractRole {
    PREVIOUS_STUDENT = "PREVIOUS_STUDENT",
    CURRENT_STUDENT = "CURRENT_STUDENT",
    ADMIN = "ADMIN",
    COOPER = "COOPER",
}

export type ContractRoleResponse = {
    status: "Success",
    roles: ContractRole[]
} | Failure;

export type ContractURIResponse = {
    status: "Success",
    uri: string
} | Failure;

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

// Gives account "admin" role
export const setContractAdmin = async (address: string): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.addAdmin(address);
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: err}
    }
}

// Removes account's "admin" role
export const removeContractAdmin = async (address: string): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.removeAdmin(address);
        await transaction.wait();
        return {status: "Success"};
    }  catch(err: any) {
        return {status: "Failure", error: err}
    }
}

// Gives account "student" role
export const setContractStudent = async (address: string): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.addStudent(address);
        await transaction.wait();
        return {status: "Success"};    
    }  catch(err: any) {
        return {status: "Failure", error: err}
    }
}

// Removes account's "student" role
export const removeContractStudent = async (address: string): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.removeStudent(address);
        await transaction.wait();
        return {status: "Success"};    
    }  catch(err: any) {
        return {status: "Failure", error: err}
    }
}

// Gives account "previous student" role
export const setContractPreviousStudent = async (address: string): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.expireStudent(address);
        await transaction.wait();
        return {status: "Success"};
    }  catch(err: any) {
        return {status: "Failure", error: err}
    }
}

// Gets account's role
export const getContractRole = async (address: string): Promise<ContractRoleResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    const {contract} = await initiateNFTContractReadConnection();
    let roleResp = await contract.getContractRoles(address);
    const accountRoles: ContractRole[] = [];

    // Determines roles
    for(let role in ContractRole) {
        if(roleResp & 1) {
            accountRoles.push(role as ContractRole);
        }
        roleResp >>= 1;
    }
    return {status: "Success", roles: accountRoles}
}

// Creates tokenID from CID
export const cidToTokenID = (CID: CID) => {
    // Converts to base16
    const base16CID = cidToBase16(CID);

    // Converts to tokenID form
    const tokenID = '0x' + base16CID.substring(1);

    return tokenID;
}

// Mints New NFT
// Royalty Value must be between 0 - 10000, where 10000 = 100% of sale price
export const mintNFT = async (toAddress: string, tokenID: string, royaltyReciever: string,
        royaltyValue: number, amount: number = 1): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.mint(toAddress, tokenID, amount, royaltyReciever, royaltyValue);
        await transaction.wait();
        return {status: "Success"}
    } catch(err: any) {
        return {status: "Failure", error: err}
    }
}

// Retrieves URI of NFT
export const getNFTuri = async (tokenID: string): Promise<ContractURIResponse> => {
    try {
        const {contract} = await initiateNFTContractReadConnection();
        const uriResp = await contract.uri(tokenID);
        return {status: "Success", uri: uriResp};
    } catch(err: any) {
        return {status: "Failure", error: err};
    }
} 
