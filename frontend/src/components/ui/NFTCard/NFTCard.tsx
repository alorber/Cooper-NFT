import React from 'react';
import {
    Box,
    Heading,
    HStack,
    Image,
    Stack,
    Text
    } from '@chakra-ui/react';

type NFTCardLayoutProps = {
    imageURL: string
    title: string,
    creator?: string,
    price: number,
    ethToUsdRate: number
}

const NFTCard = ({imageURL, title, creator, price, ethToUsdRate}: NFTCardLayoutProps) => {
    return (
        <Box w="300px" rounded="20px" overflow="hidden" 
                bg={ "gray.200" } mt={10}>
            <Image src= {imageURL} 
                boxSize="300px" objectFit={'contain'} backgroundColor='gray.400' />
            <Box p={5}>
                <Stack>
                    <Heading size={'md'} textAlign='center'>
                        {title}
                    </Heading>
                    {creator && (
                        <Text as='i' textAlign='center' >
                            {creator}
                        </Text> 
                    )}
                </Stack>
                <HStack alignSelf={'flex-start'} mt={2} mb={6}>
                    <Stack w='50%' alignSelf={'flex-start'} >
                        <Text textAlign='start' >
                            {price} ETH
                        </Text>
                        <Text as='i' textAlign='start' >
                            (~ ${price * ethToUsdRate})
                        </Text>
                    </Stack>
                    <Stack w='50%' alignSelf={'center'}>
                        <Text textAlign='center' pl={10}>
                            Favorite Icon Here
                        </Text>
                    </Stack>
                </HStack>
            </Box>
        </Box>
    );
}

export default NFTCard;