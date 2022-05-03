import CreatePageLayout from '../layouts/CreatePageLayout/CreatePageLayout';
import ExplorePageLayout from '../layouts/ExplorePageLayout/ExplorePageLayout';
import FunctionalityTestLayout from '../layouts/FunctionalityTestLayout/FunctionalityTestLayout';
import HomePageLayout from '../layouts/HomePageLayout/HomePageLayout';
import LoginPageLayout from '../layouts/LoginPageLayout/LoginPageLayout';
import MyNFTsLayout from '../layouts/MyNFTsLayout/MyNFTsLayout';
import Navbar from '../sections/Navbar/Navbar';
import NFTPageLayout from '../layouts/NFTPageLayout/NFTPageLayout';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ContractRole } from '../../services/nft_contract';
import { getETHToUSDRate } from '../../services/ethereumValue';
import { loadUserWallet, watchMetaMask } from '../../services/contracts';
import { Stack } from '@chakra-ui/react';
import './App.css';

const App = () => {
    // Metamask / Account tracking
    // -----------------------------

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

    // ETH / USD Rate
    // ---------------
    const [ethToUsdRate, setEthToUsdRate] = useState<number | null>(null);
    const [isLoadingETHRate, setIsLoadingETHRate] = useState(false);

    // Gets ETH <-> USD conversion rate
    const getETHRate = async () => {
        setIsLoadingETHRate(true);
        const ethRateResp = await getETHToUSDRate();
        if(ethRateResp.status === "Success") {
            setEthToUsdRate(ethRateResp.exchangeRate);
        } else {
            setEthToUsdRate(null);
        }
        setIsLoadingETHRate(false);
    }

    return (
        <BrowserRouter>
            <Stack className='App' h={'100%'}>
                <Navbar isLoggedIn={isLoggedIn()} />
                <Routes>
                    <Route path='/' element={<HomePageLayout />} />
                    <Route path='/explore' element={<ExplorePageLayout ethToUsdRate={ethToUsdRate} updateEthRate={getETHRate} />} />
                    <Route path='/create' element={<CreatePageLayout metaMaskAddress={address} accountRoles={accountContractRoles}
                        ethRateProps={{ethToUsdRate: ethToUsdRate, isLoadingETHRate: isLoadingETHRate, updateEthRate: getETHRate}} />} />
                    <Route path='/nft/:ids' element={<NFTPageLayout ethToUsdRate={ethToUsdRate} address={address ?? ''} />} />
                    <Route path='/test' element={<FunctionalityTestLayout />} />
                    <Route path='/my_nfts' element={showIfLoggedIn(<MyNFTsLayout address={address ?? ''} ethToUsdRate={ethToUsdRate} 
                        isLoadingEthRate={isLoadingETHRate} updateEthRate={getETHRate} />)} />
                    <Route path='/login' element={<LoginPageLayout loadWallet={loadWallet} metaMaskError={metaMaskError} />} />
                </Routes>
            </Stack>
        </BrowserRouter>
    );
}

export default App;
