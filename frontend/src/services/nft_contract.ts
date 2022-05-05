import CU_NFT from '../artifacts/contracts/CU_NFT.sol/CU_NFT.json';
import { CID } from 'ipfs-http-client';
import { cidToBase16 } from './ipfs';
import {
    ContractError,
    Failure,
    initiateContractReadConnection,
    initiateContractWriteConnection,
    isMetaMaskInstalled,
    MetaMaskNotInstalledError,
    TransactionResponse
    } from './contracts';
import { CU_NFT_ADDRESS } from './CONTRACT_ADDRESSES';
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

export type CommonRolesResponse = {
    status: "Success",
    commonRoles: ContractRole[],
    commonNonRoles: ContractRole[]
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
export const setContractAdmin = async (addresses: string[]): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.addAdmin(addresses);
        await transaction.wait();    
        return {status: "Success"};
    } catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message}
    }
}

// Removes account's "admin" role
export const removeContractAdmin = async (addresses: string[]): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.removeAdmin(addresses);
        await transaction.wait();
        return {status: "Success"};
    }  catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message}
    }
}

// Gives account "student" role
export const setContractStudent = async (addresses: string[]): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.addStudent(addresses);
        await transaction.wait();
        return {status: "Success"};    
    }  catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message}
    }
}

// Removes account's "student" role
export const removeContractStudent = async (addresses: string[]): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.removeStudent(addresses);
        await transaction.wait();
        return {status: "Success"};    
    }  catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message}
    }
}

// Gives account "previous student" role
export const setContractPreviousStudent = async (addresses: string[]): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateNFTContractWriteConnection();
        const transaction = await contract.expireStudent(addresses);
        await transaction.wait();
        return {status: "Success"};
    }  catch(err: any) {
        return {status: "Failure", error: (err as ContractError).message}
    }
}

// Gets account's role
export const getContractRole = async (address: string): Promise<ContractRoleResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
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
    } catch (err: any) {
        return {status: "Failure", error: (err as ContractError).message}
    }
}

// Gets roles in common between accounts
export const getCommonRoles = async (addresses: string[]): Promise<CommonRolesResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }

    try {
        const {contract} = await initiateNFTContractWriteConnection();
        
        // Determines roles all have and don't have
        let commonRolesBits = 15; // 1111
        let commonNonRolesBits = 15; // 1111
        for(const address of addresses) {
            const roleResp = await contract.getContractRoles(address);
            commonRolesBits &= roleResp;
            commonNonRolesBits &= (~roleResp);
        }
        
        // Converts role bits to names
        const commonRoles = [];
        const commonNonRoles = [];
        for(let role in ContractRole) {
            if(commonRolesBits & 1) {
                commonRoles.push(role as ContractRole);
            }
            if(commonNonRolesBits & 1) {
                commonNonRoles.push(role as ContractRole);
            }
            commonRolesBits >>= 1;
            commonNonRolesBits >>= 1;
        }

        return {status: "Success", commonRoles: commonRoles, commonNonRoles: commonNonRoles};
    }  catch(err: any) {
        console.log("22")
        return {status: "Failure", error: (err as ContractError).message}
    }
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
