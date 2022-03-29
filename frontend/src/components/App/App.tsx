import FunctionalityTestLayout from '../layouts/FunctionalityTestLayout/FunctionalityTestLayout';
import LoginPageLayout from '../layouts/LoginPageLayout/LoginPageLayout';
import Navbar from '../sections/Navbar/Navbar';
import React, { useEffect, useState } from 'react';
import SellPageLayout from '../layouts/SellPageLayout/SellPageLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ContractRole, getContractRole } from '../../services/nft_contract';
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

    return (
        <BrowserRouter>
            <Stack className='App' h={'100%'}>
                <Navbar isLoggedIn={isLoggedIn()} />
                <Routes>
                    <Route path='/' element={<>Home Page</>} />
                    <Route path='/sell' element={<SellPageLayout />} />
                    <Route path='/test' element={<FunctionalityTestLayout />} />
                    <Route path='/login' element={<LoginPageLayout loadWallet={loadWallet} metaMaskError={metaMaskError} />} />
                </Routes>
            </Stack>
        </BrowserRouter>
    );
}

export default App;
