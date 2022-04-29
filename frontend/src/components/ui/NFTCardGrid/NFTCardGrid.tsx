import NFTCard from '../NFTCard/NFTCard';
import React from 'react';
import { Grid } from '@chakra-ui/react';
import { NFTMarketItem } from '../../../services/marketplace_contract';

type NFTCardGridProps = {
    NFTList: NFTMarketItem[],
    ethToUsdRate: number | null,
    isLoadingEthRate?: boolean,
    updateEthRate?: () => void
}

// Number of columns for each breakpoint
const GRID_COLUMNS_PER_BREAKPOINT = [1,1,2,3,4,4, 5];

const NFTCardGrid = ({NFTList, ethToUsdRate, isLoadingEthRate, updateEthRate}: NFTCardGridProps) => {
    return (
        <Grid templateColumns={GRID_COLUMNS_PER_BREAKPOINT.map(
                (numColumns) => `repeat(${numColumns}, 1fr)`
            )} gap={4} m={4} >
            {NFTList.map(nft => (
                <NFTCard nft={nft} ethToUsdRate={ethToUsdRate} isLoadingEthRate={isLoadingEthRate}
                    updateEthRate={updateEthRate} key={nft.itemId} />
            ))}
        </Grid>
    );
}

export default NFTCardGrid;