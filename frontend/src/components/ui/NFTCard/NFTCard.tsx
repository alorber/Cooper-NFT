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
import { LIGHT_SHADE_COLOR, NAVBAR_BORDER_COLOR } from '../../../COLORS';
import { NFTMarketItem } from '../../../services/marketplace_contract';

type NFTCardProps = {
    nft: NFTMarketItem
    ethToUsdRate: number
}

const NFTCard = ({nft, ethToUsdRate}: NFTCardProps) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const {name: title, file, owner, isListed, price} = nft;
    
    return (
        <Box w="300px" rounded="20px" overflow="hidden" mt={10}>
            <Image src= {URL.createObjectURL(file)} 
                boxSize="300px" objectFit={'contain'} backgroundColor={NAVBAR_BORDER_COLOR} />
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
                <HStack alignSelf={'flex-start'} mt={4} mb={2}>
                    <Stack w='50%' alignSelf={'flex-start'} >
                        {isListed ? (<>
                            <Text textAlign='start' >
                                {price} ETH
                            </Text>
                            <Text as='i' textAlign='start' >
                                (~ ${Math.round(price * ethToUsdRate * 100) / 100})
                            </Text>
                        </>) : (
                            <Text textAlign='start' pt={4} >
                                Unlisted
                            </Text>
                        )}
                        
                    </Stack>
                    <Stack w='50%' alignSelf={'center'} alignItems='flex-end' pr={6} pt={isListed ? 0 : 4}>
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
        <Tooltip label={isFavorited ? 'Remove from favorites' : 'Add to favorites'} placement='top' hasArrow>
            <Link w='fit-content'>
                <FiHeart color='red' fill={isFavorited ? 'red' : LIGHT_SHADE_COLOR} size={24} 
                    onClick={onClick} /> 
            </Link>
        </Tooltip>
    )
}

export default NFTCard;