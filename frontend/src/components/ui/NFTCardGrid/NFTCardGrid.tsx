import NFTCard from '../NFTCard/NFTCard';
import React from 'react';
import { Grid } from '@chakra-ui/react';
import { NFTMarketItem } from '../../../services/marketplace_contract';

type NFTCardGridProps = {
    NFTList: NFTMarketItem[],
    ethToUsdRate: number
}

// Number of columns for each breakpoint
const GRID_COLUMNS_PER_BREAKPOINT = [1,1,2,3,4,4, 5];

const NFTCardGrid = ({NFTList, ethToUsdRate}: NFTCardGridProps) => {
    return (
        <Grid templateColumns={GRID_COLUMNS_PER_BREAKPOINT.map(
                (numColumns) => `repeat(${numColumns}, 1fr)`
            )} gap={4} m={4} >
            {NFTList.map(nft => (
                <NFTCard imageURL={URL.createObjectURL(nft.file)} title={nft.name} 
                    owner={nft.owner} price={nft.price} ethToUsdRate={ethToUsdRate}
                    key={nft.itemId} />
            ))}
        </Grid>
    );
}

export default NFTCardGrid;