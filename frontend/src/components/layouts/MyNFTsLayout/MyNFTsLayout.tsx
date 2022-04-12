import NFTCardGrid from '../../ui/NFTCardGrid/NFTCardGrid';
import React, { useEffect, useState } from 'react';
import { buildUserNFTList, NFTMarketItem } from '../../../services/marketplace_contract';
import { getETHToUSDRate } from '../../../services/ethereumValue';
import { Heading, Stack } from '@chakra-ui/react';

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
        } else {
            console.log(loadNFTListsResp.error)
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
            {isLoadingNFTs ? (
                <Heading>
                    Loading...
                </Heading>
            ) : (
                <NFTCardGrid NFTList={userListedNFTs ?? []} ethToUsdRate={ethToUsdRate ?? 1} />
            )}
            
        </Stack>
        
    );
}

export default MyNFTsLayout;