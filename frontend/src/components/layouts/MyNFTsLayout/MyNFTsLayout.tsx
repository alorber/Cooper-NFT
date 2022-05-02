import FilterBox from '../../ui/FilterBox/FilterBox';
import LoadingText from '../../ui/LoadingText/LoadingText';
import NFTCardGrid from '../../ui/NFTCardGrid/NFTCardGrid';
import React, { useEffect, useState } from 'react';
import { buildUserNFTList, NFTMarketItem } from '../../../services/marketplace_contract';
import { Heading, Stack } from '@chakra-ui/react';

type MyNFTsLayoutProps = {
    address: string,
    ethToUsdRate: number | null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void
}

const MyNFTsLayout = ({address, ethToUsdRate, isLoadingEthRate, updateEthRate}: MyNFTsLayoutProps) => {
    const [usersNFTs, setUsersNFTs] = useState<NFTMarketItem[] | null>(null);
    const [searchResults, setSearchResults] = useState<NFTMarketItem[]>([]);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

    // Loads User's NFT lists
    const loadNFTLists = async () => {
        setIsLoadingNFTs(true);
        const loadNFTListsResp = await buildUserNFTList();
        if(loadNFTListsResp.status === "Success") {
            setUsersNFTs(loadNFTListsResp.nftMarketItems);
        } else {
            console.log(loadNFTListsResp.error);
        }
        setIsLoadingNFTs(false)
    }

    // Loads NFTs & ETH Rate on page-load
    useEffect(() => {
        loadNFTLists();
        updateEthRate();
    }, [address]);

    return (
        <Stack align={'center'}>
            {isLoadingNFTs ? (
                <LoadingText loadingText='Loading My NFTs...' textColor='black' textSize={'lg'} marginTop={4} />
            ) : usersNFTs === null ? (
                <Stack pt={4}>
                    <Heading size='lg' pt={6}>
                        We seem to be having some trouble loading your NFTs
                    </Heading>
                    <Heading size='md' pt={6}>
                        Please try again later
                    </Heading> 
                </Stack>
        ) : (<>
                <FilterBox nftList={usersNFTs ?? []} setNftList={setSearchResults} 
                    isMyNFTPage EthToUsdRate={ethToUsdRate} />
                {usersNFTs.length === 0 ? (
                    <Stack pt={4}>
                        <Heading size='lg' pt={6}>
                            You don't appear to have any NFTs
                        </Heading>
                        <Heading size='md' pt={6}>
                            Buy or create some NFTs to add to your collection
                        </Heading> 
                    </Stack>
                ) : (
                    <NFTCardGrid NFTList={searchResults ?? []} ethToUsdRate={ethToUsdRate}
                        isLoadingEthRate={isLoadingEthRate} updateEthRate={updateEthRate}
                        updateNftList={loadNFTLists} />
                )}
            </>)}
            
        </Stack>
        
    );
}

export default MyNFTsLayout;