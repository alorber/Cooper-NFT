import NFTCardListButton from '../NFTCardListButton/NFTCardListButton';
import React, { useState } from 'react';
import {
    Box,
    Heading,
    HStack,
    Image,
    Link,
    Stack,
    Text,
    Tooltip
    } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { generateNFTPageURL } from '../../../services/nftUrls';
import { LIGHT_SHADE_COLOR, NAVBAR_BORDER_COLOR } from '../../../COLORS';
import { Link as RouterLink } from 'react-router-dom';
import { NFTMarketItem } from '../../../services/marketplace_contract';

type NFTCardProps = {
    nft: NFTMarketItem
    ethToUsdRate: number | null,
    isLoadingEthRate?: boolean,
    updateEthRate?: () => void,
    updateNftList?: () => void
}

const NFTCard = ({nft, ethToUsdRate, isLoadingEthRate, updateEthRate, updateNftList}: NFTCardProps) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const {name: title, file, itemId, tokenId, owner, isListed, price} = nft;
    
    return (
        <Box w="300px" rounded="20px" overflow="hidden" mt={10} >
            <Box as={RouterLink} to={`/nft/${generateNFTPageURL(tokenId, itemId)}`}>
                <Image src= {URL.createObjectURL(file)}
                boxSize="300px" objectFit={'contain'} backgroundColor={NAVBAR_BORDER_COLOR} />
            </Box>
            
            <Box p={5} backgroundColor={LIGHT_SHADE_COLOR} h={'100%'}>
                <Stack>
                    <Heading size={'md'} textAlign='center'>
                        {title}
                    </Heading>
                    {owner && (
                        <Text as='i' textAlign='center' >
                            {owner}
                        </Text> 
                    )}
                </Stack>
                <HStack alignSelf={'flex-start'} mt={isListed ? 4 : 6} mb={2}>
                    <Stack w='50%' h='100%' alignSelf={'flex-start'} >
                        {isListed ? (<>
                            <Text textAlign='start' >
                                {price} ETH
                            </Text>
                            {ethToUsdRate && (
                                <Text as='i' textAlign='start' >
                                    (~ ${Math.round(price * ethToUsdRate * 100) / 100})
                                </Text>
                            )}
                        </>) : isLoadingEthRate !== undefined && updateEthRate !== undefined ? (
                            <NFTCardListButton ethToUsdRate={ethToUsdRate} isLoadingEthRate={isLoadingEthRate} 
                                updateEthRate={updateEthRate} listingInfo={{itemId: itemId, tokenId: tokenId}}
                                updateNftList={updateNftList ?? (() => {})} />
                        ) : (
                            <Text>
                                Unlisted
                            </Text>
                        )}
                        
                    </Stack>
                    <Stack w='50%' h='100%' alignSelf={'center'} alignItems='flex-end' pr={6}>
                        <FavoriteIconButton isFavorited={isFavorited} onClick={() => {setIsFavorited(!isFavorited)}} />
                    </Stack>
                </HStack>
            </Box>
        </Box>
    );
}

type FavoriteIconButtonProps = {
    isFavorited: boolean, 
    onClick: () => void
}
const FavoriteIconButton = ({isFavorited, onClick}: FavoriteIconButtonProps) => {
    
    return (
        <Tooltip label={isFavorited ? 'Remove from favorites' : 'Add to favorites'} placement='top'>
            <Link w='fit-content'>
                <FiHeart color='red' fill={isFavorited ? 'red' : LIGHT_SHADE_COLOR} size={24} 
                    onClick={onClick} /> 
            </Link>
        </Tooltip>
    )
}

export default NFTCard;
