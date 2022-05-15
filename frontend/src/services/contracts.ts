import { ContractRole, getContractRole } from './contractRoles';
import { ethers } from 'ethers';
// Functions to Access Ethereum Contracts

// Fixes MetaMask TypeScript Issue
declare let window: any;

// Type Declarations
// -------------------

export type ContractError = {
    code: number,
    message: string,
    data?: unknown,
    stack?: string
}

export type Failure = {
    status: "Failure",
    error: string
};

export type AddressResponse = {
    status: "Success",
    address: string
} | Failure;

type ContractReadConnectionResponse = {
    provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider,
    contract: ethers.Contract   
};

type ContractWriteConnectionResponse = {
    signer: ethers.providers.JsonRpcSigner
} & ContractReadConnectionResponse;

export type TransactionResponse = {
    status: "Success"
} | Failure;

// MetaMask
// ----------

export const MetaMaskNotInstalledError: Failure = {status: "Failure", error: "MetaMask not installed"};

// Gets MetaMask Wallet
  // Request = true: Will request permission from user / MetaMask
  // Request = false: Will get wallets already connected / accepted by user
export const getMetaMaskWallet = async (request: boolean = true): Promise<AddressResponse> => {
    if(window.ethereum) {
        try {
            const addresses = await window.ethereum.request({
                method: request ? 'eth_requestAccounts' : 'eth_accounts'
            });    
            return {status: "Success", address: addresses[0]}
        } catch(err: any) {
            return {status: "Failure", error: (err as ContractError).message}
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

// Checks if MetaMask is installed
export const isMetaMaskInstalled = () => {
    return window.ethereum;
}

// Loads user's address and contract roles
export const loadUserWallet = async (
    request: boolean = true, 
    setAddress: (a: string | null) => void,
    setMetaMaskError: (e: string | null) => void,
    setAccountContractRoles: (r: ContractRole[] | null) => void
) => {
    const resp = await getMetaMaskWallet(request);

    if(resp.status === "Success") {
        // Address Found
        if(resp.address != null) {
            setAddress(resp.address);
            setMetaMaskError(null);

            // Get Account Role(s)
            const rolesResp = await getContractRole(resp.address);
            if(rolesResp.status === "Success") {
                setAccountContractRoles(rolesResp.roles);
            }
        }
    } else {
        setMetaMaskError(resp.error);
    }
}

// Contracts
// -----------

// Connects to Contract (Read)
export const initiateContractReadConnection = async (
    contractAddress: string, contractABI: ethers.ContractInterface
): Promise<ContractReadConnectionResponse> => {
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    return {provider, contract};
}

// Connects to NFT Contract (Write)
export const initiateContractWriteConnection = async (
    contractAddress: string, contractABI: ethers.ContractInterface
): Promise<ContractWriteConnectionResponse> => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return {provider, signer, contract};
}
