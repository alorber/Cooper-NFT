import FilterBox from '../../ui/FilterBox/FilterBox';
import LoadingText from '../../ui/LoadingText/LoadingText';
import NFTCardGrid from '../../ui/NFTCardGrid/NFTCardGrid';
import React, { useEffect, useState } from 'react';
import { buildLiveNFTList, NFTMarketItem } from '../../../services/marketplace_contract';
import { Stack } from '@chakra-ui/react';

type ExplorePageLayoutProps = {
    ethToUsdRate: number | null,
    updateEthRate: () => void
}

const ExplorePageLayout = ({ethToUsdRate, updateEthRate}: ExplorePageLayoutProps) => {
    const [listedNFTs, setlistedNFTs] = useState<NFTMarketItem[] | null>(null);
    const [searchResults, setSearchResults] = useState<NFTMarketItem[]>([]);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

    // Loads User's NFT lists
    const loadNFTLists = async () => {
        setIsLoadingNFTs(true);
        const loadNFTListsResp = await buildLiveNFTList();
        if(loadNFTListsResp.status === "Success") {
            setlistedNFTs(loadNFTListsResp.nftMarketItems);
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
                <LoadingText loadingText='Loading Live Listing...' textColor='black' textSize={'lg'} marginTop={4} />
            ) : (<>
                <FilterBox nftList={listedNFTs ?? []} setNftList={setSearchResults} 
                    EthToUsdRate={ethToUsdRate} />
                <NFTCardGrid NFTList={searchResults ?? []} ethToUsdRate={ethToUsdRate ?? 1} />
            </>)}
            
        </Stack>
        
    );
}

export default ExplorePageLayout;