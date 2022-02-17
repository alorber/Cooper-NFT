// Functions to Access Ethereum Contracts
import CU_NFT from '../artifacts/contracts/CU_NFT.sol/CU_NFT.json';
import { CID } from 'ipfs-http-client';
import { cidToBase16 } from './ipfs';
import { CU_MARKETPLACE_ADDRESS, CU_NFT_ADDRESS } from './CONTRACT_ADDRESSES';
import { ethers } from 'ethers';

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

type NFTContractReadConnectionResponse = {
    provider: ethers.providers.Web3Provider,
    contract: ethers.Contract   
};

type NFTContractWriteConnectionResponse = {
    signer: ethers.providers.JsonRpcSigner
} & NFTContractReadConnectionResponse;

export type TransactionResponse = {
    status: "Success"
} | Failure;

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

// MetaMask
// ----------

const MetaMaskNotInstalledError: Failure = {status: "Failure", error: "MetaMask not installed"};

// Gets MetaMask Wallet
  // Request = true: Will request permission from user / MetaMask
  // Request = false: Will get wallets already connected / accepted by user
export const getMetaMaskWallet = async (request: boolean = true): Promise<MetaMaskAccessResponse> => {
    if(window.ethereum) {
        try {
            const addresses = await window.ethereum.request({
                method: request ? 'eth_requestAccounts' : 'eth_accounts'
            });    
            return {status: "Success", address: addresses[0]}
        } catch(err: any) {
            return {status: "Failure", error: err.message}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Adds MetaMask 'Listener'
export const watchMetaMask = (
        setAddress: (address: string | null) => void,
        setRoles: (role: ContractRole[] | null) => void,
        setMetaMaskError: (err: string | null) => void
    ) => {
    if(window.ethereum) {
        window.ethereum.on("accountsChanged", async (accounts: string[]) => {
            if (accounts.length > 0) {
              setAddress(accounts[0]);

              // Get Account Role(s)
              const rolesResp = await getContractRole(accounts[0]);
              if(rolesResp.status === "Success") {
                setRoles(rolesResp.roles);
              }
            } else {
              setAddress(null);
              setMetaMaskError("User signed out");
            }
          });
    }
}

// NFT Contract
// -------------

// Connects to NFT Contract (Read)
const initiateNFTContractReadConnection = async (): Promise<NFTContractReadConnectionResponse> => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CU_NFT_ADDRESS, CU_NFT.abi, provider);
    return {provider, contract};
}

// Connects to NFT Contract (Write)
const initiateNFTContractWriteConnection = async (): Promise<NFTContractWriteConnectionResponse> => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CU_NFT_ADDRESS, CU_NFT.abi, signer);
    return {provider, signer, contract};
}

// Gives account "admin" role
export const setContractAdmin = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractWriteConnection();
        try {
            const transaction = await contract.addAdmin(address);
            await transaction.wait();    
            return {status: "Success"};
        } catch(err: any) {
            return {status: "Failure", error: err}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Removes account's "admin" role
export const removeContractAdmin = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        const {contract} = await initiateNFTContractWriteConnection();
        try {
            const transaction = await contract.removeAdmin(address);
            await transaction.wait();
            return {status: "Success"};
        }  catch(err: any) {
            return {status: "Failure", error: err}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Gives account "student" role
export const setContractStudent = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        try {
            const {contract} = await initiateNFTContractWriteConnection();
            const transaction = await contract.addStudent(address);
            await transaction.wait();
            return {status: "Success"};    
        }  catch(err: any) {
            return {status: "Failure", error: err}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Removes account's "student" role
export const removeContractStudent = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        try {
            const {contract} = await initiateNFTContractWriteConnection();
            const transaction = await contract.removeStudent(address);
            await transaction.wait();
            return {status: "Success"};    
        }  catch(err: any) {
            return {status: "Failure", error: err}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Gives account "previous student" role
export const setContractPreviousStudent = async (address: string): Promise<TransactionResponse> => {
    if(window.ethereum) {
        try {
            const {contract} = await initiateNFTContractWriteConnection();
            const transaction = await contract.expireStudent(address);
            await transaction.wait();
            return {status: "Success"};
        }  catch(err: any) {
            return {status: "Failure", error: err}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Gets account's role
export const getContractRole = async (address: string): Promise<ContractRoleResponse> => {
    if(window.ethereum) {
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
    } else {
        return MetaMaskNotInstalledError;
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

// Mints New NFT
export const mintNFT = async (toAddress: string, tokenID: string, amount: number = 1): Promise<TransactionResponse> => {
    if(window.ethereum) {
        try {
            const {contract} = await initiateNFTContractWriteConnection();
            const transaction = await contract.mint(toAddress, tokenID, amount);
            await transaction.wait();
            return {status: "Success"}
        } catch(err: any) {
            return {status: "Failure", error: err}
        }
    } else {
        return MetaMaskNotInstalledError;
    }
}

// Retrieves URI of NFT
export const getNFTuri = async (tokenID: string): Promise<ContractURIResponse> => {
    if(window.ethereum) {
        try {
            const {contract} = await initiateNFTContractReadConnection();
            const uriResp = await contract.uri(tokenID);
            return {status: "Success", uri: uriResp};
        } catch(err: any) {
            return {status: "Failure", error: err};
        }
    } else {
        return MetaMaskNotInstalledError;
    }
} 