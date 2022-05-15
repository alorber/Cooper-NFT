import NFT_Marketplace from '../artifacts/contracts/NFT_Marketplace.sol/NFT_Marketplace.json';
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

// Functions to access marketplace contract role functionality

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

// NFT Marketplace Role Functions
// --------------------------------

// Connects to NFT Contract (Read)
const initiateMarketplaceContractReadConnection = async () => {
    return initiateContractReadConnection(CU_MARKETPLACE_ADDRESS, NFT_Marketplace.abi);
}

// Connects to NFT Contract (Write)
const initiateMarketplaceContractWriteConnection = async () => {
    return initiateContractWriteConnection(CU_MARKETPLACE_ADDRESS, NFT_Marketplace.abi);
}

// Gives account "admin" role
export const setContractAdmin = async (addresses: string[]): Promise<TransactionResponse> => {
    // Checks MetaMask Install
    if(!isMetaMaskInstalled) {
        return MetaMaskNotInstalledError;
    }
    
    try {
        const {contract} = await initiateMarketplaceContractWriteConnection();
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
        const {contract} = await initiateMarketplaceContractWriteConnection();
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
        const {contract} = await initiateMarketplaceContractWriteConnection();
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
        const {contract} = await initiateMarketplaceContractWriteConnection();
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
        const {contract} = await initiateMarketplaceContractWriteConnection();
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
        const {contract} = await initiateMarketplaceContractReadConnection();
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
        const {contract} = await initiateMarketplaceContractReadConnection();
        
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
