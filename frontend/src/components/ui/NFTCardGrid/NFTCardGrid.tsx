import NFTCard from '../NFTCard/NFTCard';
import React from 'react';
import { Grid } from '@chakra-ui/react';
import { NFTMarketItem } from '../../../services/marketplace_contract';

type NFTCardGridProps = {
    NFTList: NFTMarketItem[]
}

const NFTCardGrid = ({NFTList}: NFTCardGridProps) => {
    return (
        <Grid>
            {NFTList.map(NFT => (
                <></>
            ))}
        </Grid>
    );
}

export default NFTCardGrid;