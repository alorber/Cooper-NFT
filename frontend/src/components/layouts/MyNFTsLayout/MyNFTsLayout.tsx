import NFTCard from '../../ui/NFTCard/NFTCard';
import React, { useEffect, useState } from 'react';
import { Stack } from '@chakra-ui/react';
import { buildUserNFTList, NFTMarketItem } from '../../../services/marketplace_contract';
import { getETHToUSDRate } from '../../../services/ethereumValue';

type MyNFTsLayoutProps = {
    address: string
}

const MyNFTsLayout = ({address}: MyNFTsLayoutProps) => {
    const [userListedNFTs, setUserListedNFTs] = useState<NFTMarketItem[] | null>(null);
    const [userUnlistedNFTs, setUserUnlistedNFTs] = useState<NFTMarketItem[] | null>(null);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
    const [ethToUsdRate, setEthToUsdRate] = useState<number | null>(null);
    const [isLoadingETHRate, setIsLoadingETHRate] = useState(false);

    // Loads User's NFT lists
    const loadNFTLists = async () => {
        setIsLoadingNFTs(true);
        const loadNFTListsResp = await buildUserNFTList();
        if(loadNFTListsResp.status === "Success") {
            setUserListedNFTs(loadNFTListsResp.listedNFTs);
            setUserUnlistedNFTs(loadNFTListsResp.unlistedNFTs);
        }
        setIsLoadingNFTs(false)
    }

    // Gets ETH Rate
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

    // Loads NFTs & ETH Rate on page-load
    useEffect(() => {
        loadNFTLists();
        getETHRate();
    }, []);

    return (
        <Stack align={'center'}>
            <NFTCard imageURL="https://static01.nyt.com/images/2013/02/16/nyregion/JP-COOPER/JP-COOPER-superJumbo.jpg" 
                title={"Cooper Union"} creator={'Cooper Student #4'} price={4.67} ethToUsdRate={1000000} />
        </Stack>
        
    );
}

export default MyNFTsLayout;