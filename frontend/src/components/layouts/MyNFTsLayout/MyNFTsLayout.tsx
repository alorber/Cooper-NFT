import NFTCard from '../../ui/NFTCard/NFTCard';
import React from 'react';
import { Stack } from '@chakra-ui/react';

type MyNFTsLayoutProps = {

}

const MyNFTsLayout = ({}: MyNFTsLayoutProps) => {
    return (
        <Stack align={'center'}>
            <NFTCard />
        </Stack>
        
    );
}

export default MyNFTsLayout;