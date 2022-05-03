import FilterBox from '../../ui/FilterBox/FilterBox';
import LoadingText from '../../ui/LoadingText/LoadingText';
import NFTCardGrid from '../../ui/NFTCardGrid/NFTCardGrid';
import react, { useEffect, useState } from 'react';
import { Heading, Stack } from '@chakra-ui/react';
import { NFTMarketItem } from '../../../services/marketplace_contract';

export type WatchPageLayoutProps = {
    address: string,
    ethToUsdRate: number | null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void
}

const WatchPageLayout = ({address, ethToUsdRate, isLoadingEthRate, updateEthRate}: WatchPageLayoutProps) => {
    const [watchedNFTs, setWatchedNFTs] = useState<NFTMarketItem[] | null>(null);
    const [searchResults, setSearchResults] = useState<NFTMarketItem[]>([]);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

    // Loads User's NFT lists
    const loadWatchedList = async () => {
        setIsLoadingNFTs(true);
        setWatchedNFTs([]);
        setIsLoadingNFTs(false)
    }

    // Loads NFTs & ETH Rate on page-load
    useEffect(() => {
        loadWatchedList();
        updateEthRate();
    }, [address]);

    return (
        <Stack align={'center'}>
            {isLoadingNFTs ? (
                <LoadingText loadingText='Loading Watched Listings...' textColor='black' textSize={'lg'} marginTop={4} />
            ) : watchedNFTs === null ? (
                <Stack pt={4}>
                    <Heading size='lg' pt={6}>
                        We seem to be having some trouble loading your watched NFTs
                    </Heading>
                    <Heading size='md' pt={6}>
                        Please try again later
                    </Heading> 
                </Stack>
            ) : (<>
                <FilterBox nftList={watchedNFTs ?? []} setNftList={setSearchResults} 
                    EthToUsdRate={ethToUsdRate} />
                {watchedNFTs.length === 0 ? (
                    <Stack pt={4}>
                        <Heading size='lg' pt={6}>
                            We can't seem to find any NFTs
                        </Heading>
                        <Heading size='md' pt={6}>
                            Watch some NFTs to view them here
                        </Heading> 
                    </Stack>
                ) : (
                    <NFTCardGrid NFTList={searchResults ?? []} ethToUsdRate={ethToUsdRate} isLoadingEthRate={isLoadingEthRate}
                        updateEthRate={updateEthRate} updateNftList={loadWatchedList} />
                )}
            </>)}
        </Stack>
    );
}

export default WatchPageLayout;