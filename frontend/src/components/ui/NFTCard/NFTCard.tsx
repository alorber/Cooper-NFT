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

type NFTCardLayoutProps = {
    imageURL: string
    title: string,
    owner?: string,
    price: number,
    ethToUsdRate: number
}

const NFTCard = ({imageURL, title, owner, price, ethToUsdRate}: NFTCardLayoutProps) => {
    const [isFavorited, setIsFavorited] = useState(false);
    
    return (
        <Box w="300px" rounded="20px" overflow="hidden" mt={10}>
            <Image src= {imageURL} 
                boxSize="300px" objectFit={'contain'} backgroundColor={NAVBAR_BORDER_COLOR} />
            <Box p={5} backgroundColor={LIGHT_SHADE_COLOR}>
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
                <HStack alignSelf={'flex-start'} mt={4} mb={6}>
                    <Stack w='50%' alignSelf={'flex-start'} >
                        <Text textAlign='start' >
                            {price} ETH
                        </Text>
                        <Text as='i' textAlign='start' >
                            (~ ${price * ethToUsdRate})
                        </Text>
                    </Stack>
                    <Stack w='50%' alignSelf={'center'} alignItems='flex-end' pr={6}>
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