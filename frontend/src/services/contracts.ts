// Functions to Access Ethereum Contracts
import CU_NFT from '../../../backend/artifacts/contracts/CU_NFT.sol/CU_NFT.json';
import { CU_MARKETPLACE_ADDRESS, CU_NFT_ADDRESS } from './CONTRACT_ADDRESSES';
import { ethers, providers } from 'ethers';

// Fix MetaMask TypeScript Issue
declare let window: any;

// Type Declarations
// -------------------

export type Failure = {
    status: "Failure",
    error: string
};

export type MetaMaskAccessResponse = {
    status: "Success",
    address: string
} | Failure;

type NFTContractConnectionResponse = {
    provider: ethers.providers.Web3Provider,
    signer: ethers.providers.JsonRpcSigner,
    contract: ethers.Contract   
};

export type TransactionResponse = {
    status: "Success"
} | Failure;

// MetaMask
// ----------

// Gets MetaMask Wallet
  // Request = true: Will request permission from user / MetaMask
  // Request = false: Will get wallets already connected / accepted by user
export const getMetaMaskWallet = async (request: boolean = true): Promise<MetaMaskAccessResponse> => {
    if(window.ethereum) {
        try {
            const addresses = await window.ethereum.request({
                method: request ? 'eth_requestAccounts' : 'eth_accounts'
            });
    
            // TODO: Allow user to decide between multiple wallet addresses
    
            return {status: "Success", address: addresses[0]}
        } catch(err) {
            return {status: "Failure", error: err}
        }
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}

// NFT Contract
// -------------

// Connects to NFT Contract
const initiateNFTContractConnection = async (): Promise<NFTContractConnectionResponse> => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CU_NFT_ADDRESS, CU_NFT.abi, signer);
    return {provider, signer, contract};
}

// Gives account "admin" role
export const setContractAdmin = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractConnection();
        const transaction = await contract.addAdmin(address);
        await transaction.wait();
        return {status: "Success"};
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}

// Removes account's "admin" role
export const removeContractAdmin = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractConnection();
        const transaction = await contract.removeAdmin(address);
        await transaction.wait();
        return {status: "Success"};
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}

// Gives account "student" role
export const setContractStudent = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractConnection();
        const transaction = await contract.addStudent(address);
        await transaction.wait();
        return {status: "Success"};
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}

// Removes account's "student" role
export const removeContractStudent = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractConnection();
        const transaction = await contract.removeStudent(address);
        await transaction.wait();
        return {status: "Success"};
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}

// Gives account "previous student" role
export const setContractPreviousStudent = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractConnection();
        const transaction = await contract.expireStudent(address);
        await transaction.wait();
        return {status: "Success"};
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}

// Mints New NFT
export const mintNFT = async (toAddress: string, tokenID: string, amount: number = 1): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {signer, contract} = await initiateNFTContractConnection();
        
        // Defaults toAddress to signer
        if(toAddress === null) {
            toAddress = signer._address;
        }

        const transaction = await contract.mint(toAddress, tokenID, amount);
        await transaction.wait();
        
        return {status: "Success"}
    } else {
        return {status: "Failure", error: "MetaMask not installed"}
    }
}