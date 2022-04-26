import FilterBox from '../../ui/FilterBox/FilterBox';
import NFTCardGrid from '../../ui/NFTCardGrid/NFTCardGrid';
import React, { useEffect, useState } from 'react';
import { buildUserNFTList, NFTMarketItem } from '../../../services/marketplace_contract';
import { Heading, Stack } from '@chakra-ui/react';

type MyNFTsLayoutProps = {
    address: string,
    ethToUsdRate: number | null,
    updateEthRate: () => void
}

const MyNFTsLayout = ({address, ethToUsdRate, updateEthRate}: MyNFTsLayoutProps) => {
    const [userListedNFTs, setUserListedNFTs] = useState<NFTMarketItem[] | null>(null);
    const [userUnlistedNFTs, setUserUnlistedNFTs] = useState<NFTMarketItem[] | null>(null);
    const [searchResults, setSearchResults] = useState<NFTMarketItem[]>([]);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

    // Loads User's NFT lists
    const loadNFTLists = async () => {
        setIsLoadingNFTs(true);
        const loadNFTListsResp = await buildUserNFTList();
        if(loadNFTListsResp.status === "Success") {
            setUserListedNFTs(loadNFTListsResp.listedNFTs);
            setUserUnlistedNFTs(loadNFTListsResp.unlistedNFTs);
        } else {
            console.log(loadNFTListsResp.error);
        }
        setIsLoadingNFTs(false)
    }

    // Loads NFTs & ETH Rate on page-load
    useEffect(() => {
        loadNFTLists();
        updateEthRate();
    }, []);

    return (
        <Stack align={'center'}>
            {isLoadingNFTs ? (
                <Heading>
                    Loading...
                </Heading>
            ) : (<>
                <FilterBox nftList={(userListedNFTs || []).concat(userUnlistedNFTs || [])} setNftList={setSearchResults} 
                    isMyNFTPage EthToUsdRate={ethToUsdRate} />
                <NFTCardGrid NFTList={searchResults ?? []} ethToUsdRate={ethToUsdRate ?? 1} />
            </>)}
            
        </Stack>
        
    );
}

export default MyNFTsLayout;