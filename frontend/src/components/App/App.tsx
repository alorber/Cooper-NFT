import CreatePageLayout from '../layouts/CreatePageLayout/CreatePageLayout';
import FunctionalityTestLayout from '../layouts/FunctionalityTestLayout/FunctionalityTestLayout';
import LoginPageLayout from '../layouts/LoginPageLayout/LoginPageLayout';
import MyNFTsLayout from '../layouts/MyNFTsLayout/MyNFTsLayout';
import Navbar from '../sections/Navbar/Navbar';
import React, { useEffect, useState } from 'react';
import SellPageLayout from '../layouts/SellPageLayout/SellPageLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ContractRole } from '../../services/nft_contract';
import { loadUserWallet, watchMetaMask } from '../../services/contracts';
import { Stack } from '@chakra-ui/react';
import './App.css';

const App = () => {
    // Metamask / Account tracking
    const [address, setAddress] = useState<string | null>(null);
    const [metaMaskError, setMetaMaskError] = useState<string | null>(null);
    const [accountContractRoles, setAccountContractRoles] = useState<ContractRole[] | null>(null);

    // Checks for connected accounts
    useEffect(() => {
        loadWallet(false);
        watchMetaMask(setAddress, setAccountContractRoles, setMetaMaskError);
    }, [])

    // Loads user's wallet
    // See contracts.ts for details
    const loadWallet = async(request: boolean) => {
        await loadUserWallet(request, setAddress, setMetaMaskError, setAccountContractRoles);
    }

    // Checks if wallet address is stored
    const isLoggedIn = () => {
        return address !== null;
    }

    // Shows login page if not logged in
    const showIfLoggedIn = (component: React.ReactNode) => {
        return isLoggedIn() ? (
            component
        ) : (
            <LoginPageLayout loadWallet={loadWallet} metaMaskError={metaMaskError} />
        )
    }

    return (
        <BrowserRouter>
            <Stack className='App' h={'100%'}>
                <Navbar isLoggedIn={isLoggedIn()} />
                <Routes>
                    <Route path='/' element={<>Home Page</>} />
                    <Route path='/create' element={<CreatePageLayout metaMaskAddress={address} accountRoles={accountContractRoles}/>} />
                    <Route path='/sell' element={<SellPageLayout />} />
                    <Route path='/test' element={<FunctionalityTestLayout />} />
                    <Route path='/my_nfts' element={showIfLoggedIn(<MyNFTsLayout address={address ?? ''} />)} />
                    <Route path='/login' element={<LoginPageLayout loadWallet={loadWallet} metaMaskError={metaMaskError} />} />
                </Routes>
            </Stack>
        </BrowserRouter>
    );
}

export default App;
